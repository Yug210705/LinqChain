from typing import Optional
from fastapi import APIRouter, Header, HTTPException, Depends, Request, status
from pydantic import BaseModel, Field
import structlog

from app.api.events import broadcast_event
from app.core.config import settings
from app.core.rate_limiter import rate_limit, webhook_rate_limiter

logger = structlog.get_logger("linqchain.webhooks")
router = APIRouter()


class SapWebhookPayload(BaseModel):
    event_type: str = Field(..., max_length=100, description="SAP Event classification (e.g. DISRUPTION_ALERT)")
    material_id: str = Field(..., max_length=50, description="Target material identifier")
    message: str = Field(..., max_length=500, description="Human readable incident message")
    severity: str = Field(default="HIGH", max_length=20, description="Incident severity level")


@router.post(
    "/trigger",
    summary="SAP Event Mesh Webhook Receiver",
    dependencies=[Depends(rate_limit(webhook_rate_limiter))],
)
async def receive_sap_webhook(
    payload: SapWebhookPayload,
    request: Request,
    x_sap_webhook_secret: Optional[str] = Header(None, alias="X-SAP-Webhook-Secret"),
):
    """
    Inbound Event Mesh notification receiver from SAP BTP.
    Validates shared secret authorization and broadcasts to authorized subscribers.
    """
    # Verify shared secret
    expected_secret = settings.SAP_WEBHOOK_SECRET
    if settings.is_production:
        if not x_sap_webhook_secret or x_sap_webhook_secret != expected_secret:
            logger.warning("Unauthorized SAP webhook attempt", ip=request.client.host if request.client else "unknown")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or missing X-SAP-Webhook-Secret authorization header",
            )
    elif x_sap_webhook_secret and x_sap_webhook_secret != expected_secret:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid X-SAP-Webhook-Secret header",
        )

    logger.info(
        "Received authenticated SAP Webhook Event",
        event_type=payload.event_type,
        material_id=payload.material_id,
        severity=payload.severity,
    )

    broadcast_event("SAP_DISRUPTION_EVENT", {
        "event_type": payload.event_type,
        "material_id": payload.material_id,
        "message": payload.message,
        "severity": payload.severity,
    })

    return {"status": "SUCCESS", "message": "Broadcasted to Event Mesh listeners"}

