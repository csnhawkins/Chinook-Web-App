# Chinook Sample WebApp

A simple web application for exploring the [Chinook sample database](https://github.com/lerocha/chinook-database).  
This project connects to a backend SQL Server (and later can be extended to PostgreSQL, MySQL, Oracle) and provides a basic UI to browse, filter, and query data.

---

## ✨ Features
- Connects to a **SQL Server** database (`Chinook` schema).
- Displays rows from key tables like **Customers, Invoices, Tracks**.
- Shows row count and query execution time.
- Allows **ad-hoc SQL queries**.
- Supports switching connection strings (Dev / Test / Prod).
- Handles missing tables gracefully (e.g., `AppConfig`).
- Simple **fake login** screen (optional).
- Customizable logo spot.
- Powerful table search: global, column-specific, and exact match.

---

## ⚙️ Prerequisites
- **Windows (recommended)**  
- **Node.js 18+** → [Download here](https://nodejs.org/en/download/)  
- **npm** (comes with Node.js)  
- **SQL Server** (local instance, e.g., `SQLEXPRESS`) with the Chinook database restored:
  - [Chinook SQL Server backup](https://github.com/lerocha/chinook-database/tree/master/ChinookDatabase/DataSources)
- **Git** (for cloning the repo)
- **Internet access** (for downloading dependencies)

---

## 🚀 Getting Started

### 1. Clone the repository
```powershell
git clone https://github.com/RG-AutoPilot/TDM-Helper-Files.git
cd Webapp\simple-music-app
```

### 2. Install dependencies
```powershell
npm install
```

### 3. Configure your database connection
- Edit `connections.js` to update the `connections` object with your SQL Server details (user, password, server, database).
- You can add multiple environments (e.g., Dev, Prod, Treated) and switch between them in the app.

### 4. Restore the Chinook database
- Download the Chinook backup file from the [Chinook Database DataSources](https://github.com/lerocha/chinook-database/tree/master/ChinookDatabase/DataSources).
- Restore it to your SQL Server instance using SQL Server Management Studio or `sqlcmd`.

### 5. Start the backend server
```powershell
npm start
```
- The backend runs on [http://localhost:3001](http://localhost:3001)

### 6. Open the web app
- Open `frontend/index.html` in your browser, or serve it using a static file server.
- The app will connect to the backend and display the Chinook data.

---

## 🖥️ How to Run the App


There are three main ways to run the app:

### 1. Background Services (Recommended for Demos/Production)
- Run `start-app.bat` to launch backend and frontend as background services using PM2.
- Output is logged to `start-app.log` and `C:\ProgramData\Red Gate\Logs\ChinookWebApp`.
- No console windows will remain open; services run in the background.
- To stop/restart, use PM2 commands or Task Manager.

### 2. Interactive Console (Recommended for Debugging)
- Run `start-app-debug.bat` to launch backend and frontend in separate PowerShell windows.
- Output appears in the PowerShell windows and logs to `C:\ProgramData\Red Gate\Logs\ChinookWebApp`.
- Use this for development, debugging, or when you want to see live output.

### 3. Windows Services (Advanced/Enterprise)
- Use `install-services.ps1` (requires [NSSM](https://nssm.cc/)) to install backend and frontend as Windows services.
- Services are managed via `services.msc` or NSSM commands.
- Output is logged to `C:\ProgramData\Red Gate\Logs\ChinookWebApp`.
- Recommended for persistent, always-on deployments.

---

**File Naming Note:**
- `start-app.bat` is for background service mode (recommended for most users).
- `start-app-debug.bat` is for interactive/debug mode.

---

---

## 🛠️ Usage

- **Browse Data:** Use the tabs to view Customers, Invoices, Employees, etc.
- **Search:** Use the search box above each table to search across all columns, or select a column for column-specific search. Toggle "Exact match" for precise results.
- **Pagination:** Scroll through results 50 at a time. See total row count and query time.
- **Switch Connections:** Use the dropdown in the top right to change database environments.
- **Ad-hoc SQL:** Use the SQL Query tab to run custom SQL queries against the database.
- **Config Tab:** View and manage app configuration (requires `AppConfig` table).

---

## 📦 Project Structure

- `frontend/` — HTML, JS, and assets for the web UI
- `server.js` — Node.js backend API
- `package.json` — Node.js dependencies and scripts
- `README.md` — This file
- `.gitignore` — Excludes `node_modules` and build artifacts

---

## 🔄 Updating After Git Pull

When pulling updates from the repository, new dependencies might be added. To ensure your installation stays current:

### Option 1: Check for Missing Dependencies (Recommended)
```powershell
.\install-missing-deps.ps1
```
This script will:
- Check for any new dependencies
- Install only what's missing
- Provide restart instructions if needed

### Option 2: Full Dependency Reinstall
```powershell
npm install
```

### Option 3: Service Restart (if dependencies were added)
If you have services installed and new dependencies were added:
```powershell
.\restart-services.ps1
```

**Note:** The application uses graceful degradation - if optional dependencies like `chokidar` are missing, the app will still work but with reduced functionality (no hot-reload).

---

## ❓ Troubleshooting
- If you see connection errors, check your SQL Server details in `server.js`.
- Make sure the Chinook database is restored and accessible.
- For Windows authentication, update the connection config accordingly.
- If you change the backend port, update `apiBase` in `frontend/script.js`.

---

## 📄 License
MIT
