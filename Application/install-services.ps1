# =============================================
# Chinook Music Store - Windows Service Installer (React/TypeScript)
# =============================================
# USAGE: Run this script as Administrator to install the Chinook WebApp as Windows services
# - Automatically checks and installs prerequisites (Node.js)
# - Uses bundled NSSM (no need to install separately)
# - Builds React frontend and installs backend service
# - Backend serves both API and built React app
# - Service starts automatically on boot
# =============================================

# Requires Administrator privileges
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "[ERROR] This script requires Administrator privileges." -ForegroundColor Red
    Write-Host "Please right-click and 'Run as Administrator'" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

$webAppRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition
$nssmPath = Join-Path $webAppRoot "helper-files\nssm.exe"

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "Chinook Music Store - Service Installation" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

# Check for Node.js
Write-Host "Checking for Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = & node --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Node.js found: $nodeVersion" -ForegroundColor Green
    } else {
        throw "Node.js not found"
    }
} catch {
    Write-Host "[ERROR] Node.js not found or not working properly." -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Node.js:" -ForegroundColor Yellow
    Write-Host "1. Download from: https://nodejs.org/" -ForegroundColor White
    Write-Host "2. Choose the LTS version" -ForegroundColor White
    Write-Host "3. Run the installer with default settings" -ForegroundColor White
    Write-Host "4. Restart this script after installation" -ForegroundColor White
    Write-Host ""
    $choice = Read-Host "Open Node.js download page? (y/n)"
    if ($choice -eq 'y' -or $choice -eq 'Y') {
        Start-Process "https://nodejs.org/"
    }
    Read-Host "Press Enter to exit"
    exit 1
}

# Check for npm
Write-Host "Checking for npm..." -ForegroundColor Yellow
try {
    $npmVersion = & npm --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] npm found: $npmVersion" -ForegroundColor Green
    } else {
        throw "npm not found"
    }
} catch {
    Write-Host "[ERROR] npm not found. npm should come with Node.js installation." -ForegroundColor Red
    Write-Host "Please reinstall Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check for NSSM
Write-Host "Checking for NSSM..." -ForegroundColor Yellow
if (Test-Path $nssmPath) {
    Write-Host "[OK] NSSM found: $nssmPath" -ForegroundColor Green
} else {
    Write-Host "[ERROR] NSSM not found at: $nssmPath" -ForegroundColor Red
    Write-Host "Please ensure nssm.exe is in the helper-files folder" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Find Node.js executable path
$nodePath = (Get-Command node).Source
Write-Host "Node.js executable: $nodePath" -ForegroundColor White

# Ensure Node.js dependencies are installed
Write-Host ""
Write-Host "Installing Node.js dependencies..." -ForegroundColor Yellow
Push-Location $webAppRoot

try {
    Write-Host "Installing pg driver..." -ForegroundColor White
    npm install pg --save
    if ($LASTEXITCODE -ne 0) { throw "Failed to install pg driver" }
    
    Write-Host "Installing mysql2 driver..." -ForegroundColor White
    npm install mysql2 --save
    if ($LASTEXITCODE -ne 0) { throw "Failed to install mysql2 driver" }
    
    Write-Host "Installing chokidar file watcher..." -ForegroundColor White
    npm install chokidar --save
    if ($LASTEXITCODE -ne 0) { throw "Failed to install chokidar" }
    
    Write-Host "Installing oracledb driver..." -ForegroundColor White
    npm install oracledb --save
    if ($LASTEXITCODE -ne 0) { 
        Write-Host "[WARNING] OracleDB driver installation failed. Oracle databases will not be available." -ForegroundColor Yellow
        Write-Host "This is normal if you don't have Oracle client libraries installed." -ForegroundColor White
    }
    
    Write-Host "Installing React and TypeScript dependencies..." -ForegroundColor White
    npm install react react-dom react-router-dom react-hook-form lucide-react --save
    if ($LASTEXITCODE -ne 0) { throw "Failed to install React dependencies" }
    
    Write-Host "Installing TypeScript and build tools..." -ForegroundColor White
    npm install typescript @types/react @types/react-dom @types/node --save-dev
    if ($LASTEXITCODE -ne 0) { throw "Failed to install TypeScript dependencies" }
    
    Write-Host "Installing Vite and development tools..." -ForegroundColor White
    npm install vite @vitejs/plugin-react concurrently --save-dev
    if ($LASTEXITCODE -ne 0) { throw "Failed to install Vite and development tools" }
    
    Write-Host "Installing Tailwind CSS and PostCSS..." -ForegroundColor White
    npm install tailwindcss@^3.3.5 postcss autoprefixer --save-dev
    if ($LASTEXITCODE -ne 0) { throw "Failed to install Tailwind CSS" }
    
    Write-Host "Installing other dependencies..." -ForegroundColor White
    npm install
    if ($LASTEXITCODE -ne 0) { throw "Failed to install dependencies" }
    
    Write-Host "Building React frontend..." -ForegroundColor White
    npm run build
    if ($LASTEXITCODE -ne 0) { throw "Failed to build React frontend" }
    
    Write-Host "[OK] Dependencies and frontend build completed successfully" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Error installing dependencies: $_" -ForegroundColor Red
    Pop-Location
    Read-Host "Press Enter to exit"
    exit 1
}

Pop-Location

# Create log directory
$logDir = "C:\ProgramData\Red Gate\Logs\ChinookWebApp"
if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir -Force | Out-Null
    Write-Host "[OK] Created log directory: $logDir" -ForegroundColor Green
} else {
    Write-Host "[OK] Log directory exists: $logDir" -ForegroundColor Green
}

# Service configuration
$backendName = "ChinookBackend"
$backendScript = Join-Path $webAppRoot "server.js"

Write-Host ""
Write-Host "Installing Windows Service..." -ForegroundColor Yellow

# Remove existing backend service if it exists
Write-Host "Checking for existing services..." -ForegroundColor White

# Check and remove backend service
& $nssmPath status $backendName 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "Found existing $backendName service - removing..." -ForegroundColor Yellow
    & $nssmPath stop $backendName 2>$null
    Start-Sleep -Seconds 2
    & $nssmPath remove $backendName confirm 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Successfully removed existing $backendName service" -ForegroundColor Green
    } else {
        Write-Host "[WARNING] Could not remove existing $backendName service" -ForegroundColor Yellow
    }
} else {
    Write-Host "No existing $backendName service found" -ForegroundColor White
}

