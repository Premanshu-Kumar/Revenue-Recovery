Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  RecoverAI - Autonomous AI Revenue Recovery Platform" -ForegroundColor Green
Write-Host "  Track 03: AI Revenue Recovery | Razorpay" -ForegroundColor Yellow
Write-Host "===================================================" -ForegroundColor Cyan

$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $rootDir) { $rootDir = Get-Location }

Write-Host "`n[1/3] Starting Backend API Server (FastAPI on Port 8000)..." -ForegroundColor Cyan
Start-Process -FilePath "cmd.exe" -ArgumentList "/k", "cd /d `"$rootDir\backend`" && python -m uvicorn app.main:app --port 8000" -WindowStyle Normal

Start-Sleep -Seconds 2

Write-Host "[2/3] Starting Frontend Dev Server (Vite on Port 3000)..." -ForegroundColor Cyan
Start-Process -FilePath "cmd.exe" -ArgumentList "/k", "cd /d `"$rootDir\frontend`" && npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 3

Write-Host "[3/3] Opening RecoverAI in Default Browser..." -ForegroundColor Green
Start-Process "http://localhost:3000"

Write-Host "`nPlatform is running successfully!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "Backend:  http://localhost:8000" -ForegroundColor White
Write-Host "API Docs: http://localhost:8000/docs" -ForegroundColor White
