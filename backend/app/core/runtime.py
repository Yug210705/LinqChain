"""Shared runtime helpers: logging, TTL caches, the HANA-cloud RES_* mirror
bridge, and the boot-time supply-chain graph pre-warm."""
import functools as _functools
import json
import threading as _threading
import time as _time
import uuid as _uuid
from datetime import datetime as _dt

import structlog
from sqlalchemy import text as _res_text
from sqlalchemy.orm import Session

logger = structlog.get_logger("resilience")

# ------------------------------------------------------------------ caches
_response_cache: dict = {}
_list_cache: dict = {}


def cached(key: str, ttl: float, fn):
    """TTL-cached computation (used for slow HANA-backed views: graph payload, lists)."""
    entry = _response_cache.get(key)
    now = _time.time()
    if entry and now - entry[0] < ttl:
        return entry[1]
    value = fn()
    _response_cache[key] = (now, value)
    return value


def cache_drop(*keys: str):
    for k in keys:
        _response_cache.pop(k, None)


def cached_list(ttl: float):
    """Decorator: cache a sync-body GET list endpoint keyed by its query kwargs."""

    def deco(fn):
        @_functools.wraps(fn)
        async def wrapper(*args, **kwargs):
            key = (fn.__name__,) + tuple(sorted((k, v) for k, v in kwargs.items() if k != "db"))
            entry = _list_cache.get(key)
            now = _time.time()
            if entry and now - entry[0] < ttl:
                return entry[1]
            value = await fn(*args, **kwargs)
            _list_cache[key] = (now, value)
            return value

        return wrapper

    return deco


def invalidate_lists():
    _list_cache.clear()


# -------------------------------------------- HANA cloud RES_* mirror bridge
#
# Every workflow write (plan created / status changed / scenarios generated /
# pipeline run) is mirrored into the cloud schema tables RES_AUDIT_RECORDS,
# RES_RECOVERY_PLANS and RES_SCENARIOS so the SAP HANA side always carries
# data. Every call is guarded — a mirror failure never breaks the main flow.
# On sqlite (offline mode) these tables don't exist and the calls no-op via the
# try/except below.


def res_insert(db: Session, table: str, mapping: dict):
    cols = ",".join(f'"{k.upper()}"' for k in mapping)
    placeholders = ",".join(f":{k}" for k in mapping)
    db.execute(_res_text(f"INSERT INTO \"{table}\" ({cols}) VALUES ({placeholders})"), mapping)
    db.commit()


def res_audit(db: Session, action: str, scenario_id=None, plan_id=None, details=None):
    try:
        res_insert(db, "RES_AUDIT_RECORDS", {
            "AUDIT_ID": f"AUD-{_uuid.uuid4().hex[:8].upper()}",
            "SCENARIO_ID": scenario_id,
            "RECOVERY_PLAN_ID": plan_id,
            "ACTION": action[:255],
            "TIMESTAMP": _dt.utcnow(),
            "DETAILS": json.dumps(details or {}, default=str)[:255],
        })
    except Exception as e:
        logger.warning("RES_AUDIT_RECORDS mirror failed", error=str(e))


def res_plan_status(status: str) -> str:
    """Map app workflow statuses to the cloud RES_RECOVERY_PLANS.STATUS (NVARCHAR(11))."""
    return {
        "PENDING_AUDIT": "REVIEW",
        "PENDING_APPROVAL": "PENDING",
        "APPROVED": "APPROVED",
        "COMPLETED": "COMPLETED",
        "REJECTED": "REJECTED",
    }.get(status, (status or "REVIEW")[:11])


def res_scenario_status(status: str) -> str:
    """Map app scenario statuses to the cloud RES_SCENARIOS.STATUS (NVARCHAR(9))."""
    return {
        "READY": "READY",
        "SIMULATING": "RUNNING",
        "SELECTED": "SELECTED",
        "ARCHIVED": "ARCHIVED",
    }.get(status, (status or "READY")[:9])


def res_sync_plan(db: Session, plan):
    """Insert or update the matching row in RES_RECOVERY_PLANS (FK-safe)."""
    try:
        existing_scenario = None
        if plan.scenario_id:
            existing_scenario = db.execute(
                _res_text('SELECT 1 FROM "RES_SCENARIOS" WHERE "SCENARIO_ID" = :s'), {"s": plan.scenario_id}
            ).first()
        scenario_id = plan.scenario_id if existing_scenario else None
        exists = db.execute(
            _res_text('SELECT 1 FROM "RES_RECOVERY_PLANS" WHERE "PLAN_ID" = :p'), {"p": plan.id}
        ).first()
        details = plan.details if isinstance(plan.details, dict) else {}
        mapping = {
            "PLAN_ID": plan.id,
            "SCENARIO_ID": scenario_id,
            "DESCRIPTION": (f"Recovery plan {plan.disruption_id} — {plan.strategy}")[:255],
            "ACTION_TYPE": (plan.strategy or "")[:22],
            "ACTION_DETAILS": json.dumps({
                "supplier_id": plan.supplier_id,
                "disruption_id": plan.disruption_id,
                "max_delay_days": plan.max_delay_days,
                "blended_risk": plan.blended_risk,
            }, default=str)[:255],
            "ESTIMATED_COST": float(plan.total_cost or 0.0),
            "MITIGATED_RISK_VALUE": float(plan.blended_risk or 0.0),
            "STATUS": res_plan_status(plan.status),
            "AI_REASONING": (str(details.get("reasoning") or ""))[:255] or None,
        }
        if exists:
            sets = ",".join(f'"{k.upper()}" = :{k}' for k in mapping if k != "PLAN_ID")
            db.execute(_res_text(f'UPDATE "RES_RECOVERY_PLANS" SET {sets} WHERE "PLAN_ID" = :PLAN_ID'), mapping)
        else:
            res_insert(db, "RES_RECOVERY_PLANS", mapping)
        db.commit()
    except Exception as e:
        logger.warning("RES_RECOVERY_PLANS mirror failed", error=str(e))


def res_sync_scenarios(db: Session, scenarios: list):
    for s in scenarios:
        try:
            exists = db.execute(
                _res_text('SELECT 1 FROM "RES_SCENARIOS" WHERE "SCENARIO_ID" = :p'), {"p": s.id}
            ).first()
            if exists:
                continue
            res_insert(db, "RES_SCENARIOS", {
                "SCENARIO_ID": s.id,
                "NAME": s.name[:255],
                "STATUS": res_scenario_status(s.status),
                "CREATED_AT": s.created_at or _dt.utcnow(),
            })
        except Exception as e:
            logger.warning("RES_SCENARIOS mirror failed", error=str(e))


# --------------------------------------- boot-time supply-chain graph pre-warm


def _graph_payload(db):
    """Serialize the compiled topology graph into the /api/supply-chain/graph shape."""
    from app.services.impact_service import get_graph as _get_graph
    G = _get_graph(db)
    nodes = [{"id": n, **G.nodes[n]} for n in G.nodes()]
    edges = [{"source": u, "target": v, "type": G.edges[u, v].get("type")} for u, v in G.edges()]
    return {"nodes": nodes, "edges": edges}


def _warm_graph():
    try:
        from app.core.database import SessionLocal
        db = SessionLocal()
        try:
            from app.services.impact_service import get_graph
            get_graph(db)
        finally:
            db.close()
        print("[startup] supply-chain graph pre-warmed")
    except Exception as exc:
        print("[startup] graph pre-warm failed:", exc)


def start_prewarm() -> None:
    """Kick off the background graph build at boot (HANA build can take ~30s)."""
    _threading.Thread(target=_warm_graph, daemon=True).start()