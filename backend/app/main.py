"""RESILIENCE OS — unified backend entrypoint.

One command, one process, one API:
    cd backend
    venv/Scripts/python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# 1) Load env FIRST (orchestrator reads OPENROUTER_API_KEY at import time)
from app.core import config

config.load_env()

# 2) Import the whole package so every ORM table registers on the shared Base
from app import models  # noqa: E402,F401
from app.api import events as events_api  # noqa: E402
from app.api import impact, recovery, webhooks  # noqa: E402
from app.core.database import Base, engine  # noqa: E402
from app.core.database import warm_db  # noqa: E402
from app.core.runtime import start_prewarm  # noqa: E402

# 3) Schema + pool warm-up + background graph pre-warm
Base.metadata.create_all(bind=engine)
warm_db()
start_prewarm()

app = FastAPI(
    title="RESILIENCE OS API",
    description="Unified backend — Impact Engine (topology & disruptions) + "
                "AI/SAP service (recovery, scenarios, plans, audit) on a single API.",
    version="2.0.0",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(impact.router)
app.include_router(recovery.router)
app.include_router(events_api.router, prefix="/api/sap/events", tags=["SAP Event Mesh"])
app.include_router(webhooks.router, prefix="/api/sap/webhooks", tags=["SAP Event Mesh Webhooks"])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)