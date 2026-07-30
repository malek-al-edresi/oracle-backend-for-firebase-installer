# ══════════════════════════════════════════════════════════════
# Oracle Backend for Firebase Installer — Quick Start (Windows)
# ══════════════════════════════════════════════════════════════

Write-Host "Checking Node.js..."
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "Node.js is required but not installed." -ForegroundColor Red
    Write-Host "Please install Node.js 18.0.0 or higher." -ForegroundColor Red
    exit 1
}

$NodeVersion = (node -v).TrimStart('v')
Write-Host "Node.js version $NodeVersion found."

Write-Host "Checking npm..."
if (!(Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "npm is required but not installed." -ForegroundColor Red
    exit 1
}

if (!(Test-Path .env)) {
    Write-Host "Generating .env from .env.example..."
    Copy-Item .env.example .env
    Write-Host "Please configure .env and run this script again." -ForegroundColor Yellow
    exit 0
}

Write-Host "Installing dependencies..."
npm install --silent

Write-Host "Starting Installer..."
node bin\obf-installer.js install
