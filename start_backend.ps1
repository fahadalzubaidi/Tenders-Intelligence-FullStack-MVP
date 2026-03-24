# Start the FastAPI backend
Write-Host "Starting Jyad Backend (FastAPI)..." -ForegroundColor Cyan

Set-Location "$PSScriptRoot\backend"

# Install dependencies if needed
if (-not (Test-Path "venv")) {
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
}

# Activate venv
& ".\venv\Scripts\Activate.ps1"

# Install requirements
pip install -r requirements.txt --quiet

Write-Host "Backend running at http://localhost:8001" -ForegroundColor Green
Write-Host "API docs at http://localhost:8001/docs" -ForegroundColor Green
Write-Host ""

uvicorn main:app --reload --host 0.0.0.0 --port 8001
