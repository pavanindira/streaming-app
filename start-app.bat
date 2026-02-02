@echo off
echo Stopping existing processes...

:: Kill process on port 3000 (Backend)
powershell -Command "Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }"

:: Kill process on port 5173 (Frontend)
powershell -Command "Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }"

echo Starting Music Streaming App...

:: Start Backend
start "Music App Backend" cmd /k "cd backend && npm start"

:: Start Frontend
start "Music App Frontend" cmd /k "cd frontend && npm run dev"

echo Services started in new windows.
