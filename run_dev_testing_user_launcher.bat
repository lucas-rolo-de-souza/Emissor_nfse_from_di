@echo off
REM ------------------------------------------------------------------
REM -- Development Environment Launcher --
REM ------------------------------------------------------------------
REM This script automates the setup of the local development environment.
REM It performs the following steps:
REM 1. Starts the Python backend server (FastAPI).
REM 2. Starts the Node.js frontend server (Vite).
REM 3. Opens the application in the default web browser.
REM
REM Prerequisites:
REM - Python 3.7+ installed and in PATH.
REM - Node.js 18+ and npm installed and in PATH.
REM
REM First-time setup:
REM 1. Open a terminal in the 'backend' folder and run:
REM    pip install -r requirements.txt
REM 2. Open a terminal in the 'frontend' folder and run:
REM    npm install
REM ------------------------------------------------------------------

echo Starting Backend Server...
start "Backend" cmd /k "python -m uvicorn backend.app:app --reload"

echo Starting Frontend Server...
start "Frontend" cmd /k "cd frontend && npm run dev"

echo Waiting for servers to start...
timeout /t 10 /nobreak >nul

echo Launching application in browser...
start http://localhost:5173

echo.
echo ==================================================================
echo   Your development environment is up and running!
echo.
echo   - Backend API:   http://localhost:8000
echo   - Frontend App:  http://localhost:5173
echo ==================================================================
echo.
