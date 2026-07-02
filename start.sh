#!/bin/bash

# Start Academic Affairs - Backend and Frontend

echo "Starting Academic Affairs..."

# Start backend in background
echo "Starting backend on http://localhost:3000..."
cd backend && npm run start:dev &
BACKEND_PID=$!

# Wait a moment for backend to initialize
sleep 3

# Start frontend in background
echo "Starting frontend on http://localhost:5173..."
cd ../frontend && npm run dev &
FRONTEND_PID=$!

echo ""
echo "=================================="
echo "  Academic Affairs is running!"
echo "=================================="
echo "  Backend:  http://localhost:3000"
echo "  Swagger:  http://localhost:3000/api/docs"
echo "  Frontend: http://localhost:5173"
echo "=================================="
echo ""
echo "Press Ctrl+C to stop both servers"

# Handle Ctrl+C to kill both processes
trap "echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" SIGINT SIGTERM

# Wait for both processes
wait
