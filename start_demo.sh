#!/bin/bash
set -e
cd "$(dirname "$0")"

echo "===================================================="
echo "Starting RESILIENCE OS (Hackathon Demo Environment)"
echo "===================================================="

# Offline mode when the HANA instance is stopped:
#   RESILIENCE_SQLITE=1 ./start_demo.sh
echo "[1/2] Starting Unified Backend API on Port 8000..."
(cd backend && ./venv/Scripts/python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload > /tmp/resilience-backend.log 2>&1) &
BACKEND_PID=$!

sleep 6

echo "[2/2] Starting Frontend (Next.js) on Port 3000..."
(cd frontend && npm run dev > /tmp/resilience-frontend.log 2>&1) &
FRONTEND_PID=$!

echo "===================================================="
echo "Services started!"
echo "  Frontend:  http://localhost:3000"
echo "  Backend:   http://localhost:8000/docs"
echo "Press Ctrl+C to stop all services."
echo "===================================================="

trap "kill $BACKEND_PID $FRONTEND_PID" SIGINT SIGTERM
wait