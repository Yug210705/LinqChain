"""Demo data seeder for the LinqChain Admin Panel.

Seeds:
- Default roles and permissions
- Demo organizations (Acme Supply Global, BioPharma Logistics, Nexura Defense)
- Demo platform users across organizations and roles
- Platform operational policies
- Initial enterprise audit log trail

Usage:
    cd backend
    venv/Scripts/python.exe scripts/seed_admin.py
"""
import sys
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path

# Add backend root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.core.admin_database import AdminSessionLocal, init_admin_db
from app.core.rbac import seed_default_roles_and_permissions
from app.core.security import hash_password
from app.models.admin_models import (
    AdminAuditLog,
    AdminUser,
    Organization,
    PlatformPolicy,
    PlatformUser,
    Role,
)


def seed_admin_demo():
    print("[Seed Admin] Initializing database...")
    init_admin_db()

    db = AdminSessionLocal()
    try:
        print("[Seed Admin] Ensuring roles and permissions are seeded...")
        seed_default_roles_and_permissions(db)

        # 1. Seed Owner Admin User if missing
        owner = db.query(AdminUser).filter(AdminUser.email == "owner@resilienceos.com").first()
        if not owner:
            print("[Seed Admin] Provisioning default OWNER account (owner@resilienceos.com)...")
            owner_id = str(uuid.uuid4())
            owner = AdminUser(
                id=owner_id,
                email="owner@resilienceos.com",
                password_hash=hash_password("owner123"),
                display_name="Chief Executive Owner",
                role="OWNER",
                is_active=True,
            )
            db.add(owner)
            db.flush()

        # 2. Seed Organizations
        org_data = [
            ("Acme Supply Global", "acme-supply-global", {"tier": "ENTERPRISE", "sap_plant_code": "1010"}),
            ("BioPharma Logistics", "biopharma-logistics", {"tier": "PREMIUM", "sap_plant_code": "2020"}),
            ("Nexura Defense", "nexura-defense", {"tier": "CRITICAL_INFRASTRUCTURE", "sap_plant_code": "3030"}),
        ]

        org_map = {}
        for name, slug, settings in org_data:
            existing = db.query(Organization).filter(Organization.slug == slug).first()
            if not existing:
                org = Organization(
                    id=str(uuid.uuid4()),
                    name=name,
                    slug=slug,
                    is_active=True,
                    settings=settings,
                )
                db.add(org)
                db.flush()
                org_map[slug] = org
                print(f"[Seed Admin] Created organization '{name}'")
            else:
                org_map[slug] = existing

        # 3. Seed Platform Users
        roles = {r.name: r for r in db.query(Role).all()}

        demo_users = [
            ("operator@resilienceos.com", "operator123", "Sarah Chen (War Room Lead)", "OPERATOR", "acme-supply-global"),
            ("viewer@resilienceos.com", "viewer123", "David Kim (Auditor)", "VIEWER", "acme-supply-global"),
            ("logistics.lead@biopharma.org", "password123", "Dr. Elena Rostova", "OPERATOR", "biopharma-logistics"),
            ("compliance@nexura.com", "password123", "Col. Marcus Vance", "VIEWER", "nexura-defense"),
            ("admin@acme.com", "password123", "Alex Mercer (Acme Admin)", "ADMIN", "acme-supply-global"),
        ]

        for email, pwd, name, role_name, org_slug in demo_users:
            existing = db.query(PlatformUser).filter(PlatformUser.email == email).first()
            if not existing:
                role = roles.get(role_name)
                org = org_map.get(org_slug)
                user = PlatformUser(
                    id=str(uuid.uuid4()),
                    email=email,
                    password_hash=hash_password(pwd),
                    display_name=name,
                    role_id=role.id if role else "",
                    org_id=org.id if org else None,
                    is_active=True,
                )
                db.add(user)
                print(f"[Seed Admin] Created platform user '{email}' ({role_name} @ {org_slug})")

        # 4. Seed Platform Operational Policies
        policies = [
            ("sap_rfc_timeout_ms", 5000, "Maximum latency before RFC calls to SAP S/4HANA fallback to cached circuit"),
            ("auto_approval_threshold_usd", 75000.0, "Cost threshold below which recovery plans may be auto-approved by policy"),
            ("chaos_monkey_max_severity", 1.0, "Upper bound for destructive simulation runs in war room chaos testing"),
            ("require_dual_authorization", True, "Enforces separate audit and approval steps before SAP PO generation"),
            ("llm_guardrail_tolerance_pct", 1.0, "Allowable floating point variance for AI narrative hallucination validation"),
            ("max_simulations_per_hour", 120, "Rate limit ceiling for simulation runs per organization"),
        ]

        for key, val, desc in policies:
            existing = db.query(PlatformPolicy).filter(PlatformPolicy.key == key).first()
            if not existing:
                pol = PlatformPolicy(
                    id=str(uuid.uuid4()),
                    key=key,
                    value=val,
                    description=desc,
                    updated_by="owner@resilienceos.com",
                )
                db.add(pol)
                print(f"[Seed Admin] Seeded policy '{key}' = {val}")

        # 5. Seed Initial Audit Log History
        now = datetime.now(timezone.utc)
        audit_events = [
            ("policy.update", "policies", "require_dual_authorization", {"old": False, "new": True}, now - timedelta(hours=36)),
            ("role.create", "roles", "CUSTOM_ANALYST", {"name": "Senior Supply Analyst"}, now - timedelta(hours=24)),
            ("platform_user.create", "platform_users", "operator@resilienceos.com", {"role": "OPERATOR"}, now - timedelta(hours=18)),
            ("organization.create", "organizations", "Acme Supply Global", {"slug": "acme-supply-global"}, now - timedelta(hours=12)),
            ("auth.login", "admin_users", owner.id, {"method": "bearer_jwt"}, now - timedelta(minutes=45)),
        ]

        for action, resource, res_id, details, ts in audit_events:
            audit = AdminAuditLog(
                id=str(uuid.uuid4()),
                actor_id=owner.id,
                actor_email=owner.email,
                action=action,
                resource=resource,
                resource_id=res_id,
                details=details,
                ip_address="127.0.0.1",
                timestamp=ts,
            )
            db.add(audit)

        db.commit()
        print("\n[Seed Admin] Database seed completed successfully!")
        print("\n=======================================================")
        print(" LINQCHAIN — DEMO LOGIN CREDENTIALS")
        print("=======================================================")
        print(" 1. OWNER ADMIN PANEL:  http://localhost:3000/admin/login")
        print("    Email:     owner@resilienceos.com")
        print("    Password:  owner123")
        print(" -----------------------------------------------------")
        print(" 2. PLATFORM WORKSPACE:  http://localhost:3000/login")
        print("    Operator:  operator@resilienceos.com / operator123")
        print("    Auditor:   viewer@resilienceos.com / viewer123")
        print("=======================================================\n")

    finally:
        db.close()


if __name__ == "__main__":
    seed_admin_demo()
