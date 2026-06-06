@echo off
title GASTA AI Launcher
echo ============================================
echo   Starting GASTA AI...
echo ============================================
echo.
echo Opening backend (port 5000) and frontend (port 3000)
echo in separate windows. Keep both windows open while using the app.
echo.

start "GASTA Backend"  cmd /k "cd /d %~dp0server && npm run dev"
start "GASTA Frontend" cmd /k "cd /d %~dp0client && npm run dev"

echo Waiting for the app to start, then opening your browser...
timeout /t 12 /nobreak >nul
start "" http://localhost:3001

echo.
echo Done. Login: teacher@gasta.gov  /  Teacher@12345
echo To stop the app, close the two server windows.
pause
