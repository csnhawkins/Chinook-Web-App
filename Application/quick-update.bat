@echo off
REM =============================================
REM Chinook WebApp - Quick Update
REM =============================================
REM Simple batch file to trigger git pull and rebuild
REM =============================================

echo.
echo ====================================================
echo Chinook WebApp - Quick Update
echo ====================================================
echo.

REM Check if PowerShell is available
powershell -Command "Get-Host" >nul 2>&1
if errorlevel 1 (
    echo [ERROR] PowerShell is required but not available
    pause
    exit /b 1
)

REM Run the PowerShell update script
powershell -ExecutionPolicy Bypass -File "%~dp0auto-update.ps1"

echo.
echo Press any key to exit...
pause >nul