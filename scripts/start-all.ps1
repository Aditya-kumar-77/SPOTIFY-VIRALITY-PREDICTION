# Start all services for Spotify Virality Prediction

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $root


Write-Host "Starting Spotify Virality Prediction stack..." -ForegroundColor Green

$mlProc = $null
$backendProc = $null
$frontendProc = $null

try {
    # Start ML service (Python)
    $mlProc = Start-Process -FilePath "python" -ArgumentList "-m", "uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000" -WorkingDirectory "ml_service" -PassThru -WindowStyle Normal

    # Wait for ML to be ready
    Start-Sleep -Seconds 3

    # Start Backend (Node)
    $backendProc = Start-Process -FilePath "node" -ArgumentList "src/index.js" -WorkingDirectory "backend" -PassThru -WindowStyle Normal

    # Wait for backend to be ready
    Start-Sleep -Seconds 2

    # Start Frontend (Vite)
    $frontendProc = Start-Process -FilePath "node" -ArgumentList "node_modules/vite/bin/vite.js" -WorkingDirectory "frontend" -PassThru -WindowStyle Normal

    Write-Host ""
    Write-Host "Services started:" -ForegroundColor Green
    Write-Host "  ML Service:  http://localhost:8000" -ForegroundColor Cyan
    Write-Host "  Backend:    http://localhost:3001" -ForegroundColor Cyan
    Write-Host "  Frontend:   http://localhost:5173" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Press Ctrl+C to stop all services." -ForegroundColor Yellow

    # Keep the script running to hold the session and catch Ctrl+C
    while ($true) {
        Start-Sleep -Seconds 1
    }
}
finally {
    Write-Host "`nStopping all services..." -ForegroundColor Red
    if ($mlProc) { Stop-Process -InputObject $mlProc -Force -ErrorAction SilentlyContinue }
    if ($backendProc) { Stop-Process -InputObject $backendProc -Force -ErrorAction SilentlyContinue }
    if ($frontendProc) { Stop-Process -InputObject $frontendProc -Force -ErrorAction SilentlyContinue }
    Write-Host "All services stopped." -ForegroundColor Green
}
