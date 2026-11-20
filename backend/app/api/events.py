import asyncio
import json
from typing import AsyncGenerator, Optional
from fastapi import APIRouter, HTTPException, Query, Request, status
from fastapi.responses import StreamingResponse
import structlog

from app.core.config import settings
from app.core.security import decode_token

logger = structlog.get_logger("linqchain.events")

router = APIRouter()

MAX_SSE_SUBSCRIBERS = 100
event_queues = []


def broadcast_event(event_type: str, data: dict):
    """Broadcast an SSE event frame to all registered client queues."""
    message_bytes = f"event: {event_type}\ndata: {json.dumps(data)}\n\n".encode("utf-8")
    dead_queues = []
    for q in list(event_queues):
        try:
            q.put_nowait(message_bytes)
        except Exception:
            dead_queues.append(q)
    for dq in dead_queues:
        if dq in event_queues:
            event_queues.remove(dq)
    logger.info("Broadcasted SAP Event", event_type=event_type, listeners=len(event_queues))


async def event_generator(request: Request) -> AsyncGenerator[bytes, None]:
    queue = asyncio.Queue(maxsize=50)
    event_queues.append(queue)

    try:
        init_data = json.dumps({"status": "Connected to SAP Event Mesh (BTP)"})
        yield f"event: connection\ndata: {init_data}\n\n".encode("utf-8")

        while True:
            if await request.is_disconnected():
                break

            try:
                msg_bytes = await asyncio.wait_for(queue.get(), timeout=15.0)
                yield msg_bytes
            except asyncio.TimeoutError:
                yield b": keep-alive\n\n"
    finally:
        if queue in event_queues:
            event_queues.remove(queue)


@router.get("/stream", summary="SAP Event Mesh Stream")
async def sap_events_stream(
    request: Request,
    token: Optional[str] = Query(None, description="Optional Bearer token for SSE clients"),
):
    """
    Subscribes client to live SAP disruption events via Server-Sent Events (SSE).
    Enforces maximum subscriber limit and optional auth validation.
    """
    # 1. Enforce max subscriber capacity
    if len(event_queues) >= MAX_SSE_SUBSCRIBERS:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Maximum Event Mesh subscriber capacity reached. Please try again shortly.",
        )

    # 2. Token validation in production mode
    if settings.is_production:
        auth_header = request.headers.get("authorization", "")
        raw_token = token or (auth_header.replace("Bearer ", "").strip() if auth_header.startswith("Bearer ") else None)
        if not raw_token or not decode_token(raw_token):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required to subscribe to SAP Event Mesh stream",
            )

    return StreamingResponse(
        event_generator(request),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )

