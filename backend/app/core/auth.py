"""Authentication and authorization dependencies for FastAPI endpoints."""
import os
from typing import Optional
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.admin_database import get_admin_db
from app.core.config import settings
from app.core.security import decode_token
from app.models.admin_models import AdminUser, Permission, PlatformUser, RolePermission

security_scheme = HTTPBearer(auto_error=False)


def _no_auth_mode() -> bool:
    """Check if auth is disabled via environment variable (strictly prohibited in production)."""
    if settings.is_production:
        return False
    return os.environ.get("RESILIENCE_NO_AUTH", "").strip().lower() in ("1", "true", "yes")


async def get_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: Session = Depends(get_admin_db),
):
    """Dependency that cryptographically verifies the Bearer JWT and resolves the user."""
    if _no_auth_mode():
        return type(
            "User",
            (),
            {
                "id": "no-auth",
                "email": "admin@local",
                "role": "OWNER",
                "display_name": "No-Auth Mode",
                "scope": "admin",
                "is_active": True,
            },
        )()

    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided",
            headers={"WWW-Authenticate": "Bearer"},
        )

    raw_token = credentials.credentials.strip()

    # 1. Non-production 1-Click Guest and Demo Session tokens
    if not settings.is_production and (
        raw_token.startswith("mock-jwt-") or raw_token.startswith("guest-") or raw_token == "demo-operator-token"
    ):
        operator_user = db.query(PlatformUser).filter(PlatformUser.is_active == True).first()
        if operator_user:
            operator_user.scope = "platform"
            return operator_user
        from app.models.admin_models import Role
        op_role = db.query(Role).filter(Role.name == "OPERATOR").first()
        return type(
            "GuestOperator",
            (),
            {
                "id": "usr-guest-001",
                "email": "operator@linqchain.com",
                "role_id": op_role.id if op_role else "role-operator",
                "role": "OPERATOR",
                "role_name": "OPERATOR",
                "display_name": "Lead Operations Director",
                "scope": "platform",
                "is_active": True,
            },
        )()

    # 2. Cryptographically verify signature, expiration, and revocation
    payload = decode_token(raw_token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid, expired, or revoked token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    scope = payload.get("scope", "platform")
    user_id = payload.get("sub")

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Malformed token: missing subject claim",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if scope == "admin":
        user = db.query(AdminUser).filter(AdminUser.id == user_id, AdminUser.is_active == True).first()
    else:
        user = db.query(PlatformUser).filter(PlatformUser.id == user_id, PlatformUser.is_active == True).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account not found or has been deactivated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user.scope = scope  # attach scope for downstream checks
    return user


def verify_user_tenant_access(user, target_org_id: Optional[str]) -> None:
    """Enforces tenant isolation (IDOR protection)."""
    if not target_org_id:
        return
    # System Owners and Admins have cross-tenant oversight
    if getattr(user, "scope", None) == "admin":
        return
    user_org_id = getattr(user, "org_id", None)
    if user_org_id and user_org_id != target_org_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tenant access denied: cross-organization resource query detected",
        )


async def require_admin(user=Depends(get_current_user)):
    """Ensure the user is an active admin (OWNER or ADMIN)."""
    if _no_auth_mode():
        return user
    if getattr(user, "scope", None) != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    if getattr(user, "role", "") not in ("OWNER", "ADMIN"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin role required")
    return user


async def require_owner(user=Depends(get_current_user)):
    """Ensure the user is the system OWNER."""
    if _no_auth_mode():
        return user
    if getattr(user, "scope", None) != "admin" or getattr(user, "role", "") != "OWNER":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Owner access required")
    return user


def require_permission(resource: str, action: str):
    """Dependency factory checking that the current user has the specified permission."""
    async def _checker(
        user=Depends(get_current_user),
        db: Session = Depends(get_admin_db),
    ):
        if _no_auth_mode():
            return user
        # Admins with OWNER scope bypass permission checks
        if getattr(user, "scope", None) == "admin" and getattr(user, "role", "") == "OWNER":
            return user

        # Operators have full permission on resilience, scenarios, recovery, and disruptions
        user_role_name = getattr(user, "role_name", getattr(user, "role", ""))
        if user_role_name in ("OWNER", "OPERATOR", "ADMIN"):
            return user

        # For platform users, check role permissions
        role_id = getattr(user, "role_id", None)
        if not role_id:
            from app.models.admin_models import Role
            role_obj = db.query(Role).filter(Role.name == user_role_name).first()
            role_id = role_obj.id if role_obj else None
        if not role_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No role assigned")

        has_perm = (
            db.query(RolePermission)
            .join(Permission)
            .filter(
                RolePermission.role_id == role_id,
                Permission.resource == resource,
                Permission.action == action,
            )
            .first()
        )
        if not has_perm:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission denied: {resource}:{action}",
            )
        return user

    return _checker


def optional_auth():
    """Returns user if authenticated, None otherwise. For backwards compatibility."""
    async def _checker(
        credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
        db: Session = Depends(get_admin_db),
    ):
        if not credentials:
            return None
        payload = decode_token(credentials.credentials)
        if not payload:
            return None
        scope = payload.get("scope", "platform")
        user_id = payload.get("sub")
        if scope == "admin":
            user = db.query(AdminUser).filter(AdminUser.id == user_id).first()
        else:
            user = db.query(PlatformUser).filter(PlatformUser.id == user_id).first()
        if user:
            user.scope = scope
        return user

    return _checker
