# =============================================
# Chinook WebApp - Auto Update Script
# =============================================
# This script performs a git pull and triggers frontend rebuild
# Perfect for demo VM scenarios where you want seamless updates
# =============================================

param(
    [string]$ServiceName = "ChinookBackend",
    [string]$WebAppPort = "3001",
    [switch]$Force,
    [switch]$Quiet
)

$webAppRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition

if (-not $Quiet) {
    Write-Host "====================================================" -ForegroundColor Cyan
    Write-Host "Chinook WebApp - Auto Update" -ForegroundColor Cyan
    Write-Host "====================================================" -ForegroundColor Cyan
}

# Function to write colored output (respects quiet mode)
function Write-Status {
    param($Message, $Color = "White", $IsError = $false)
    if (-not $Quiet -or $IsError) {
        Write-Host $Message -ForegroundColor $Color
    }
}

# Change to webapp directory
Push-Location $webAppRoot

try {
    # Check if we're in a git repository
    if (-not (Test-Path ".git")) {
        Write-Status "[ERROR] Not a git repository. This script must be run from the Chinook WebApp directory." "Red" $true
        exit 1
    }

    # Check current git status
    Write-Status "Checking git status..." "Yellow"
    $gitStatus = & git status --porcelain 2>$null
    
    if ($gitStatus -and -not $Force) {
        Write-Status "[WARNING] You have uncommitted changes:" "Yellow"
        Write-Status $gitStatus "White"
        Write-Status "Use -Force to stash changes and proceed" "Yellow"
        exit 1
    }

    if ($gitStatus -and $Force) {
        Write-Status "Stashing local changes..." "Yellow"
        & git stash push -m "Auto-stash before update $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
        if ($LASTEXITCODE -ne 0) {
            Write-Status "[ERROR] Failed to stash changes" "Red" $true
            exit 1
        }
        Write-Status "[OK] Local changes stashed" "Green"
    }

    # Get current commit hash for comparison
    $beforeCommit = & git rev-parse HEAD
    Write-Status "Current commit: $($beforeCommit.Substring(0,8))" "White"

    # Perform git pull
    Write-Status "Pulling latest changes..." "Yellow"
    $pullOutput = & git pull origin main 2>&1
    
    if ($LASTEXITCODE -ne 0) {
        Write-Status "[ERROR] Git pull failed:" "Red" $true
        Write-Status $pullOutput "Red" $true
        exit 1
    }

    # Check if anything was actually updated
    $afterCommit = & git rev-parse HEAD
    
    if ($beforeCommit -eq $afterCommit) {
        Write-Status "[INFO] Already up to date - no changes pulled" "Green"
        
        # Still trigger rebuild if Force is specified
        if ($Force) {
            Write-Status "Force rebuild requested..." "Yellow"
        } else {
            Write-Status "No rebuild needed" "Green"
            Pop-Location
            exit 0
        }
    } else {
        Write-Status "[OK] Updated to commit: $($afterCommit.Substring(0,8))" "Green"
        Write-Status "Changes pulled successfully" "Green"
    }

    # Check if service is running
    Write-Status "Checking service status..." "Yellow"
    $service = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
    
    if (-not $service) {
        Write-Status "[WARNING] Service '$ServiceName' not found" "Yellow"
        Write-Status "Attempting direct rebuild via API..." "Yellow"
    } elseif ($service.Status -ne 'Running') {
        Write-Status "[WARNING] Service '$ServiceName' is not running" "Yellow"
        Write-Status "Attempting to start service..." "Yellow"
        Start-Service -Name $ServiceName
        Start-Sleep -Seconds 3
    }

    # Trigger frontend rebuild via API
    Write-Status "Triggering frontend rebuild..." "Yellow"
    
    try {
        $rebuildUrl = "http://localhost:$WebAppPort/api/rebuild-frontend"
        $response = Invoke-RestMethod -Uri $rebuildUrl -Method POST -TimeoutSec 10
        
        if ($response.success) {
            Write-Status "[OK] Frontend rebuild triggered successfully" "Green"
            Write-Status "New changes will be available shortly at: http://localhost:$WebAppPort" "White"
        } else {
            throw "API returned error: $($response.error)"
        }
    } catch {
        Write-Status "[WARNING] Could not trigger automatic rebuild: $_" "Yellow"
        Write-Status "You may need to manually restart the service or rebuild the frontend" "Yellow"
        
        # Fallback: try npm build if we can't reach the API
        if (Test-Path "package.json") {
            Write-Status "Attempting manual build..." "Yellow"
            $buildOutput = & npm run build 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Status "[OK] Manual build completed" "Green"
            } else {
                Write-Status "[ERROR] Manual build failed: $buildOutput" "Red" $true
            }
        }
    }

    Write-Status "" "White"
    Write-Status "====================================================" "Cyan"
    Write-Status "[SUCCESS] Update completed!" "Green"
    Write-Status "====================================================" "Cyan"
    Write-Status "" "White"
    Write-Status "Application Status:" "White"
    Write-Status "  • Git: Updated to $($afterCommit.Substring(0,8))" "White"
    Write-Status "  • Frontend: Rebuild triggered" "White"
    Write-Status "  • URL: http://localhost:$WebAppPort" "White"
    Write-Status "" "White"
    Write-Status "The service automatically detects git changes and rebuilds," "White"
    Write-Status "so future updates will be seamless!" "White"

} catch {
    Write-Status "[ERROR] Update failed: $_" "Red" $true
    exit 1
} finally {
    Pop-Location
}