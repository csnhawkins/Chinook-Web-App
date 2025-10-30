# 🔄 Auto-Update Features

The Chinook WebApp now includes comprehensive auto-update functionality, perfect for demo VMs and development environments where you need changes to appear instantly without manual intervention.

## 🚀 Features Included

### 1. **Real-time File Watching**
- Automatically detects changes to frontend source files (`src/`, `public/`, etc.)
- Monitors `connections.js` for database configuration updates
- Watches git changes to detect `git pull` operations
- Triggers automatic frontend rebuilds when changes are detected

### 2. **Git Pull Detection**
- Automatically detects when `git pull` brings in new changes
- Triggers frontend rebuild without requiring service restart
- Perfect for demo scenarios where you pull updates from GitHub

### 3. **Manual Update Tools**

#### Quick Update (Manual)
```powershell
# Simple batch file for quick updates
.\quick-update.bat

# Or PowerShell script with more options
.\auto-update.ps1

# Force update even with local changes
.\auto-update.ps1 -Force
```

#### Scheduled Updates (Automated)
```powershell
# Set up automatic hourly updates
.\setup-scheduled-update.ps1 -Interval Hourly

# Set up daily updates at 2 AM
.\setup-scheduled-update.ps1 -Interval Daily -Time "02:00"

# Remove scheduled updates
.\setup-scheduled-update.ps1 -Remove
```

### 4. **API Endpoint for External Automation**
```bash
# Trigger manual rebuild via API
curl -X POST http://localhost:3001/api/rebuild-frontend
```

## 🎯 Demo VM Setup

For the ultimate demo VM experience where git changes appear instantly:

1. **Install the service** (includes auto-update features):
   ```powershell
   .\install-services.ps1
   ```

2. **Set up scheduled git pulls** (optional):
   ```powershell
   .\setup-scheduled-update.ps1 -Interval Hourly
   ```

3. **That's it!** Your demo VM will now:
   - Automatically pull git changes every hour
   - Rebuild the frontend when changes are detected
   - Serve the updated website instantly
   - No manual intervention required

## 🔧 How It Works

1. **Service starts** → File watchers are initialized
2. **Git pull occurs** → Git change detected by file watcher
3. **Auto-rebuild triggered** → `npm run build` runs automatically
4. **New build served** → Updated website available immediately
5. **Users see changes** → No service restart or manual steps needed

## 📁 Files Watched

- **Frontend Source**: `src/**/*`, `public/**/*`, `index.html`
- **Configuration**: `vite.config.ts`, `tsconfig.json`, `connections.js`
- **Git Changes**: `.git/refs/heads/**`, `.git/HEAD`

## 🛠️ Service Management

The auto-update features are built into the Windows service. No additional services or processes required.

```powershell
# View logs to see auto-update activity
Get-Content "C:\ProgramData\Red Gate\Logs\ChinookWebApp\backend.log" -Tail 20

# Service commands
.\helper-files\nssm.exe status ChinookBackend
.\helper-files\nssm.exe restart ChinookBackend
```

## ⚡ Performance Notes

- File watching has minimal performance impact
- Rebuilds only occur when actual changes are detected
- Smart debouncing prevents excessive rebuilds
- Git pulls are detected within seconds
- Frontend builds typically complete in 10-30 seconds

This setup ensures your demo VM always shows the latest changes from your git repository with zero manual intervention! 🎉