# Remove any legacy frontend service
& $nssmPath status "ChinookFrontend" 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "Found legacy ChinookFrontend service - removing..." -ForegroundColor Yellow
    & $nssmPath stop "ChinookFrontend" 2>$null
    Start-Sleep -Seconds 2
    & $nssmPath remove "ChinookFrontend" confirm 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Successfully removed legacy ChinookFrontend service" -ForegroundColor Green
    }
}

# Install Backend service
Write-Host "Installing Backend service ($backendName)..." -ForegroundColor White
& $nssmPath install $backendName $nodePath $backendScript
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to install backend service" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

& $nssmPath set $backendName AppDirectory $webAppRoot
& $nssmPath set $backendName DisplayName "Chinook Music Store - React WebApp"
& $nssmPath set $backendName Start SERVICE_AUTO_START
& $nssmPath set $backendName AppStdout "$logDir\backend.log"
& $nssmPath set $backendName AppStderr "$logDir\backend-error.log"
& $nssmPath set $backendName AppRestartDelay 5000
& $nssmPath set $backendName AppThrottle 1500

Write-Host "[OK] Backend service configured successfully" -ForegroundColor Green

# Start service
Write-Host ""
Write-Host "Starting service..." -ForegroundColor Yellow

Write-Host "Starting Backend service..." -ForegroundColor White
& $nssmPath start $backendName
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to start backend service" -ForegroundColor Red
    Write-Host "Checking backend error log..." -ForegroundColor Yellow
    $backendErrorLog = "$logDir\backend-error.log"
    if (Test-Path $backendErrorLog) {
        Write-Host "Backend Error Log:" -ForegroundColor Red
        Get-Content $backendErrorLog -Tail 10 | Write-Host -ForegroundColor Yellow
    } else {
        Write-Host "No backend error log found yet" -ForegroundColor Yellow
    }
} else {
    Write-Host "[OK] Backend service started" -ForegroundColor Green
}

Write-Host ""
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "[SUCCESS] Installation Complete!" -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Service installed:" -ForegroundColor White
Write-Host "  • $backendName - Chinook Music Store React WebApp" -ForegroundColor White
Write-Host ""

# Check final service status
Write-Host "Final service status check:" -ForegroundColor Yellow
& $nssmPath status $backendName

Write-Host ""
Write-Host "🌐 Access the application at: http://localhost:3001" -ForegroundColor Yellow
Write-Host ""
Write-Host "🚀 AUTO-UPDATE FEATURES ENABLED:" -ForegroundColor Green
Write-Host "  • File watching for automatic frontend rebuilds" -ForegroundColor White
Write-Host "  • Git pull detection and auto-rebuild" -ForegroundColor White
Write-Host "  • Manual update via: .\auto-update.ps1" -ForegroundColor White
Write-Host "  • Quick update via: .\quick-update.bat" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Demo VM Setup:" -ForegroundColor Yellow
Write-Host "  For automatic git pull updates, run:" -ForegroundColor White
Write-Host "  .\setup-scheduled-update.ps1" -ForegroundColor White
Write-Host ""
Write-Host "The Express server now serves both the API and the built React frontend." -ForegroundColor White
Write-Host "The React app is built and served from the /dist directory." -ForegroundColor White
Write-Host ""
Write-Host "If service shows as 'PAUSED' or fails to start:" -ForegroundColor Yellow
Write-Host "1. Check log files: $logDir" -ForegroundColor White
Write-Host "2. Manually start: services.msc -> Find service -> Right-click -> Start" -ForegroundColor White
Write-Host "3. Or use: .\helper-files\nssm.exe start $backendName" -ForegroundColor White
Write-Host ""
Write-Host "Service management commands:" -ForegroundColor White
Write-Host "  • View services: services.msc" -ForegroundColor White
Write-Host "  • Stop service: .\helper-files\nssm.exe stop $backendName" -ForegroundColor White
Write-Host "  • Start service: .\helper-files\nssm.exe start $backendName" -ForegroundColor White
Write-Host "  • Remove service: .\helper-files\nssm.exe remove $backendName confirm" -ForegroundColor White
Write-Host ""
Write-Host "Log files location: $logDir" -ForegroundColor White
Write-Host ""
Read-Host "Press Enter to exit"
