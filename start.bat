@echo off
title Academic Affairs

echo Starting Academic Affairs...
echo.

:: Start backend in new window
echo Starting backend on http://localhost:3000...
start "Backend" cmd /c "cd /d %~dp0backend && npm run start:dev"

:: Wait for backend to initialize
timeout /t 3 /nobreak >nul

:: Start frontend in new window
echo Starting frontend on http://localhost:5173...
start "Frontend" cmd /c "cd /d %~dp0frontend && npm run dev"

echo.
echo ==================================
echo   Academic Affairs is running!
echo ==================================
echo   Backend:  http://localhost:3000
echo   Swagger:  http://localhost:3000/api/docs
echo   Frontend: http://localhost:5173
echo ==================================
echo.
echo Close the Backend and Frontend windows to stop the servers.
pause
