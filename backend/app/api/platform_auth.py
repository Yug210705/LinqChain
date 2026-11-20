"""Platform authentication API routes for LinqChain.

Provides authentication, JWT token refresh, and user profile resolution
for end-users of the supply chain resilience platform.
"""
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.api.admin import get_client_ip, log_action
from app.core.admin_database import get_admin_db
from app.core.auth import get_current_user
from app.core.rbac import get_role_permissions, seed_default_roles_and_permissions
from app.core.rate_limiter import rate_limit, login_rate_limiter, refresh_rate_limiter
from app.core.security import (
    ADMIN_ACCESS_TOKEN_EXPIRE_SECONDS,
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    revoke_token,
    verify_password,
)
from app.models.admin_models import (
    AdminUser,
    Organization,
    Permission,
    PlatformUser,
    Role,
)
from app.schemas.admin_schemas import (
    LoginRequest,
    RefreshRequest,
    TokenResponse,
    UserProfileResponse,
)

# Platform auth router initialization
router = APIRouter(prefix="/api/auth", tags=["Platform Auth"])


def seed_default_platform_user_if_empty(db: Session) -> None:
    """Ensure at least one default organization and platform operator exists."""
    if db.query(Role).count() == 0:
        seed_default_roles_and_permissions(db)

    if db.query(Organization).count() == 0:
        default_org = Organization(
            id=str(uuid.uuid4()),
            name="Acme Global Logistics",
            slug="acme-global",
            is_active=True,
            settings={"tier": "enterprise"},
            created_at=datetime.utcnow(),
        )
        db.add(default_org)
        db.commit()

    if db.query(PlatformUser).count() == 0:
        operator_role = db.query(Role).filter(Role.name == "OPERATOR").first()
        org = db.query(Organization).first()

        if operator_role:
            default_operator = PlatformUser(
                id=str(uuid.uuid4()),
                email="operator@linqchain.com",
                password_hash=hash_password("operator123"),
                display_name="Operations Lead",
                role_id=operator_role.id,
                org_id=org.id if org else None,
                is_active=True,
                created_at=datetime.utcnow(),
            )
            db.add(default_operator)
            db.commit()


# ---------------------------------------------------------------------------
# 1. POST /api/auth/login
# ---------------------------------------------------------------------------

@router.post(
    "/login",
    response_model=TokenResponse,
    dependencies=[Depends(rate_limit(login_rate_limiter))],
)
def platform_login(
    body: LoginRequest,
    request: Request,
    admin_db: Session = Depends(get_admin_db),
) -> TokenResponse:
    """Validate email and password against PlatformUser table and issue tokens."""
    seed_default_platform_user_if_empty(admin_db)

    email = body.email.strip().lower()
    if not email or "@" not in email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A valid email address is required",
        )

    search_emails = [email]
    if "@linqchain.com" in email:
        search_emails.append(email.replace("@linqchain.com", "@resilienceos.com"))
    elif "@resilienceos.com" in email:
        search_emails.append(email.replace("@resilienceos.com", "@linqchain.com"))

    user = (
        admin_db.query(PlatformUser)
        .options(joinedload(PlatformUser.role), joinedload(PlatformUser.organization))
        .filter(func.lower(PlatformUser.email).in_(search_emails))
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Platform user account is inactive. Please contact an administrator.",
        )

    if not verify_password(body.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Update last login timestamp
    user.last_login = datetime.utcnow()
    admin_db.commit()
    admin_db.refresh(user)

    token_payload = {
        "sub": user.id,
        "email": user.email,
        "role_id": user.role_id,
        "scope": "platform",
    }
    access_token = create_access_token(token_payload)
    refresh_token = create_refresh_token(token_payload)

    client_ip = get_client_ip(request)
    log_action(
        db=admin_db,
        actor_id=user.id,
        actor_email=user.email,
        action="platform_auth.login",
        resource="platform_auth",
        resource_id=user.id,
        details={"role_id": user.role_id, "org_id": user.org_id},
        ip_address=client_ip,
    )

    user_dict = {
        "id": user.id,
        "email": user.email,
        "display_name": user.display_name,
        "role_id": user.role_id,
        "role_name": user.role_name,
        "org_id": user.org_id,
        "org_name": user.org_name,
        "is_active": user.is_active,
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "last_login": user.last_login.isoformat() if user.last_login else None,
    }

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=ADMIN_ACCESS_TOKEN_EXPIRE_SECONDS,
        user=user_dict,
    )


# ---------------------------------------------------------------------------
# 2. POST /api/auth/refresh
# ---------------------------------------------------------------------------

