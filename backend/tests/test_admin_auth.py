import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.admin_database import AdminSessionLocal, init_admin_db
from app.core.rbac import seed_default_roles_and_permissions
from app.core.security import hash_password
from app.models.admin_models import AdminUser, PlatformUser, Organization, Role
import uuid

client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_admin_data():
    init_admin_db()
    db = AdminSessionLocal()
    seed_default_roles_and_permissions(db)
    
    # Ensure test owner
    owner = db.query(AdminUser).filter(AdminUser.email == "test_owner@resilienceos.com").first()
    if not owner:
        owner = AdminUser(
            id=str(uuid.uuid4()),
            email="test_owner@resilienceos.com",
            password_hash=hash_password("ownersecret"),
            display_name="Test Owner",
            role="OWNER",
            is_active=True
        )
        db.add(owner)
    
    # Ensure test org and platform operator
    org = db.query(Organization).filter(Organization.slug == "test-org").first()
    if not org:
        org = Organization(id=str(uuid.uuid4()), name="Test Org", slug="test-org", is_active=True)
        db.add(org)
        db.flush()
    
    op_role = db.query(Role).filter(Role.name == "OPERATOR").first()
    operator = db.query(PlatformUser).filter(PlatformUser.email == "test_op@resilienceos.com").first()
    if not operator:
        operator = PlatformUser(
            id=str(uuid.uuid4()),
            email="test_op@resilienceos.com",
            password_hash=hash_password("opsecret"),
            display_name="Test Operator",
            role_id=op_role.id if op_role else "",
            org_id=org.id,
            is_active=True
        )
        db.add(operator)
    
    db.commit()
    db.close()

def test_admin_login_success():
    resp = client.post("/api/admin/auth/login", json={
        "email": "test_owner@resilienceos.com",
        "password": "ownersecret"
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"

def test_admin_login_invalid_password():
    resp = client.post("/api/admin/auth/login", json={
        "email": "test_owner@resilienceos.com",
        "password": "wrongpassword"
    })
    assert resp.status_code == 401

def test_admin_me_endpoint():
    login_resp = client.post("/api/admin/auth/login", json={
        "email": "test_owner@resilienceos.com",
        "password": "ownersecret"
    })
    token = login_resp.json()["access_token"]
    
    me_resp = client.get("/api/admin/auth/me", headers={
        "Authorization": f"Bearer {token}"
    })
    assert me_resp.status_code == 200
    user = me_resp.json()
    assert user["email"] == "test_owner@resilienceos.com"
    assert user["role"] == "OWNER"

def test_admin_me_unauthorized():
    resp = client.get("/api/admin/auth/me")
    assert resp.status_code == 401

def test_platform_login_and_me():
    # Login
    resp = client.post("/api/auth/login", json={
        "email": "test_op@resilienceos.com",
        "password": "opsecret"
    })
    assert resp.status_code == 200
    token = resp.json()["access_token"]
    
    # Profile & Permissions
    me_resp = client.get("/api/auth/me", headers={
        "Authorization": f"Bearer {token}"
    })
    assert me_resp.status_code == 200
    profile = me_resp.json()
    assert profile["email"] == "test_op@resilienceos.com"
    assert "disruptions:simulate" in profile["permissions"]
