import os
import json
import uuid
from datetime import datetime, timezone
from dotenv import load_dotenv

load_dotenv()
from app.core.database import SessionLocal, engine
from app.models.db_models import RecoveryPlanRecord, ScenarioRecord

def seed_plans():
    db = SessionLocal()
    print("Seeding initial Scenarios and Recovery Plans to Supabase...")

    # Clear existing if any
    db.query(RecoveryPlanRecord).delete()
    db.query(ScenarioRecord).delete()
    db.commit()

    disruption_id = "SIM-DISRUPT-001"

    # 1. Scenarios
    scenarios = [
        ScenarioRecord(
            id="SCN-001-ALPHA",
            name="Emergency Sourcing: Apex Silicon Foundry",
            disruption_id=disruption_id,
            strategy="Primary allocation switch to SUP-001 (Apex Silicon)",
            supplier_id="SUP-001",
            total_cost=245000.0,
            max_delay_days=3.5,
            blended_risk=0.18,
            total_sla_exposure=150000.0,
            final_score=0.92,
            status="READY",
            details={
                "allocated_units": 5000,
                "unit_cost": 49.0,
                "air_freight_expedite": True,
                "confidence": 0.94,
                "summary": "Full demand fulfilled via expedited air transit from Taiwan hub with minimal factory downtime."
            }
        ),
        ScenarioRecord(
            id="SCN-002-BETA",
            name="Split Dual-Supplier Routing: Nordic & Bavaria",
            disruption_id=disruption_id,
            strategy="Split 60% SUP-002 (Nordic) + 40% SUP-004 (Bavaria)",
            supplier_id="SUP-002",
            total_cost=310000.0,
            max_delay_days=5.0,
            blended_risk=0.14,
            total_sla_exposure=120000.0,
            final_score=0.88,
            status="SIMULATING",
            details={
                "allocated_units": 5000,
                "split_ratio": "60/40",
                "risk_mitigation": "Reduces dependency on Asian shipping routes during maritime congestion.",
                "confidence": 0.89
            }
        ),
        ScenarioRecord(
            id="SCN-003-GAMMA",
            name="Inventory Buffer Rebalance: Stuttgart Assembly",
            disruption_id=disruption_id,
            strategy="Internal safety stock transfer from Plant 1 to Plant 2",
            supplier_id="SUP-003",
            total_cost=98000.0,
            max_delay_days=7.0,
            blended_risk=0.28,
            total_sla_exposure=280000.0,
            final_score=0.81,
            status="READY",
            details={
                "allocated_units": 3500,
                "transit_mode": "RAIL",
                "confidence": 0.82
            }
        ),
        ScenarioRecord(
            id="SCN-004-DELTA",
            name="Rapid Air Bridge: Shenzhen Express",
            disruption_id=disruption_id,
            strategy="Direct air charter delivery from Shenzhen Precision",
            supplier_id="SUP-003",
            total_cost=420000.0,
            max_delay_days=2.0,
            blended_risk=0.32,
            total_sla_exposure=50000.0,
            final_score=0.76,
            status="READY",
            details={
                "allocated_units": 5000,
                "freight_mode": "AIR_CHARTER",
                "confidence": 0.78
            }
        ),
    ]

    for sc in scenarios:
        db.add(sc)
    db.commit()

    # 2. Recovery Plans
    plans = [
        RecoveryPlanRecord(
            id="RP-EXEC-001",
            disruption_id=disruption_id,
            scenario_id="SCN-001-ALPHA",
            strategy="Apex Silicon Accelerated Procurement & Express Air",
            supplier_id="SUP-001",
            total_cost=245000.0,
            max_delay_days=3.5,
            blended_risk=0.18,
            total_sla_exposure=150000.0,
            final_score=0.92,
            orders_recovered_pct=98.5,
            status="PENDING_AUDIT",
            details={
                "sap_vendor_code": "VEND-10023",
                "sap_material_code": "MAT-012",
                "sap_plant": "PLANT-001",
                "po_suggested": "PO-45009182",
                "audit_notes": "Awaiting SOC 2 automated audit verification before executive release."
            }
        ),
        RecoveryPlanRecord(
            id="RP-EXEC-002",
            disruption_id=disruption_id,
            scenario_id="SCN-002-BETA",
            strategy="Nordic Composite Dual-Sourcing Contingency",
            supplier_id="SUP-002",
            total_cost=310000.0,
            max_delay_days=5.0,
            blended_risk=0.14,
            total_sla_exposure=120000.0,
            final_score=0.88,
            orders_recovered_pct=94.0,
            status="PENDING_APPROVAL",
            details={
                "sap_vendor_code": "VEND-10088",
                "sap_material_code": "MAT-002",
                "sap_plant": "PLANT-002",
                "po_suggested": "PO-45009244",
                "audit_notes": "Automated audit PASSED. Pending final director authorization."
            }
        ),
        RecoveryPlanRecord(
            id="RP-EXEC-003",
            disruption_id="SIM-DISRUPT-002",
            scenario_id="SCN-003-GAMMA",
            strategy="Stuttgart Intra-Company Safety Stock Bridge",
            supplier_id="SUP-004",
            total_cost=98000.0,
            max_delay_days=7.0,
            blended_risk=0.28,
            total_sla_exposure=280000.0,
            final_score=0.81,
            orders_recovered_pct=89.2,
            status="ACTIVE",
            details={
                "sap_vendor_code": "VEND-10045",
                "sap_material_code": "MAT-001",
                "sap_plant": "PLANT-001",
                "po_suggested": "PO-45008910",
                "audit_notes": "Authorized and actively dispatching in SAP S/4HANA."
            }
        ),
        RecoveryPlanRecord(
            id="RP-EXEC-004",
            disruption_id="SIM-DISRUPT-002",
            scenario_id="SCN-004-DELTA",
            strategy="Tier-1 Supplier Immediate Replacement",
            supplier_id="SUP-001",
            total_cost=180000.0,
            max_delay_days=4.0,
            blended_risk=0.19,
            total_sla_exposure=95000.0,
            final_score=0.91,
            orders_recovered_pct=100.0,
            status="COMPLETED",
            details={
                "sap_vendor_code": "VEND-10023",
                "sap_material_code": "MAT-003",
                "sap_plant": "PLANT-003",
                "po_suggested": "PO-45008711",
                "audit_notes": "Recovery completed. All shipments cleared customs and delivered to plant."
            }
        ),
    ]

    for pl in plans:
        db.add(pl)
    db.commit()

    print("=" * 60)
    print("SUPABASE SCENARIOS & PLANS SEEDED SUCCESSFULLY")
    print(f"  Scenarios:      {db.query(ScenarioRecord).count()} records")
    print(f"  Recovery Plans: {db.query(RecoveryPlanRecord).count()} records")
    print("=" * 60)
    db.close()

if __name__ == "__main__":
    seed_plans()
