# =============================================
# Chinook Music Store - Service Restart Script
# =============================================
# USAGE: Run this script as Administrator to restart the Chinook WebApp services
# - Stops both backend and frontend services
# - Waits for clean shutdown
# - Starts services again
# - Shows status and access information
# =============================================

# Check for Administrator privileges
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "❌ This script requires Administrator privileges." -ForegroundColor Red
    Write-Host "Please right-click and 'Run as Administrator'" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

$webAppRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition
$nssmPath = Join-Path $webAppRoot "helper-files\nssm.exe"

$backendName = "ChinookBackend"
$frontendName = "ChinookFrontend"

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "Chinook Music Store - Service Restart" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

# Check if services exist
Write-Host "Checking service status..." -ForegroundColor Yellow

$backendExists = $null -ne (Get-Service -Name $backendName -ErrorAction SilentlyContinue)
$frontendExists = $null -ne (Get-Service -Name $frontendName -ErrorAction SilentlyContinue)

if (-not $backendExists -and -not $frontendExists) {
    Write-Host "❌ No Chinook services found!" -ForegroundColor Red
    Write-Host "Services may not be installed yet. Run 'install-services.ps1' first." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Stop services
Write-Host ""
Write-Host "Stopping services..." -ForegroundColor Yellow

if ($backendExists) {
    Write-Host "Stopping $backendName..." -ForegroundColor White
    & $nssmPath stop $backendName
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Backend service stopped" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Backend service stop command completed (may have already been stopped)" -ForegroundColor Yellow
    }
}

if ($frontendExists) {
    Write-Host "Stopping $frontendName..." -ForegroundColor White
    & $nssmPath stop $frontendName
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Frontend service stopped" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Frontend service stop command completed (may have already been stopped)" -ForegroundColor Yellow
    }
}

# Wait for clean shutdown
Write-Host ""
Write-Host "Waiting for clean shutdown..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Start services
Write-Host ""
Write-Host "Starting services..." -ForegroundColor Yellow

if ($backendExists) {
    Write-Host "Starting $backendName..." -ForegroundColor White
    & $nssmPath start $backendName
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Backend service started" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to start backend service" -ForegroundColor Red
    }
}

if ($frontendExists) {
    Write-Host "Starting $frontendName..." -ForegroundColor White
    & $nssmPath start $frontendName
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Frontend service started" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to start frontend service" -ForegroundColor Red
    }
}

# Wait for startup
Write-Host ""
Write-Host "Waiting for services to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Check final status
Write-Host ""
Write-Host "Checking final status..." -ForegroundColor Yellow

if ($backendExists) {
    $backendStatus = (Get-Service -Name $backendName).Status
    $backendStatusColor = if ($backendStatus -eq "Running") { "Green" } else { "Red" }
    Write-Host "  $backendName`: $backendStatus" -ForegroundColor $backendStatusColor
}

if ($frontendExists) {
    $frontendStatus = (Get-Service -Name $frontendName).Status
    $frontendStatusColor = if ($frontendStatus -eq "Running") { "Green" } else { "Red" }
    Write-Host "  $frontendName`: $frontendStatus" -ForegroundColor $frontendStatusColor
}

Write-Host ""
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "✅ Restart Complete!" -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Cyan

if ($backendExists -and $frontendExists) {
    Write-Host ""
    Write-Host "Application should be available at: http://localhost:3001" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "If services are not responding:" -ForegroundColor White
    Write-Host "  • Check Windows Event Viewer for errors" -ForegroundColor White
    Write-Host "  • Check logs: C:\ProgramData\Red Gate\Logs\ChinookWebApp\" -ForegroundColor White
    Write-Host "  • Try running install-services.ps1 again if issues persist" -ForegroundColor White
}

Write-Host ""
Read-Host "Press Enter to exit"