@router.post(
    "/refresh",
    response_model=TokenResponse,
    dependencies=[Depends(rate_limit(refresh_rate_limiter))],
)
def platform_refresh_token(
    body: RefreshRequest,
    admin_db: Session = Depends(get_admin_db),
) -> TokenResponse:
    """Refresh an access token using a valid platform refresh token with single-use rotation."""
    payload = decode_token(body.refresh_token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid, expired, or revoked refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token_type = payload.get("type")
    scope = payload.get("scope")
    if token_type != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token is not a valid refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if scope != "platform":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid token scope for platform authentication",
        )

    user_id = payload.get("sub")
    user = (
        admin_db.query(PlatformUser)
        .options(joinedload(PlatformUser.role), joinedload(PlatformUser.organization))
        .filter(PlatformUser.id == user_id, PlatformUser.is_active == True)
        .first()
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Platform user not found or deactivated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Invalidate previous refresh token to prevent replay attacks
    revoke_token(body.refresh_token)

    new_payload = {
        "sub": user.id,
        "email": user.email,
        "role_id": user.role_id,
        "scope": "platform",
    }
    new_access_token = create_access_token(new_payload)
    new_refresh_token = create_refresh_token(new_payload)

    user_dict = {
        "id": user.id,
        "email": user.email,
        "display_name": user.display_name,
        "role_id": user.role_id,
        "role_name": user.role_name,
        "org_id": user.org_id,
        "org_name": user.org_name,
        "is_active": user.is_active,
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "last_login": user.last_login.isoformat() if user.last_login else None,
    }

    return TokenResponse(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
        token_type="bearer",
        expires_in=ADMIN_ACCESS_TOKEN_EXPIRE_SECONDS,
        user=user_dict,
    )


# ---------------------------------------------------------------------------
# 3. GET /api/auth/me
# ---------------------------------------------------------------------------

@router.get("/me", response_model=UserProfileResponse)
def get_current_user_profile(
    current_user=Depends(get_current_user),
    admin_db: Session = Depends(get_admin_db),
) -> UserProfileResponse:
    """Return currently authenticated platform user profile with permissions."""
    # Check if user is a standard PlatformUser
    if isinstance(current_user, PlatformUser) or hasattr(current_user, "role_id"):
        role = admin_db.query(Role).filter(Role.id == current_user.role_id).first()
        permissions = get_role_permissions(admin_db, current_user.role_id)
        perm_keys = [f"{p.resource}:{p.action}" for p in permissions]

        return UserProfileResponse(
            id=current_user.id,
            email=current_user.email,
            display_name=current_user.display_name,
            role_id=current_user.role_id,
            role_name=role.name if role else None,
            org_id=current_user.org_id,
            org_name=current_user.org_name if hasattr(current_user, "org_name") else None,
            is_active=current_user.is_active,
            permissions=perm_keys,
            created_at=current_user.created_at,
            last_login=current_user.last_login,
        )

    # Check if user is an AdminUser (accessing platform with admin credentials)
    if isinstance(current_user, AdminUser) or getattr(current_user, "scope", "") == "admin":
        role_name = getattr(current_user, "role", "ADMIN")
        if role_name == "OWNER":
            all_perms = admin_db.query(Permission).all()
            perm_keys = [f"{p.resource}:{p.action}" for p in all_perms]
        else:
            role_obj = admin_db.query(Role).filter(Role.name == role_name).first()
            if role_obj:
                permissions = get_role_permissions(admin_db, role_obj.id)
                perm_keys = [f"{p.resource}:{p.action}" for p in permissions]
            else:
                perm_keys = []

        return UserProfileResponse(
            id=current_user.id,
            email=current_user.email,
            display_name=current_user.display_name,
            role_id=None,
            role_name=role_name,
            org_id=None,
            org_name="LinqChain Operations",
            is_active=current_user.is_active,
            permissions=perm_keys,
            created_at=current_user.created_at,
            last_login=current_user.last_login,
        )

    # Fallback for mock/no-auth environments
    all_perms = admin_db.query(Permission).all()
    perm_keys = [f"{p.resource}:{p.action}" for p in all_perms] if all_perms else ["*:*"]

    return UserProfileResponse(
        id=getattr(current_user, "id", "local-dev-user"),
        email=getattr(current_user, "email", "admin@resilienceos.com"),
        display_name=getattr(current_user, "display_name", "Developer / Admin"),
        role_id=None,
        role_name=getattr(current_user, "role", "OWNER"),
        org_id=None,
        org_name="Local Development",
        is_active=True,
        permissions=perm_keys,
        created_at=datetime.utcnow(),
        last_login=datetime.utcnow(),
    )
