# Chinook Music Store - Startup Guide

## Quick Start Options

### Option 1: Development Mode (Recommended for Testing)
**File:** `start-app-debug.bat`

- **Usage:** Double-click the file
- **What it does:**
  - Automatically checks for Node.js installation
  - Opens Node.js download page if not found
  - Installs all required dependencies (pg, mysql2, oracledb)
  - Starts backend and frontend in separate PowerShell windows
  - Great for development and debugging

### Option 2: Windows Service Installation (Recommended for Production)
**File:** `install-services.ps1`

- **Usage:** Right-click and "Run as Administrator"
- **What it does:**
  - Automatically checks for Node.js installation
  - Uses bundled NSSM (no separate installation needed)
  - Installs backend and frontend as Windows services
  - Services start automatically on system boot
  - Logs to `C:\ProgramData\Red Gate\Logs\ChinookWebApp\`

## Prerequisites

### Node.js (Automatically Handled)
Both scripts will check for Node.js and guide you through installation if needed:
- Downloads from: https://nodejs.org/
- Choose the LTS version
- Run installer with default settings
- Restart the script after installation

### For Service Installation Only
- Must run PowerShell as Administrator
- NSSM is included in `helper-files\nssm.exe` (no separate installation needed)

## Application Access

Once started (either way):
- **Frontend:** http://localhost:3001
- **Backend API:** http://localhost:3000

## Managing Services (Service Installation Only)

### Using Windows Services Manager
```
services.msc
```

### Using Command Line
```powershell
# Stop services
.\helper-files\nssm.exe stop ChinookBackend
.\helper-files\nssm.exe stop ChinookFrontend

# Start services
.\helper-files\nssm.exe start ChinookBackend
.\helper-files\nssm.exe start ChinookFrontend

# Remove services
.\helper-files\nssm.exe remove ChinookBackend confirm
.\helper-files\nssm.exe remove ChinookFrontend confirm
```

### Using Restart Script
For easy service restarts:
```powershell
# Right-click and "Run as Administrator"
.\restart-services.ps1
```

## Update Management 🔄

### Automatic Update Detection
The application includes intelligent update detection:

- **File Watching:** Backend automatically reloads `connections.js` when changed
- **Git Monitoring:** Checks for new commits every 30 seconds
- **Smart Notifications:** Shows update alerts only when restart is needed
- **One-Click Restart:** Restart services directly from the web interface

### Update Scenarios

#### ✅ **No Restart Required**
- Frontend file changes (HTML, CSS, JavaScript)
- Configuration file changes (`connections.js`)
- Static asset updates

#### ⚠️ **Restart Recommended**
- Backend code changes (`server.js`)
- Dependency updates (`package.json`)
- Service configuration changes

#### 🔄 **Automatic Handling**
- Update notifications appear in top-right corner
- Click "Restart Services" for one-click restart
- Progress tracking and automatic reconnection
- System status available via "Details" button

## Log Files

### Development Mode
- Console output in PowerShell windows
- Basic logs in `C:\ProgramData\Red Gate\Logs\ChinookWebApp\`

### Service Mode
- `C:\ProgramData\Red Gate\Logs\ChinookWebApp\backend.log`
- `C:\ProgramData\Red Gate\Logs\ChinookWebApp\backend-error.log`
- `C:\ProgramData\Red Gate\Logs\ChinookWebApp\frontend.log`
- `C:\ProgramData\Red Gate\Logs\ChinookWebApp\frontend-error.log`

## Troubleshooting

### Node.js Issues
- Ensure Node.js LTS is installed from https://nodejs.org/
- Restart command prompt/PowerShell after installation
- Verify with: `node --version` and `npm --version`

### Service Issues
- Ensure you run `install-services.ps1` as Administrator
- Check Windows Event Viewer for service errors
- Check log files in `C:\ProgramData\Red Gate\Logs\ChinookWebApp\`

### Database Connection Issues
- Verify connection strings in `connections.js`
- Ensure database drivers are installed (handled automatically)
- Check that target databases are accessible

## Features

- **Multi-Database Support:** SQL Server, MySQL, PostgreSQL, Oracle
- **Web Interface:** Modern Bootstrap 5 UI with CRUD operations
- **Data Management:** View, create, edit, delete customers, invoices, employees
- **Analytics:** Reports and visualizations
- **Version Management:** Built-in changelog and version tracking