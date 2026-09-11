@echo off
title RecoverAI Platform Launcher
color 0A
echo ===================================================
echo   RecoverAI - Autonomous AI Revenue Recovery Platform
echo   Track 03: AI Revenue Recovery ^| Razorpay
echo ===================================================
echo.

echo [1/3] Starting Backend API Server (FastAPI on Port 8000)...
cd /d "%~dp0backend"
start "RecoverAI Backend (Port 8000)" cmd /k "python -m uvicorn app.main:app --port 8000"

timeout /t 2 >nul

echo [2/3] Starting Frontend Dev Server (Vite on Port 3000)...
cd /d "%~dp0frontend"
start "RecoverAI Frontend (Port 3000)" cmd /k "npm run dev"

timeout /t 3 >nul

echo [3/3] Launching RecoverAI in Browser...
start "" "http://localhost:3000"

echo.
echo ===================================================
echo   Platform is running!
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:8000
echo   API Docs: http://localhost:8000/docs
echo ===================================================
echo.
pause
