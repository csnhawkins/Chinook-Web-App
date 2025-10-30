# =============================================
# Install Missing Dependencies Script
# =============================================
# This script checks for and installs any missing Node.js dependencies
# Run this after git pull to ensure all new dependencies are installed

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "Checking for Missing Dependencies" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

$webAppRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition

# Check if package.json exists
$packageJsonPath = Join-Path $webAppRoot "package.json"
if (-not (Test-Path $packageJsonPath)) {
    Write-Host "[ERROR] package.json not found" -ForegroundColor Red
    exit 1
}

# Check if node_modules exists
$nodeModulesPath = Join-Path $webAppRoot "node_modules"
if (-not (Test-Path $nodeModulesPath)) {
    Write-Host "[INFO] node_modules not found - running full install" -ForegroundColor Yellow
    npm install
    exit $LASTEXITCODE
}

# Check for specific missing dependencies
Write-Host "Checking for chokidar..." -ForegroundColor Yellow
$chokidarPath = Join-Path $nodeModulesPath "chokidar"
if (-not (Test-Path $chokidarPath)) {
    Write-Host "[INFO] chokidar not found - installing..." -ForegroundColor Yellow
    npm install chokidar --save
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] chokidar installed successfully" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] Failed to install chokidar" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "[OK] chokidar is already installed" -ForegroundColor Green
}

# Run npm install to catch any other missing dependencies
Write-Host ""
Write-Host "Running npm install to check for other missing dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "[SUCCESS] All dependencies are up to date!" -ForegroundColor Green
    Write-Host ""
    Write-Host "If services are running, restart them to pick up new dependencies:" -ForegroundColor Yellow
    Write-Host "  • Windows Services: services.msc -> Restart services" -ForegroundColor White
    Write-Host "  • Or run: .\restart-services.ps1" -ForegroundColor White
} else {
    Write-Host "[ERROR] Some dependencies failed to install" -ForegroundColor Red
    exit 1
}

Write-Host ""
Read-Host "Press Enter to exit"