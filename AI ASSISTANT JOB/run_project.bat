@echo off
title SkillBridge AI - Startup Launcher
color 0A

echo ========================================================
echo        Starting SkillBridge AI Project Platform
echo ========================================================
echo.

cd /d "%~dp0backend" 2>nul || cd /d "%~dp0"

set "VENV_PY=..\project\Scripts\python.exe"
if not exist "%VENV_PY%" (
    set "VENV_PY=project\Scripts\python.exe"
)
if not exist "%VENV_PY%" (
    set "VENV_PY=python"
)

echo [*] Initializing database & seed data...
"%VENV_PY%" seed_data.py
echo.

echo [*] Launching FastAPI Web Server at http://127.0.0.1:8000 ...
start "" "http://127.0.0.1:8000/"

"%VENV_PY%" -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

pause
