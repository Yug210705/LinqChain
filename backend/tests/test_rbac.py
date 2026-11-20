import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.admin_database import AdminSessionLocal, init_admin_db
from app.core.rbac import seed_default_roles_and_permissions, check_permission
from app.core.security import hash_password
from app.models.admin_models import AdminUser, PlatformUser, Organization, Role
import uuid

client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_rbac_test_data():
    init_admin_db()
    db = AdminSessionLocal()
    seed_default_roles_and_permissions(db)

    org = db.query(Organization).filter(Organization.slug == "rbac-org").first()
    if not org:
        org = Organization(id=str(uuid.uuid4()), name="RBAC Org", slug="rbac-org", is_active=True)
        db.add(org)
        db.flush()

    viewer_role = db.query(Role).filter(Role.name == "VIEWER").first()
    viewer_user = db.query(PlatformUser).filter(PlatformUser.email == "viewer_test@resilienceos.com").first()
    if not viewer_user:
        viewer_user = PlatformUser(
            id=str(uuid.uuid4()),
            email="viewer_test@resilienceos.com",
            password_hash=hash_password("viewsecret"),
            display_name="Test Viewer",
            role_id=viewer_role.id if viewer_role else "",
            org_id=org.id,
            is_active=True
        )
        db.add(viewer_user)

    operator_role = db.query(Role).filter(Role.name == "OPERATOR").first()
    op_user = db.query(PlatformUser).filter(PlatformUser.email == "op_test@resilienceos.com").first()
    if not op_user:
        op_user = PlatformUser(
            id=str(uuid.uuid4()),
            email="op_test@resilienceos.com",
            password_hash=hash_password("opsecret"),
            display_name="Test Operator",
            role_id=operator_role.id if operator_role else "",
            org_id=org.id,
            is_active=True
        )
        db.add(op_user)

    db.commit()
    db.close()

def test_rbac_check_permission_helper():
    db = AdminSessionLocal()
    viewer_role = db.query(Role).filter(Role.name == "VIEWER").first()
    op_role = db.query(Role).filter(Role.name == "OPERATOR").first()

    # Viewer can view disruptions but cannot simulate
    assert check_permission(db, viewer_role.id, "disruptions", "view") is True
    assert check_permission(db, viewer_role.id, "disruptions", "simulate") is False

    # Operator can view AND simulate
    assert check_permission(db, op_role.id, "disruptions", "view") is True
    assert check_permission(db, op_role.id, "disruptions", "simulate") is True
    db.close()

def test_viewer_cannot_simulate_disruption():
    # Login as viewer
    resp = client.post("/api/auth/login", json={
        "email": "viewer_test@resilienceos.com",
        "password": "viewsecret"
    })
    token = resp.json()["access_token"]

    # Try to simulate disruption
    sim_resp = client.post("/api/disruptions/simulate", json={
        "disruption_type": "supplier",
        "affected_entity_id": "SUP-007",
        "severity": 0.5,
        "duration_days": 5
    }, headers={"Authorization": f"Bearer {token}"})

    assert sim_resp.status_code == 403
    assert "Permission denied" in sim_resp.json()["detail"]

def test_operator_can_view_disruptions():
    # Login as operator
    resp = client.post("/api/auth/login", json={
        "email": "op_test@resilienceos.com",
        "password": "opsecret"
    })
    token = resp.json()["access_token"]

    # View disruptions list
    list_resp = client.get("/api/disruptions", headers={"Authorization": f"Bearer {token}"})
    assert list_resp.status_code == 200
