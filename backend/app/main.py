"""LINQCHAIN — unified production-ready backend entrypoint.

One command, one process, one API:
    cd backend
    venv/Scripts/python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
"""
import time
import uuid
from contextlib import asynccontextmanager
import structlog
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text

from app.core.config import settings
from app import models  # noqa: F401
from app.api import events as events_api
from app.api import impact, recovery, webhooks
from app.core.database import Base, engine, warm_db
from app.core.admin_database import init_admin_db, admin_engine, AdminSessionLocal
from app.core.rbac import seed_default_roles_and_permissions
from app.api import admin as admin_api
from app.api import platform_auth
from app.api import compliance as compliance_api
from app.core.runtime import start_prewarm

logger = structlog.get_logger("linqchain.main")
SERVER_START_TIME = time.time()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan context manager for graceful startup and shutdown."""
    # 1. Startup phase
    settings.validate_production_readiness()
    
    # Initialize operational and admin schemas
    Base.metadata.create_all(bind=engine)
    warm_db()
    start_prewarm()
    
    init_admin_db()
    with AdminSessionLocal() as session:
        seed_default_roles_and_permissions(session)
        
    logger.info("LinqChain backend started successfully", environment=settings.ENVIRONMENT, origins=settings.allowed_origins_list)
    
    yield
    
    # 2. Shutdown phase
    logger.info("Executing graceful backend shutdown...")
    engine.dispose()
    admin_engine.dispose()
    logger.info("Database connection pools cleanly disposed.")


app = FastAPI(
    title="LINQCHAIN API",
    description="Enterprise Supply Chain Command Center — Impact Engine, AI Mitigation & SAP Integration.",
    version="2.0.0",
    lifespan=lifespan,
)

# ---------------------------------------------------------------------------
# Security & Tracing Middleware
# ---------------------------------------------------------------------------

@app.middleware("http")
async def security_and_tracing_middleware(request: Request, call_next):
    request_id = request.headers.get("x-request-id") or str(uuid.uuid4())
    request.state.request_id = request_id

    # Request body size enforcement
    content_length = request.headers.get("content-length")
    if content_length and int(content_length) > settings.MAX_REQUEST_BODY_BYTES:
        return JSONResponse(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            content={
                "success": False,
                "error": {
                    "code": "PAYLOAD_TOO_LARGE",
                    "message": f"Request body exceeds maximum allowed size of {settings.MAX_REQUEST_BODY_BYTES} bytes",
                },
                "request_id": request_id,
            },
        )

    response = await call_next(request)

    # Inject security headers & correlation ID
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    if settings.is_production:
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

    return response


# Safe CORS Configuration (Specific origin allowlist + Vercel wildcard regex)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_origin_regex=r"^https:\/\/([a-zA-Z0-9-]+\.)*vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)


# ---------------------------------------------------------------------------
# Centralized Error Handlers
# ---------------------------------------------------------------------------

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    request_id = getattr(request.state, "request_id", str(uuid.uuid4()))
    return JSONResponse(
        status_code=exc.status_code,
        headers=exc.headers or {},
        content={
            "success": False,
            "error": {
                "code": f"HTTP_{exc.status_code}",
                "message": exc.detail,
            },
            "detail": exc.detail,  # Maintain compatibility with standard FastAPI consumers
            "request_id": request_id,
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    request_id = getattr(request.state, "request_id", str(uuid.uuid4()))
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "Request body or query parameter validation failed",
                "details": exc.errors(),
            },
            "detail": exc.errors(),
            "request_id": request_id,
        },
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    request_id = getattr(request.state, "request_id", str(uuid.uuid4()))
    logger.error("Unhandled server exception", error=str(exc), request_id=request_id, exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An internal server error occurred. Please contact system support.",
            },
            "detail": "An internal server error occurred.",
            "request_id": request_id,
        },
    )


# ---------------------------------------------------------------------------
# Health & Readiness Probes
# ---------------------------------------------------------------------------

@app.get("/health", tags=["System Health"], summary="Liveness Health Check")
async def health_check():
    """Liveness probe reporting backend uptime and operational status."""
    return {
        "status": "healthy",
        "service": "linqchain-api",
        "version": "2.0.0",
        "environment": settings.ENVIRONMENT,
        "uptime_seconds": round(time.time() - SERVER_START_TIME, 2),
    }


@app.get("/ready", tags=["System Health"], summary="Readiness Health Check")
async def readiness_check():
    """Readiness probe verifying operational and administrative database connectivity."""
    db_status = "connected"
    admin_status = "connected"

    # Ping operational DB
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1 FROM DUMMY" if "hana" in str(engine.url) else "SELECT 1"))
    except Exception as e:
        db_status = f"unhealthy: {str(e)[:100]}"

    # Ping admin DB
    try:
        with admin_engine.connect() as conn:
            conn.execute(text("SELECT 1"))
    except Exception as e:
        admin_status = f"unhealthy: {str(e)[:100]}"

    is_ready = db_status == "connected" and admin_status == "connected"
    response_payload = {
        "ready": is_ready,
        "database": db_status,
        "admin_database": admin_status,
        "timestamp": time.time(),
    }

    if not is_ready:
        return JSONResponse(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, content=response_payload)
    return response_payload


# ---------------------------------------------------------------------------
# Routers Registration
# ---------------------------------------------------------------------------

# Core business routers
app.include_router(impact.router)
app.include_router(recovery.router)
app.include_router(events_api.router, prefix="/api/sap/events", tags=["SAP Event Mesh"])
app.include_router(webhooks.router, prefix="/api/sap/webhooks", tags=["SAP Event Mesh Webhooks"])

# Platform auth, admin & compliance routers
app.include_router(admin_api.router)
app.include_router(platform_auth.router)
app.include_router(compliance_api.router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
