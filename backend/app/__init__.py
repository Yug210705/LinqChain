"""LINQCHAIN — unified backend package.

Single API on :8000 combining the Impact Engine (topology / disruptions) and
the AI & SAP service (recovery / scenarios / plans / audit).

Run:
    cd backend
    venv/Scripts/python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
"""