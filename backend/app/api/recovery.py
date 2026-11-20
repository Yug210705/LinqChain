"""Recovery & AI Orchestration API — recovery options, persisted plans with a
state machine, the 6-step pipeline + audit trails, and scenarios."""
import asyncio
import json
import os
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from app.core import config
from app.core.database import get_db
from app.core.auth import require_permission
from app.core.runtime import (
    cached_list,
    invalidate_lists,
    res_audit as _res_audit,
    res_insert as _res_insert,
    res_sync_plan as _res_sync_plan,
    res_sync_scenarios as _res_sync_scenarios,
)
from app.models.db_models import RecoveryPlanRecord, ScenarioRecord
from app.models.schemas import (
    CreateRecoveryPlanRequest,
    GenerateScenariosRequest,
    RecoveryPlanListResponse,
    RecoveryPlanResponse,
    ScenarioListResponse,
    ScenarioResponse,
    UpdateScenarioStatusRequest,
    UpdateStatusRequest,
)
from app.services.orchestrator import (
    AuditLog,
    RecoveryPlansResponse,
    get_recovery_plans,
    logger,
    run_recovery_pipeline,
)

router = APIRouter(tags=["Recovery & AI"])


@router.get("/api/recovery/options", response_model=RecoveryPlansResponse, summary="Get Recovery Options", description="Generates deterministic recovery options based on SAP supply data.")
async def api_get_recovery_options(material_id: str = "MAT-12", _user=Depends(require_permission("recovery", "view_options"))):
    try:
        return await get_recovery_plans(material_id)
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))


