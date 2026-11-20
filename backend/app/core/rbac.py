"""RBAC engine and default seed definitions for roles and permissions."""
import uuid
from typing import List
from sqlalchemy.orm import Session
from app.models.admin_models import Role, Permission, RolePermission

PERMISSION_DEFINITIONS = [
    ("disruptions", "view", "View disruption list and details"),
    ("disruptions", "simulate", "Run disruption simulations"),
    ("disruptions", "resolve", "Resolve active disruptions"),
    ("disruptions", "reset", "Reset all disruption data"),
    ("recovery", "view_options", "View recovery options"),
    ("recovery", "create_plan", "Create recovery plans"),
    ("recovery", "approve", "Approve or reject recovery plans"),
    ("recovery", "execute", "Execute approved plans via SAP"),
    ("recovery", "run_pipeline", "Run the 6-step recovery pipeline"),
    ("scenarios", "view", "View scenarios"),
    ("scenarios", "generate", "Generate new scenarios"),
    ("scenarios", "update_status", "Update scenario status"),
    ("supply_chain", "view_graph", "View supply chain topology graph"),
    ("supply_chain", "view_vulnerabilities", "View vulnerability analysis"),
    ("audit", "view", "View audit trail and action history"),
    ("settings", "view", "View settings"),
    ("settings", "write", "Modify settings"),
    ("system", "admin_access", "Access the admin panel"),
]

ROLE_DEFINITIONS = {
    "OWNER": {
        "description": "Full system owner with unrestricted access to admin panel and all features",
        "permissions": "*",  # all permissions
    },
    "ADMIN": {
        "description": "Administrator with full platform management capabilities",
        "permissions": [p for p in PERMISSION_DEFINITIONS if p[1] != "admin_access" or p[0] != "system"],
    },
    "OPERATOR": {
        "description": "Operations user who can simulate, create plans, approve, and execute",
        "permissions": [
            ("disruptions", "view"), ("disruptions", "simulate"), ("disruptions", "resolve"),
            ("recovery", "view_options"), ("recovery", "create_plan"), ("recovery", "approve"),
            ("recovery", "execute"), ("recovery", "run_pipeline"),
            ("scenarios", "view"), ("scenarios", "generate"), ("scenarios", "update_status"),
            ("supply_chain", "view_graph"), ("supply_chain", "view_vulnerabilities"),
            ("audit", "view"), ("settings", "view"),
        ],
    },
    "VIEWER": {
        "description": "Read-only access to view all data without modification capabilities",
        "permissions": [
            ("disruptions", "view"),
            ("recovery", "view_options"),
            ("scenarios", "view"),
            ("supply_chain", "view_graph"), ("supply_chain", "view_vulnerabilities"),
            ("audit", "view"), ("settings", "view"),
        ],
    },
}


def check_permission(db: Session, role_id: str, resource: str, action: str) -> bool:
    """Check if a role possesses a specific resource:action permission."""
    return db.query(RolePermission).join(Permission).filter(
        RolePermission.role_id == role_id,
        Permission.resource == resource,
        Permission.action == action,
    ).first() is not None


def get_role_permissions(db: Session, role_id: str) -> List[Permission]:
    """Retrieve all Permission instances granted to a given role."""
    return db.query(Permission).join(RolePermission).filter(
        RolePermission.role_id == role_id
    ).all()


def seed_default_roles_and_permissions(db: Session) -> None:
    """Idempotent seed: creates roles and permissions if they don't exist."""
    # 1. Seed permissions
    perm_map = {}  # (resource, action) -> Permission
    for resource, action, desc in PERMISSION_DEFINITIONS:
        existing = db.query(Permission).filter(
            Permission.resource == resource,
            Permission.action == action,
        ).first()
        if existing:
            perm_map[(resource, action)] = existing
        else:
            perm = Permission(id=str(uuid.uuid4()), resource=resource, action=action, description=desc)
            db.add(perm)
            perm_map[(resource, action)] = perm
    db.flush()

    # 2. Seed roles and assign permissions
    for role_name, role_def in ROLE_DEFINITIONS.items():
        existing_role = db.query(Role).filter(Role.name == role_name).first()
        if not existing_role:
            role = Role(id=str(uuid.uuid4()), name=role_name, description=role_def["description"], is_system=True)
            db.add(role)
            db.flush()
        else:
            role = existing_role

        # Assign permissions
        if role_def["permissions"] == "*":
            perms = list(perm_map.values())
        else:
            perms = []
            for item in role_def["permissions"]:
                key = (item[0], item[1])
                if key in perm_map:
                    perms.append(perm_map[key])

        for perm in perms:
            existing_rp = db.query(RolePermission).filter(
                RolePermission.role_id == role.id,
                RolePermission.permission_id == perm.id,
            ).first()
            if not existing_rp:
                db.add(RolePermission(role_id=role.id, permission_id=perm.id))

    db.commit()
