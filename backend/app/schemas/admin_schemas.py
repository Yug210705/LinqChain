"""Pydantic v2 schemas for the LinqChain admin panel."""
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


# ---------------------------------------------------------------------------
# Auth Schemas
# ---------------------------------------------------------------------------

class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, extra="allow")

    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: Optional[Dict[str, Any]] = None



class RefreshRequest(BaseModel):
    refresh_token: str


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


# ---------------------------------------------------------------------------
# Admin User Schemas
# ---------------------------------------------------------------------------

class AdminUserCreate(BaseModel):
    email: str
    password: str
    display_name: str
    role: str = "ADMIN"


class AdminUserUpdate(BaseModel):
    display_name: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None


class AdminUserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: str
    display_name: Optional[str] = None
    role: str
    is_active: bool
    created_at: Optional[datetime] = None
    last_login: Optional[datetime] = None


# ---------------------------------------------------------------------------
# Role & Permission Schemas
# ---------------------------------------------------------------------------

class PermissionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    resource: str
    action: str
    description: Optional[str] = None


class RoleCreate(BaseModel):
    name: str
    description: str
    permission_ids: List[str] = Field(default_factory=list)


class RoleUpdate(BaseModel):
    description: Optional[str] = None
    permission_ids: Optional[List[str]] = None


class RoleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    description: Optional[str] = None
    is_system: bool
    created_at: Optional[datetime] = None
    permissions: List[PermissionResponse] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# Platform User Schemas
# ---------------------------------------------------------------------------

class PlatformUserCreate(BaseModel):
    email: str
    password: str
    display_name: str
    role_id: str
    org_id: Optional[str] = None


class PlatformUserUpdate(BaseModel):
    display_name: Optional[str] = None
    role_id: Optional[str] = None
    org_id: Optional[str] = None
    is_active: Optional[bool] = None


class PlatformUserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: str
    display_name: Optional[str] = None
    role_id: str
    org_id: Optional[str] = None
    is_active: bool
    created_at: Optional[datetime] = None
    last_login: Optional[datetime] = None
    role_name: Optional[str] = None
    org_name: Optional[str] = None


class UserProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: str
    display_name: Optional[str] = None
    role_id: Optional[str] = None
    role_name: Optional[str] = None
    org_id: Optional[str] = None
    org_name: Optional[str] = None
    is_active: bool = True
    permissions: List[str] = Field(default_factory=list)
    created_at: Optional[datetime] = None
    last_login: Optional[datetime] = None


# ---------------------------------------------------------------------------

# Organization Schemas
# ---------------------------------------------------------------------------

class OrganizationCreate(BaseModel):
    name: str
    slug: str


class OrganizationUpdate(BaseModel):
    name: Optional[str] = None
    is_active: Optional[bool] = None
    settings: Optional[Dict[str, Any]] = None


class OrganizationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    slug: str
    is_active: bool
    settings: Optional[Dict[str, Any]] = None
    created_at: Optional[datetime] = None
    user_count: Optional[int] = 0


# ---------------------------------------------------------------------------
# Platform Policy Schemas
# ---------------------------------------------------------------------------

class PolicyUpdate(BaseModel):
    value: Any
    description: Optional[str] = None


class PolicyResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    key: str
    value: Any
    description: Optional[str] = None
    updated_at: Optional[datetime] = None
    updated_by: Optional[str] = None


# ---------------------------------------------------------------------------
# Audit Log Schemas
# ---------------------------------------------------------------------------

class AuditLogEntry(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    actor_id: str
    actor_email: str
    action: str
    resource: Optional[str] = None
    resource_id: Optional[str] = None
    details: Optional[Any] = None
    ip_address: Optional[str] = None
    timestamp: Optional[datetime] = None


class AuditLogListResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    items: List[AuditLogEntry]
    total: int
    limit: int
    offset: int
    has_more: bool


# ---------------------------------------------------------------------------
# Dashboard & System Status Schemas
# ---------------------------------------------------------------------------

class DashboardStats(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    total_admin_users: int = 0
    total_platform_users: int = 0
    total_organizations: int = 0
    active_organizations: int = 0
    total_roles: int = 0
    total_disruptions: int = 0
    total_recovery_plans: int = 0
    pending_approvals: int = 0
    system_uptime_seconds: float = 0.0
    db_status: str = "ok"


class SystemStatus(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    db_engine: str
    db_connected: bool
    hana_connected: bool
    sap_adapter: str
    cache_stats: Dict[str, Any] = Field(default_factory=dict)
    python_version: str
    uptime_seconds: float
    environment: str
