REM =============================================
REM USAGE: Double-click this file to start the Chinook Music Store demo interactively in two PowerShell windows.
REM - Automatically checks and installs Node.js if needed
REM - Installs dependencies including React/TypeScript frontend
REM - Builds React frontend and starts both backend and frontend servers
REM - Output appears in the PowerShell windows and logs to C:\ProgramData\Red Gate\Logs\ChinookWebApp
REM - Use this for debugging or interactive development.
REM =============================================
@echo off
cd /d %~dp0

echo ===================================================
echo Chinook Music Store - Development Startup (React)
echo ===================================================

REM Check for Node.js installation
echo Checking for Node.js...
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Node.js not found. Please install Node.js from https://nodejs.org/
    echo Download the LTS version and run the installer with default settings.
    echo After installation, restart this script.
    echo.
    echo Opening Node.js download page...
    start https://nodejs.org/
    echo.
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

REM Check Node.js version
for /f "tokens=*" %%i in ('node --version 2^>nul') do set NODE_VERSION=%%i
if "%NODE_VERSION%"=="" (
    echo Error: Node.js detected but version check failed.
    echo Please reinstall Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js found: %NODE_VERSION%

REM Check for npm
echo Checking for npm...
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo npm not found. npm should come with Node.js installation.
    echo Please reinstall Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo npm found and ready.

REM Install required Node.js packages
echo ===================================================
echo Installing Node.js dependencies...
echo ===================================================
echo Installing pg driver...
call npm install pg --save
if %ERRORLEVEL% neq 0 (
    echo Error installing pg driver. Please check your internet connection.
    pause
    exit /b 1
)

echo Installing mysql driver...
call npm install mysql2 --save
if %ERRORLEVEL% neq 0 (
    echo Error installing mysql2 driver. Please check your internet connection.
    pause
    exit /b 1
)

echo Installing chokidar file watcher...
call npm install chokidar --save
if %ERRORLEVEL% neq 0 (
    echo Error installing chokidar. Please check your internet connection.
    pause
    exit /b 1
)

echo Installing oracledb driver...
call npm install oracledb --save
if %ERRORLEVEL% neq 0 (
    echo Warning: OracleDB driver installation failed. Oracle databases will not be available.
    echo This is normal if you don't have Oracle client libraries installed.
)

echo Installing React and TypeScript dependencies...
call npm install react react-dom react-router-dom react-hook-form lucide-react --save
if %ERRORLEVEL% neq 0 (
    echo Error installing React dependencies. Please check your internet connection.
    pause
    exit /b 1
)

echo Installing TypeScript and build tools...
call npm install typescript @types/react @types/react-dom @types/node --save-dev
if %ERRORLEVEL% neq 0 (
    echo Error installing TypeScript dependencies. Please check your internet connection.
    pause
    exit /b 1
)

echo Installing Vite and development tools...
call npm install vite @vitejs/plugin-react concurrently --save-dev
if %ERRORLEVEL% neq 0 (
    echo Error installing Vite and development tools. Please check your internet connection.
    pause
    exit /b 1
)

echo Installing Tailwind CSS and PostCSS...
call npm install tailwindcss@^3.3.5 postcss autoprefixer --save-dev
if %ERRORLEVEL% neq 0 (
    echo Error installing Tailwind CSS. Please check your internet connection.
    pause
    exit /b 1
)

echo Installing other dependencies...
call npm install
if %ERRORLEVEL% neq 0 (
    echo Error installing dependencies. Please check your internet connection.
    pause
    exit /b 1
)

echo ===================================================
echo Building React frontend...
echo ===================================================
echo Building TypeScript and React components...
call npm run build
if %ERRORLEVEL% neq 0 (
    echo Error building frontend. Please check for TypeScript/React errors.
    echo You can also run 'npm run type-check' to see type errors.
    pause
    exit /b 1
)

echo Frontend build completed successfully!

echo ===================================================
echo Starting backend and frontend servers...
echo ===================================================
REM Create log directory if it doesn't exist
if not exist "C:\ProgramData\Red Gate\Logs\ChinookWebApp" mkdir "C:\ProgramData\Red Gate\Logs\ChinookWebApp"

REM Get datetime stamp for log files
for /f "tokens=1-4 delims=/ " %%a in ('date /t') do set dt=%%d-%%b-%%c
for /f "tokens=1-2 delims=: " %%a in ('time /t') do set tm=%%a-%%b
set logstamp=%dt%_%tm%
set logstamp=%logstamp::=-%

REM Start backend and frontend servers in separate PowerShell windows with unique titles and log output
echo Starting Backend Server (Express API) on port 3001...
start "BackendPS" powershell -NoExit -Command "[console]::Title = 'Chinook Backend (Express API - Port 3001)'; npm start"
echo.
echo Starting Frontend Development Server (React/Vite) on port 3000...
start "FrontendPS" powershell -NoExit -Command "[console]::Title = 'Chinook Frontend (React/Vite - Port 3000)'; npm run dev"

echo.
echo ===================================================
echo Servers are starting...
echo ===================================================
echo Backend API:      http://localhost:3001
echo Frontend App:     http://localhost:3000  
echo.
echo The React frontend proxies API calls to the Express backend.
echo Use the frontend URL (port 3000) to access the application.
echo.
echo Both servers will open in separate PowerShell windows.
echo Close those windows to stop the servers.
echo ===================================================
