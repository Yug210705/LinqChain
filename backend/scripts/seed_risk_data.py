"""Seed / re-seed the Risk & Audit and Approvals queues.

Creates a spread of demo recovery plans across the workflow states
(PENDING_AUDIT · PENDING_APPROVAL · APPROVED · COMPLETED) so the Risk & Audit
and Approvals pages always have data to work with.

* Offline mode (RESILIENCE_SQLITE=1) → writes to backend/data/resilience.db
* HANA mode → writes to HANA and mirrors rows into the cloud RES_* tables

Idempotent — safe to re-run at any time.

Run:
    cd backend
    venv/Scripts/python.exe scripts/seed_risk_data.py
    # or for offline:   RESILIENCE_SQLITE=1 venv/Scripts/python.exe scripts/seed_risk_data.py
"""
import sys
from collections import Counter
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.core.database import SessionLocal, engine  # noqa: E402
from app.core.runtime import res_audit, res_sync_plan, res_sync_scenarios  # noqa: E402
from app.models.db_models import RecoveryPlanRecord, ScenarioRecord  # noqa: E402

DEMO_PLANS = [
    dict(id="RP-DEMO-AUD1", disruption_id="SIM-F3382D", scenario_id=None,
         strategy="Activate SUP-004 (dual-source)", supplier_id="SUP-004",
         total_cost=84200.0, max_delay_days=3.0, blended_risk=0.47,
         total_sla_exposure=42500.0, final_score=128000.0, status="PENDING_AUDIT",
         details={"material_id": "MAT-004", "option": "DUAL_SOURCE",
                  "reasoning": "Dual-source SUP-004 + SUP-008 spreads the outage window across a certified backup."}),
    dict(id="RP-DEMO-AUD2", disruption_id="SIM-F3382D", scenario_id=None,
         strategy="Activate SUP-012 (fast lane)", supplier_id="SUP-012",
         total_cost=91500.0, max_delay_days=2.0, blended_risk=0.41,
         total_sla_exposure=0.0, final_score=158000.0, status="PENDING_AUDIT",
         details={"material_id": "MAT-004", "option": "FAST_LANE",
                  "reasoning": "Fast-lane carrier restores most penalized customer orders within 2 days."}),
    dict(id="RP-DEMO-APP1", disruption_id="SIM-F3382D", scenario_id=None,
         strategy="Activate SUP-003", supplier_id="SUP-003",
         total_cost=88740.0, max_delay_days=3.0, blended_risk=0.52,
         total_sla_exposure=12000.0, final_score=141000.0, status="PENDING_APPROVAL",
         details={"material_id": "MAT-004", "option": "EXISTING_CONTRACT",
                  "reasoning": "SUP-003 already supplies MAT-004 under framework agreement."}),
    dict(id="RP-DEMO-APP2", disruption_id="SIM-8831E5", scenario_id=None,
         strategy="Activate SUP-007", supplier_id="SUP-007",
         total_cost=76012.0, max_delay_days=4.0, blended_risk=0.565,
         total_sla_exposure=0.0, final_score=128500.0, status="PENDING_APPROVAL",
         details={"material_id": "MAT-007", "option": "SUP-007",
                  "reasoning": "Proven supplier with surplus weekly capacity of 18,000 units."}),
    dict(id="RP-DEMO-APR", disruption_id="SIM-F3382D", scenario_id=None,
         strategy="Activate SUP-008", supplier_id="SUP-008",
         total_cost=96250.0, max_delay_days=4.0, blended_risk=0.49,
         total_sla_exposure=0.0, final_score=132000.0, status="APPROVED",
         details={"material_id": "MAT-004", "option": "SUP-008",
                  "reasoning": "SUP-008 approved and awaiting SAP execution."}),
    dict(id="RP-DEMO-COMP", disruption_id="SIM-8831E5", scenario_id=None,
         strategy="Activate SUP-008 (completed)", supplier_id="SUP-008",
         total_cost=95800.0, max_delay_days=4.0, blended_risk=0.42,
         total_sla_exposure=0.0, final_score=135000.0, status="COMPLETED",
         details={"material_id": "MAT-007", "option": "SUP-008",
                  "reasoning": "Executed and confirmed in SAP ERP (BAPI_PO_CREATE1)."}),
]


def main():
    session = SessionLocal()
    is_sqlite = "sqlite" in str(engine.url)

    created = 0
    for p in DEMO_PLANS:
        if session.get(RecoveryPlanRecord, p["id"]):
            continue
        session.add(RecoveryPlanRecord(**p))
        created += 1
    session.commit()

    all_plans = session.query(RecoveryPlanRecord).order_by(RecoveryPlanRecord.created_at.desc()).all()
    all_scns = session.query(ScenarioRecord).all()

    if not is_sqlite:
        # Mirror the full queues into the HANA cloud schema tables
        for plan in all_plans:
            res_sync_plan(session, plan)
        res_sync_scenarios(session, all_scns)
        res_audit(session, "SEED_DATA_LOADED", details={"plans": len(all_plans), "scenarios": len(all_scns)})
        print("[HANA mode] mirrored RES_* cloud tables")
    else:
        print("[sqlite mode] skipped RES_* cloud mirror")

    print(f"seeded/upheld plans: {created} new · {len(all_plans)} total · "
          f"statuses: {dict(Counter(p.status for p in all_plans))}")
    session.close()


if __name__ == "__main__":
    main()