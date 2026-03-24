# Start the React frontend
Write-Host "Starting Jyad Frontend (React + Vite)..." -ForegroundColor Cyan

Set-Location "$PSScriptRoot\frontend"

# Install dependencies if needed
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing npm packages..." -ForegroundColor Yellow
    npm install
}

Write-Host "Frontend running at http://localhost:5173" -ForegroundColor Green
Write-Host ""

npm run dev
