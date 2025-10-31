# 🔄 Automatic Git Pull Detection

The Chinook WebApp service now includes **fully automatic git pull detection** and frontend rebuilding. No manual intervention required!

## 🚀 How It Works

### **Automatic Startup Rebuild**
- Service always rebuilds frontend on startup to ensure latest code is served
- Happens automatically 2 seconds after service starts

### **Real-time Git Pull Detection**  
- Monitors multiple git files: `.git/refs/heads/**`, `.git/HEAD`, `.git/index`, `.git/FETCH_HEAD`
- Automatically detects when `git pull` brings in new changes
- Triggers frontend rebuild without requiring service restart
- Enhanced file watching with error recovery

### **Backup Detection System**
- Checks git commit hash every 30 seconds as a fallback
- Ensures detection even if file watchers fail
- Bulletproof git change detection

### **Real-time File Watching**
- Still monitors frontend source files (`src/`, `public/`, etc.) for development
- Monitors `connections.js` for database configuration updates
- Instant rebuilds during development

## 🎯 What You Need to Do

**Nothing!** The process is now completely automatic:

1. **Run `git pull`** - Pull your latest changes  
2. **Wait 30-60 seconds** - Service detects and rebuilds automatically
3. **Refresh browser** - See your changes live!

## 🔍 Behind the Scenes

The service logs all activity so you can see what's happening:
- `🔄 Service startup: Rebuilding frontend to ensure latest code...`
- `🌍 Git pull detected - rebuilding frontend...`  
- `✅ Frontend rebuild completed successfully`

Check logs at: `C:\ProgramData\Red Gate\Logs\ChinookWebApp\`

## 🛠️ Troubleshooting

If changes don't appear after git pull:

1. **Wait longer** (30-60 seconds for rebuild)
2. **Hard refresh browser** (`Ctrl+F5`)  
3. **Check service logs** for rebuild activity:
   ```powershell
   Get-Content "C:\ProgramData\Red Gate\Logs\ChinookWebApp\backend.log" -Tail 20
   ```
4. **Restart service** (last resort):
   ```powershell
   .\restart-services.ps1
   ```

## 🎯 Perfect for Demo VMs

This automatic system is ideal for:
- **Demo environments** where you need instant updates
- **Development setups** with automatic git pull workflows  
- **Production-like testing** without manual intervention
- **Learning environments** where updates should "just work"

## 🔧 Technical Details

### Files Monitored:
- **Git changes**: `.git/refs/heads/**`, `.git/HEAD`, `.git/index`, `.git/FETCH_HEAD`
- **Frontend source**: `src/**/*`, `public/**/*` (during development)
- **Configuration**: `connections.js`

### Rebuild Process:
1. Change detected → 1.5 second delay (for git completion)
2. `npm run build` executed automatically  
3. New files served from `dist/` folder
4. Browser gets fresh content on next request

### Logging:
All activity logged to `C:\ProgramData\Red Gate\Logs\ChinookWebApp\backend.log`

## ✨ No More Manual Steps!

The days of manual rebuild scripts are over. Everything is now fully automatic! 🎉

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