@router.post("/api/recovery/plans", response_model=RecoveryPlanResponse, summary="Create Recovery Plan")
async def api_create_recovery_plan(req: CreateRecoveryPlanRequest, db: Session = Depends(get_db), _user=Depends(require_permission("recovery", "create_plan"))):
    invalidate_lists()
    try:
        # INVARIANT 5: Reject stale/archived/invalid scenario selection
        if req.scenario_id:
            scenario = db.query(ScenarioRecord).filter(ScenarioRecord.id == req.scenario_id).first()
            if not scenario:
                raise HTTPException(status_code=404, detail=f"Scenario {req.scenario_id} not found")
            if scenario.status == "ARCHIVED":
                raise HTTPException(status_code=422, detail="Cannot create Recovery Plan from an ARCHIVED scenario")

        # Generate plans on the fly to find the matching one to persist
        options_res = await get_recovery_plans(req.material_id)

        # Find the specific option the user chose (matching option_id)
        selected_option = next((p for p in options_res.ranked_plans if p.get("id") == req.option_id), None)

        if not selected_option:
            raise HTTPException(status_code=422, detail=f"Invalid recovery option: {req.option_id} not valid for material {req.material_id}")

        suppliers_used = selected_option.get("suppliers_used", [])
        supplier_id_str = ",".join(suppliers_used) if suppliers_used else "Unknown"

        # IDEMPOTENCY GUARD
        if req.scenario_id:
            existing_plan = db.query(RecoveryPlanRecord).filter(RecoveryPlanRecord.scenario_id == req.scenario_id).first()
            if existing_plan:
                return RecoveryPlanResponse(
                    id=existing_plan.id,
                    disruption_id=existing_plan.disruption_id,
                    strategy=existing_plan.strategy,
                    supplier_id=existing_plan.supplier_id,
                    total_cost=existing_plan.total_cost,
                    max_delay_days=existing_plan.max_delay_days,
                    blended_risk=existing_plan.blended_risk,
                    total_sla_exposure=existing_plan.total_sla_exposure,
                    final_score=existing_plan.final_score,
                    status=existing_plan.status,
                    created_at=existing_plan.created_at,
                    details=existing_plan.details
                )

        # Create persistent record
        plan = RecoveryPlanRecord(
            disruption_id=req.disruption_id,
            scenario_id=req.scenario_id,
            strategy=f"Activate {supplier_id_str}",
            supplier_id=supplier_id_str,
            total_cost=selected_option["total_cost"],
            max_delay_days=selected_option["max_delay_days"],
            blended_risk=selected_option["blended_risk"],
            total_sla_exposure=selected_option.get("total_sla_exposure", 0.0),
            final_score=selected_option["final_score"],
            details=selected_option
        )

        db.add(plan)
        db.commit()
        db.refresh(plan)

        # Mirror into the HANA cloud plan + audit tables
        try:
            _res_sync_plan(db, plan)
            _res_audit(db, "RECOVERY_PLAN_CREATED", scenario_id=plan.scenario_id, plan_id=plan.id,
                       details={"strategy": plan.strategy, "supplier_id": plan.supplier_id, "total_cost": plan.total_cost})
        except Exception as e_a:
            logger.warning("RES table mirror failed", error=str(e_a))

        return RecoveryPlanResponse(
            id=plan.id,
            disruption_id=plan.disruption_id,
            strategy=plan.strategy,
            supplier_id=plan.supplier_id,
            total_cost=plan.total_cost,
            max_delay_days=plan.max_delay_days,
            blended_risk=plan.blended_risk,
            total_sla_exposure=plan.total_sla_exposure,
            final_score=plan.final_score,
            status=plan.status,
            created_at=plan.created_at,
            details=plan.details
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/api/recovery/plans", response_model=RecoveryPlanListResponse, summary="List Persisted Recovery Plans")
@cached_list(10.0)
async def api_list_recovery_plans(
    limit: int = 50,
    offset: int = 0,
    status: Optional[str] = None,
    search: Optional[str] = None,
    disruption_id: Optional[str] = None,
    db: Session = Depends(get_db),
    _user=Depends(require_permission("recovery", "view_options"))
):
    from sqlalchemy import func, or_

    base_q = db.query(RecoveryPlanRecord)

    if disruption_id:
        base_q = base_q.filter(RecoveryPlanRecord.disruption_id == disruption_id)

    if status:
        status_list = [s.strip() for s in status.split(",") if s.strip()]
        base_q = base_q.filter(RecoveryPlanRecord.status.in_(status_list))

    if search:
        term = f"%{search.lower()}%"
        base_q = base_q.filter(
            or_(
                func.lower(RecoveryPlanRecord.id).like(term),
                func.lower(RecoveryPlanRecord.disruption_id).like(term),
                func.lower(RecoveryPlanRecord.strategy).like(term),
                func.lower(RecoveryPlanRecord.supplier_id).like(term)
            )
        )

    total = base_q.count()
    page_rows = base_q.order_by(RecoveryPlanRecord.created_at.desc()).offset(offset).limit(limit).all()

    # KPIs over ALL records (global totals unless a disruption context is applied)
    all_q = db.query(RecoveryPlanRecord)
    if disruption_id:
        all_q = all_q.filter(RecoveryPlanRecord.disruption_id == disruption_id)

    total_active = all_q.count()
    total_pending_audit = all_q.filter(RecoveryPlanRecord.status == "PENDING_AUDIT").count()
    total_pending_approval = all_q.filter(RecoveryPlanRecord.status == "PENDING_APPROVAL").count()
    total_completed = all_q.filter(RecoveryPlanRecord.status == "COMPLETED").count()

    # aggregate_plan_cost = sum of recovery procurement costs across all plans
    plan_cost_result = all_q.with_entities(func.sum(RecoveryPlanRecord.total_cost)).scalar()
    aggregate_plan_cost = float(plan_cost_result or 0.0)

    # aggregate_sla_exposure = sum of SLA penalty exposure across all plans
    sla_result = all_q.with_entities(func.sum(RecoveryPlanRecord.total_sla_exposure)).scalar()
    aggregate_sla_exposure = float(sla_result or 0.0)

    # aggregate_exposure = aggregate_plan_cost (backward compat alias kept in schema)
    aggregate_exposure = aggregate_plan_cost

    items = [
        RecoveryPlanResponse(
            id=p.id,
            disruption_id=p.disruption_id,
            strategy=p.strategy,
            supplier_id=p.supplier_id,
            total_cost=p.total_cost,
            max_delay_days=p.max_delay_days,
            blended_risk=p.blended_risk,
            total_sla_exposure=p.total_sla_exposure,
            final_score=p.final_score,
            status=p.status,
            created_at=p.created_at,
            details=p.details
        ) for p in page_rows
    ]

    return RecoveryPlanListResponse(
        items=items,
        total=total,
        limit=limit,
        offset=offset,
        has_more=(offset + limit) < total,
        total_active=total_active,
        total_pending_audit=total_pending_audit,
        total_pending_approval=total_pending_approval,
        total_completed=total_completed,
        aggregate_plan_cost=aggregate_plan_cost,
        aggregate_sla_exposure=aggregate_sla_exposure,
        aggregate_exposure=aggregate_exposure
    )


@router.get("/api/recovery/plans/{plan_id}", response_model=RecoveryPlanResponse, summary="Get Single Recovery Plan")
async def api_get_recovery_plan(plan_id: str, db: Session = Depends(get_db), _user=Depends(require_permission("recovery", "view_options"))):
    plan = db.query(RecoveryPlanRecord).filter(RecoveryPlanRecord.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Recovery Plan not found")
    return RecoveryPlanResponse(
        id=plan.id,
        disruption_id=plan.disruption_id,
        strategy=plan.strategy,
        supplier_id=plan.supplier_id,
        total_cost=plan.total_cost,
        max_delay_days=plan.max_delay_days,
        blended_risk=plan.blended_risk,
        total_sla_exposure=plan.total_sla_exposure,
        final_score=plan.final_score,
        status=plan.status,
        created_at=plan.created_at,
        details=plan.details
    )


@router.put("/api/recovery/plans/{plan_id}/status", response_model=RecoveryPlanResponse, summary="Update Plan Status")
async def api_update_plan_status(plan_id: str, req: UpdateStatusRequest, db: Session = Depends(get_db), _user=Depends(require_permission("recovery", "approve"))):
    invalidate_lists()
    plan = db.query(RecoveryPlanRecord).filter(RecoveryPlanRecord.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Recovery Plan not found")

    # State Machine Rules
    valid_transitions = {
        "PENDING_AUDIT": ["PENDING_APPROVAL", "APPROVED", "REJECTED"],
        "PENDING_APPROVAL": ["APPROVED", "REJECTED"],
        "APPROVED": ["COMPLETED", "REJECTED"],
        "COMPLETED": [],
        "REJECTED": []
    }

    current = plan.status
    target = req.status

    # Idempotency guard: re-applying the current status is a no-op success —
    # NOT an error. This kills the misleading "Failed to update status" alert
    # that fired on double-clicks / stale UI snapshots (e.g. COMPLETED→COMPLETED).
    transitioned = target != current
    if transitioned:
        if target not in valid_transitions.get(current, []):
            raise HTTPException(status_code=422, detail=f"Invalid transition from {current} to {target}")
        plan.status = target
        db.commit()
        db.refresh(plan)

    # Mirror into the HANA cloud audit + plan tables
    try:
        _res_audit(db, f"STATUS:{current}->{plan.status}", scenario_id=plan.scenario_id, plan_id=plan.id,
                   details={"strategy": plan.strategy, "supplier_id": plan.supplier_id})
        _res_sync_plan(db, plan)
    except Exception as e_a:
        logger.warning("RES table mirror failed", error=str(e_a))

    # Execute SAP BAPI / CAP Purchase Order creation when plan is APPROVED
    if target == "APPROVED" and transitioned:
        try:
            from app.services.orchestrator import execute_sap_action
            plan_data = plan.details or {
                "id": plan.id,
                "disruption_id": plan.disruption_id,
                "supplier_id": plan.supplier_id,
                "total_cost": plan.total_cost
            }
            await execute_sap_action(plan_data)
        except Exception as e_bapi:
            logger.error("Failed to execute BAPI on plan approval", error=str(e_bapi))
    return RecoveryPlanResponse(
        id=plan.id,
        disruption_id=plan.disruption_id,
        strategy=plan.strategy,
        supplier_id=plan.supplier_id,
        total_cost=plan.total_cost,
        max_delay_days=plan.max_delay_days,
        blended_risk=plan.blended_risk,
        total_sla_exposure=plan.total_sla_exposure,
        final_score=plan.final_score,
        status=plan.status,
        created_at=plan.created_at,
        details=plan.details
    )


@router.post("/run-recovery", response_model=AuditLog, summary="Run Full Recovery Pipeline", description="Executes the 6-step detect/optimize/explain/validate/act/audit pipeline.")
async def run_recovery(response: Response, material_id: str = "MAT-12", db: Session = Depends(get_db), _user=Depends(require_permission("recovery", "run_pipeline"))):
    import time
    start = time.time()
    audit_log = await run_recovery_pipeline(material_id)
    # Mirror the pipeline execution into the HANA cloud audit table
    try:
        _res_audit(db, "PIPELINE_RUN", plan_id=(audit_log.recommended_plan or {}).get("id"),
                   details={"run_id": audit_log.run_id, "material_id": material_id,
                            "agentic_retries": audit_log.agentic_retries,
                            "guardrail_stripped": audit_log.guardrail_stripped})
    except Exception:
        pass
    response.headers["X-Resilience-Latency-Ms"] = str(int((time.time() - start) * 1000))
    response.headers["X-Agentic-Retries"] = str(audit_log.agentic_retries)
    return audit_log


@router.get("/run-recovery/{run_id}", response_model=AuditLog, summary="Retrieve Audit Trail", description="Fetches the exact IO logged during a specific recovery pipeline execution.")
async def get_recovery_audit(run_id: str, _user=Depends(require_permission("audit", "view"))):
    log_path = config.LOG_DIR / f"{run_id}.json"
    if not log_path.exists():
        raise HTTPException(status_code=404, detail="Audit log not found")
    with open(log_path, "r") as f:
        return json.load(f)


@router.get("/api/audit/runs", summary="List Recovery Pipeline Audit Runs", description="Lists all persisted run-recovery audit trails (logs/*.json), newest first.")
async def list_audit_runs(limit: int = 50, offset: int = 0, _user=Depends(require_permission("audit", "view"))):
    candidates = [
        str(config.LOG_DIR),
        os.path.join(config.BACKEND_DIR, "logs_legacy"),
        os.path.join(os.getcwd(), "logs"),
    ]
    logs_dir = next((p for p in candidates if os.path.isdir(p)), None)
    entries = []
    if logs_dir:
        for fname in sorted(os.listdir(logs_dir), reverse=True):
            if not fname.endswith(".json"):
                continue
            try:
                with open(os.path.join(logs_dir, fname), "r") as f:
                    data = json.load(f)
                entries.append({
                    "run_id": data.get("run_id"),
                    "timestamp": data.get("timestamp"),
                    "material_id": data.get("material_id"),
                    "recommended_plan": data.get("recommended_plan"),
                    "ranked_plans": data.get("ranked_plans", []),
                    "llm_explanation": data.get("llm_explanation"),
                    "guardrail_stripped": data.get("guardrail_stripped"),
                    "agentic_retries": data.get("agentic_retries", 0),
                    "sap_action_result": data.get("sap_action_result"),
                })
            except Exception:
                continue
    return {"items": entries[offset:offset + limit], "total": len(entries)}


@router.post("/api/scenarios/generate", response_model=List[ScenarioResponse], summary="Generate Scenarios from Disruption")
async def api_generate_scenarios(req: GenerateScenariosRequest, force: bool = False, db: Session = Depends(get_db), _user=Depends(require_permission("scenarios", "generate"))):
    invalidate_lists()
    try:
        # IDEMPOTENCY GUARD: Check for existing active (READY/SIMULATING) scenarios for this disruption.
        existing_active = db.query(ScenarioRecord).filter(
            ScenarioRecord.disruption_id == req.disruption_id,
            ScenarioRecord.status.in_(["READY", "SIMULATING"])
        ).all()

        if existing_active and not force:
            return [
                ScenarioResponse(
                    id=s.id, name=s.name, disruption_id=s.disruption_id,
                    strategy=s.strategy, supplier_id=s.supplier_id,
                    total_cost=s.total_cost, max_delay_days=s.max_delay_days,
                    blended_risk=s.blended_risk, total_sla_exposure=s.total_sla_exposure,
                    final_score=s.final_score, status=s.status,
                    created_at=s.created_at, updated_at=s.updated_at, details=s.details
                ) for s in existing_active
            ]

        # If force=True, archive the previous active batch before generating a new one.
        if existing_active and force:
            for s in existing_active:
                if s.status in ("READY", "SIMULATING"):
                    s.status = "ARCHIVED"
            db.commit()

        # Generate fresh scenarios from the recovery engine.
        options_res = await get_recovery_plans(req.material_id)
        new_scenarios = []

        for i, option in enumerate(options_res.ranked_plans):
            suppliers_used = option.get("suppliers_used", [])
            supplier_id_str = ",".join(suppliers_used) if suppliers_used else "Unknown"

            if len(suppliers_used) > 1:
                name = f"Dual-Source Activation (V{i+1})"
                strategy = f"Activate {supplier_id_str}"
            elif option.get("max_delay_days", 0) > 7:
                name = f"Inventory Reallocation (V{i+1})"
                strategy = f"Reallocate to {supplier_id_str}"
            else:
                name = f"Alternate Supplier Shift (V{i+1})"
                strategy = f"Activate {supplier_id_str}"

            record = ScenarioRecord(
                name=name,
                disruption_id=req.disruption_id,
                strategy=strategy,
                supplier_id=supplier_id_str,
                total_cost=option.get("total_cost", 0),
                max_delay_days=option.get("max_delay_days", 0),
                blended_risk=option.get("blended_risk", 0),
                total_sla_exposure=option.get("total_sla_exposure", 0),
                final_score=option.get("final_score", 0),
                status="READY",
                details=option
            )
            db.add(record)
            new_scenarios.append(record)

        db.commit()
        for s in new_scenarios:
            db.refresh(s)

        # Mirror the generated scenarios into the HANA cloud table
        try:
            _res_sync_scenarios(db, new_scenarios)
            _res_audit(db, "SCENARIOS_GENERATED", scenario_id=new_scenarios[0].id if new_scenarios else None,
                       details={"disruption_id": req.disruption_id, "count": len(new_scenarios)})
        except Exception as e_a:
            logger.warning("RES scenario mirror failed", error=str(e_a))

        return [
            ScenarioResponse(
                id=s.id, name=s.name, disruption_id=s.disruption_id,
                strategy=s.strategy, supplier_id=s.supplier_id,
                total_cost=s.total_cost, max_delay_days=s.max_delay_days,
                blended_risk=s.blended_risk, total_sla_exposure=s.total_sla_exposure,
                final_score=s.final_score, status=s.status,
                created_at=s.created_at, updated_at=s.updated_at, details=s.details
            ) for s in new_scenarios
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/api/scenarios", response_model=ScenarioListResponse, summary="List Scenarios (paginated)")
@cached_list(10.0)
async def api_list_scenarios(
    limit: int = 50,
    offset: int = 0,
    status: Optional[str] = None,         # e.g. "READY" or "READY,SIMULATING"
    search: Optional[str] = None,          # searches id, name, strategy, disruption_id
    disruption_id: Optional[str] = None,
    db: Session = Depends(get_db),
    _user=Depends(require_permission("scenarios", "view"))
):
    from sqlalchemy import func, or_

    # --- Build filtered base query (for count + current page) ---
    base_q = db.query(ScenarioRecord)

    if disruption_id:
        base_q = base_q.filter(ScenarioRecord.disruption_id == disruption_id)

    if status:
        status_list = [s.strip() for s in status.split(",") if s.strip()]
        base_q = base_q.filter(ScenarioRecord.status.in_(status_list))

    if search:
        term = f"%{search.lower()}%"
        base_q = base_q.filter(
            or_(
                func.lower(ScenarioRecord.id).like(term),
                func.lower(ScenarioRecord.name).like(term),
                func.lower(ScenarioRecord.strategy).like(term),
                func.lower(ScenarioRecord.disruption_id).like(term),
            )
        )

    total = base_q.count()
    page_rows = base_q.order_by(ScenarioRecord.created_at.desc()).offset(offset).limit(limit).all()

    # --- Server-side aggregate KPIs (over ALL records, unfiltered by page) ---
    all_q = db.query(ScenarioRecord)
    total_ready = all_q.filter(ScenarioRecord.status == "READY").count()
    total_simulating = all_q.filter(ScenarioRecord.status == "SIMULATING").count()
    total_selected = all_q.filter(ScenarioRecord.status == "SELECTED").count()
    total_active = total_ready + total_simulating

    # Aggregate SLA exposure for active scenarios via DB
    active_exposure_result = db.query(func.sum(ScenarioRecord.total_sla_exposure)).filter(
        ScenarioRecord.status.in_(["READY", "SIMULATING"])
    ).scalar()
    aggregate_sla_exposure = float(active_exposure_result or 0.0)

    items = [
        ScenarioResponse(
            id=s.id, name=s.name, disruption_id=s.disruption_id,
            strategy=s.strategy, supplier_id=s.supplier_id,
            total_cost=s.total_cost, max_delay_days=s.max_delay_days,
            blended_risk=s.blended_risk, total_sla_exposure=s.total_sla_exposure,
            final_score=s.final_score, status=s.status,
            created_at=s.created_at, updated_at=s.updated_at, details=s.details
        ) for s in page_rows
    ]

    return ScenarioListResponse(
        items=items,
        total=total,
        limit=limit,
        offset=offset,
        has_more=(offset + limit) < total,
        total_active=total_active,
        total_simulating=total_simulating,
        total_ready=total_ready,
        total_selected=total_selected,
        aggregate_sla_exposure=aggregate_sla_exposure,
    )


@router.get("/api/scenarios/{scenario_id}", response_model=ScenarioResponse, summary="Get Scenario")
async def api_get_scenario(scenario_id: str, db: Session = Depends(get_db), _user=Depends(require_permission("scenarios", "view"))):
    s = db.query(ScenarioRecord).filter(ScenarioRecord.id == scenario_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Scenario not found")
    return ScenarioResponse(
        id=s.id,
        name=s.name,
        disruption_id=s.disruption_id,
        strategy=s.strategy,
        supplier_id=s.supplier_id,
        total_cost=s.total_cost,
        max_delay_days=s.max_delay_days,
        blended_risk=s.blended_risk,
        total_sla_exposure=s.total_sla_exposure,
        final_score=s.final_score,
        status=s.status,
        created_at=s.created_at,
        updated_at=s.updated_at,
        details=s.details
    )


@router.put("/api/scenarios/{scenario_id}/status", response_model=ScenarioResponse)
async def api_update_scenario_status(scenario_id: str, req: UpdateScenarioStatusRequest, db: Session = Depends(get_db), _user=Depends(require_permission("scenarios", "update_status"))):
    invalidate_lists()
    s = db.query(ScenarioRecord).filter(ScenarioRecord.id == scenario_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Scenario not found")

    # Invariant: Only READY scenarios can be SELECTED
    if req.status == "SELECTED" and s.status != "READY":
        raise HTTPException(status_code=422, detail=f"Cannot transition scenario from {s.status} to SELECTED")

    # Invariant: ARCHIVED scenarios cannot be transitioned back to active states
    if s.status == "ARCHIVED" and req.status in ["READY", "SIMULATING"]:
        raise HTTPException(status_code=422, detail="Cannot reactivate an ARCHIVED scenario")

    s.status = req.status
    db.commit()
    db.refresh(s)

    return ScenarioResponse(
        id=s.id,
        name=s.name,
        disruption_id=s.disruption_id,
        strategy=s.strategy,
        supplier_id=s.supplier_id,
        total_cost=s.total_cost,
        max_delay_days=s.max_delay_days,
        blended_risk=s.blended_risk,
        total_sla_exposure=s.total_sla_exposure,
        final_score=s.final_score,
        status=s.status,
        created_at=s.created_at,
        updated_at=s.updated_at,
        details=s.details
    )