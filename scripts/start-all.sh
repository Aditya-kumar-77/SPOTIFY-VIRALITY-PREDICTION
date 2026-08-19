#!/bin/bash
# Start all services for Spotify Virality Prediction
# Requires: PostgreSQL, Python, Node.js

set -e
cd "$(dirname "$0")/.."

echo "Starting Spotify Virality Prediction stack..."

# Start ML service in background
(cd ml_service && python -m uvicorn app:app --host 0.0.0.0 --port 8000) &
ML_PID=$!

sleep 3

# Start Backend in background
(cd backend && node src/index.js) &
BACKEND_PID=$!

sleep 2

# Start Frontend
(cd frontend && npm run dev) &
FRONTEND_PID=$!

echo ""
echo "Services started:"
echo "  ML Service:  http://localhost:8000"
echo "  Backend:     http://localhost:3001"
echo "  Frontend:    http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop."

trap "kill $ML_PID $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait
