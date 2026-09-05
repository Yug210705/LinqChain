@echo off
echo ====================================================
echo Starting RESILIENCE OS (Hackathon Demo Environment)
echo ====================================================
cd /d "%~dp0"

echo [1/2] Starting Unified Backend API on Port 8000...
start cmd /k "cd backend && venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

timeout /t 6 /nobreak > NUL

echo [2/2] Starting Frontend (Next.js) on Port 3000...
start cmd /k "cd frontend && npm run dev"

echo ====================================================
echo Services started!
echo   Frontend:  http://localhost:3000
echo   Backend:   http://localhost:8000/docs
echo =
echo Offline mode (HANA stopped): set RESILIENCE_SQLITE=1
echo before launching the backend, e.g.:
echo   set RESILIENCE_SQLITE=1 && cd backend && venv\Scripts\python.exe -m uvicorn app.main:app --port 8000 --reload
echo ====================================================