"""CLI script to bootstrap or reset the initial OWNER account for the LinqChain Admin Panel.

Usage:
    cd backend
    venv/Scripts/python.exe scripts/create_admin.py --email owner@resilienceos.com --password secret --name "System Owner"
"""
import argparse
import sys
import uuid
from pathlib import Path

# Add backend root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.core.admin_database import AdminSessionLocal, init_admin_db
from app.core.rbac import seed_default_roles_and_permissions
from app.core.security import hash_password
from app.models.admin_models import AdminAuditLog, AdminUser


def main():
    parser = argparse.ArgumentParser(description="Bootstrap the LinqChain Admin Panel Owner Account")
    parser.add_argument("--email", default="owner@resilienceos.com", help="Owner email address")
    parser.add_argument("--password", default="owner123", help="Owner password")
    parser.add_argument("--name", default="System Owner", help="Display name")
    parser.add_argument("--force", action="store_true", help="Force update if user already exists")

    args = parser.parse_args()

    print("[Bootstrap] Initializing admin database...")
    init_admin_db()

    db = AdminSessionLocal()
    try:
        print("[Bootstrap] Seeding default RBAC roles and permissions...")
        seed_default_roles_and_permissions(db)

        # Check if user already exists
        existing = db.query(AdminUser).filter(AdminUser.email == args.email).first()
        if existing:
            if not args.force:
                print(f"[Notice] Admin user '{args.email}' already exists (ID: {existing.id}, Role: {existing.role}).")
                print("         Pass --force to update their password.")
                return
            print(f"[Bootstrap] Updating existing owner '{args.email}'...")
            existing.password_hash = hash_password(args.password)
            existing.display_name = args.name
            existing.role = "OWNER"
            existing.is_active = True
            db.commit()
            print(f"[Success] Password updated for owner '{args.email}'.")
        else:
            print(f"[Bootstrap] Creating new OWNER account for '{args.email}'...")
            user_id = str(uuid.uuid4())
            new_owner = AdminUser(
                id=user_id,
                email=args.email,
                password_hash=hash_password(args.password),
                display_name=args.name,
                role="OWNER",
                is_active=True,
            )
            db.add(new_owner)

            # Audit log bootstrap action
            audit = AdminAuditLog(
                id=str(uuid.uuid4()),
                actor_id=user_id,
                actor_email=args.email,
                action="owner.bootstrap_cli",
                resource="admin_users",
                resource_id=user_id,
                details={"email": args.email, "role": "OWNER"},
            )
            db.add(audit)
            db.commit()
            print(f"[Success] OWNER account successfully created!")

        print("\n=======================================================")
        print(" LINQCHAIN — OWNER CREDENTIALS")
        print("=======================================================")
        print(f" Portal URL:  http://localhost:3000/admin/login")
        print(f" Email:       {args.email}")
        print(f" Password:    {args.password}")
        print(f" Role:        OWNER (Full Enterprise Permissions)")
        print("=======================================================\n")

    finally:
        db.close()


if __name__ == "__main__":
    main()
