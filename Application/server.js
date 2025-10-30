import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import knex from "knex";
import sql from "mssql";

// Conditionally import chokidar for file watching (graceful degradation)
let chokidar = null;
let fileWatchingEnabled = false;

try {
  chokidar = await import("chokidar");
  fileWatchingEnabled = true;
  console.log('✓ File watching enabled (chokidar available)');
} catch (err) {
  console.log('⚠ File watching disabled (chokidar not available)');
  console.log('  Run "npm install chokidar" to enable hot-reload functionality');
  fileWatchingEnabled = false;
}

const app = express();

// Application startup time and versioning
const startupTime = new Date();
let currentGitCommit = null;

// Get current git commit hash
try {
  if (fs.existsSync('.git/HEAD')) {
    const head = fs.readFileSync('.git/HEAD', 'utf8').trim();
    if (head.startsWith('ref: ')) {
      const ref = head.substring(5);
      if (fs.existsSync(`.git/${ref}`)) {
        currentGitCommit = fs.readFileSync(`.git/${ref}`, 'utf8').trim();
      }
    } else {
      currentGitCommit = head;
    }
  }
} catch (err) {
  console.log('Could not read git commit hash:', err.message);
}

console.log('Backend starting up at:', startupTime.toISOString());
if (currentGitCommit) {
  console.log('Git commit:', currentGitCommit.substring(0, 8));
}

// --- Setup file logging ---
const logDir = "C:/ProgramData/Red Gate/Logs/ChinookWebApp";
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}
const logFile = path.join(logDir, `backend_${new Date().toISOString().slice(0,10)}.log`);

function logToFile(...args) {
  const msg = args.map(a => (typeof a === "string" ? a : JSON.stringify(a))).join(" ");
  try {
    fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${msg}\n`, { encoding: "utf8" });
  } catch (err) {
    // If file is locked or can't be written to, try with a different filename
    if (err.code === 'EBUSY' || err.code === 'EACCES' || err.code === 'EPERM') {
      try {
        const altLogFile = path.join(logDir, `backend_${new Date().toISOString().slice(0,10)}_${Date.now()}.log`);
        fs.appendFileSync(altLogFile, `[${new Date().toISOString()}] LOG FILE SWITCHED DUE TO LOCK: ${msg}\n`, { encoding: "utf8" });
      } catch (altErr) {
        // If we still can't write, just continue without file logging
        // Don't let logging failures crash the application
        console.warn('Warning: Unable to write to log files, continuing without file logging');
      }
    }
  }
}

const origLog = console.log;
const origError = console.error;
function logWithTimestamp(...args) {
  const now = new Date().toISOString();
  const msg = args.map(a => (typeof a === "string" ? a : JSON.stringify(a))).join(" ");
  origLog(`[${now}] ${msg}`);
  logToFile(`[${now}] ${msg}`);
}
function errorWithTimestamp(...args) {
  const now = new Date().toISOString();
  const msg = args.map(a => (typeof a === "string" ? a : JSON.stringify(a))).join(" ");
  origError(`[${now}] ERROR: ${msg}`);
  logToFile(`[${now}] ERROR: ${msg}`);
}
console.log = logWithTimestamp;
console.error = errorWithTimestamp;
app.use(cors());
app.use(express.json());
// Serve static files from the React build directory

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'dist')));

// --- DB Connections ---
import connections from "./connections.js";

// Hot-reload functionality for connections.js
let currentConnections = { ...connections };
let connectionsFileWatcher = null;

function reloadConnections() {
  try {
    // Clear the module cache for ES modules (note: this is a workaround)
    delete require.cache[require.resolve('./connections.js')];
    
    // Read and parse the file manually to avoid module cache issues
    const connectionsContent = fs.readFileSync('./connections.js', 'utf8');
    
    // Extract the connections object (simple regex approach)
    // This is a basic implementation - could be enhanced with proper parsing
    const connectionsMatch = connectionsContent.match(/const connections = ({[\s\S]*?});[\s\S]*export default connections/);
    
    if (connectionsMatch) {
      // Use eval in a safe context (only for config files we control)
      const newConnections = eval(`(${connectionsMatch[1]})`);
      currentConnections = { ...newConnections };
      console.log('✅ Connections configuration reloaded at:', new Date().toISOString());
      
      // Clear any cached database connections
      if (global.dbConnectionCache) {
        global.dbConnectionCache = {};
      }
    }
  } catch (err) {
    console.error('❌ Failed to reload connections.js:', err.message);
  }
}

// Setup file watcher for connections.js (only if chokidar is available)
function setupFileWatcher() {
  if (!fileWatchingEnabled || !chokidar) {
    console.log('📁 File watching disabled - connections.js changes require manual restart');
    return;
  }

  try {
    connectionsFileWatcher = chokidar.watch('./connections.js', {
      ignored: /^\./, 
      persistent: true,
      ignoreInitial: true
    });

    connectionsFileWatcher.on('change', () => {
      console.log('📁 connections.js file changed, reloading...');
      setTimeout(reloadConnections, 100); // Small delay to ensure file write is complete
    });

    console.log('🔍 File watcher setup for connections.js');
  } catch (err) {
    console.error('❌ Failed to setup file watcher:', err.message);
    fileWatchingEnabled = false;
  }
}

// Initialize file watcher (conditional)
setupFileWatcher();

const defaultConnection = "production_mssql";

// Helper function to get connections with session overrides
function getConnections() {
  const allConnections = { ...currentConnections };
  
  // Apply session-based overrides if they exist
  if (global.sessionConnections) {
    Object.entries(global.sessionConnections).forEach(([name, sessionConfig]) => {
      const originalConnection = allConnections[name];
      
      if (originalConnection) {
        // Preserve the original structure and merge session changes appropriately
        if (originalConnection.connection) {
          // Original has nested structure, merge into connection object
          allConnections[name] = {
            ...originalConnection,
            displayName: sessionConfig.displayName || originalConnection.displayName,
            client: sessionConfig.client || originalConnection.client,
            connection: {
              ...originalConnection.connection,
              server: sessionConfig.host || originalConnection.connection.server,
              host: sessionConfig.host || originalConnection.connection.host,
              database: sessionConfig.database || originalConnection.connection.database,
              user: sessionConfig.user || originalConnection.connection.user,
              ...(sessionConfig.password !== undefined && { password: sessionConfig.password }),
              port: sessionConfig.port || originalConnection.connection.port,
              options: {
                ...originalConnection.connection.options,
                ...sessionConfig.options,
                instanceName: sessionConfig.instanceName || sessionConfig.options?.instanceName || originalConnection.connection.options?.instanceName
              }
            },
            // Also store at top level for compatibility
            ...(sessionConfig.instanceName && { instanceName: sessionConfig.instanceName })
          };
        } else {
          // Original has flat structure, use direct merge
          allConnections[name] = {
            ...originalConnection,
            ...sessionConfig
          };
        }
      } else {
        // New connection, use as-is
        allConnections[name] = sessionConfig;
      }
    });
  }
  
  return allConnections;
}

// Cache Knex instances per connection name
const knexCache = {};
function getDb(env) {
  const currentConnections = getConnections();
  if (!env || !currentConnections[env]) env = defaultConnection;
  if (!knexCache[env]) {
    const config = currentConnections[env];
    console.log('🔧 Creating new Knex instance for:', env);
    console.log('🔧 Raw config:', config);
    
    // Transform config for Knex if needed
    let knexConfig = { ...config };
    
    if (config.client === 'mssql') {
      // Handle SQL Server specific configuration
      // Extract connection details from nested or flat structure
      const conn = config.connection || config;
      const instanceName = config.instanceName || conn.instanceName || conn.options?.instanceName;
      const host = conn.server || conn.host || 'localhost';
      const port = conn.port;
      
      // For named instances, don't use port (they use dynamic ports)
      const server = instanceName ? `${host}\\${instanceName}` : host;
      
      knexConfig = {
        client: 'mssql',
        connection: {
          server: server,
          // Only include port if no instance name is specified
          ...(port && !instanceName && { port: port }),
          database: conn.database,
          user: conn.user,
          password: conn.password,
          options: {
            encrypt: (config.encrypt !== false && conn.encrypt !== false && conn.options?.encrypt !== false),
            trustServerCertificate: (config.trustServerCertificate !== false && conn.trustServerCertificate !== false && conn.options?.trustServerCertificate !== false),
            ...conn.options
          }
        }
      };
      
      console.log('🔧 SQL Server config details:', {
        instanceName,
        host,
        port,
        server,
        hasInstance: !!instanceName,
        willIncludePort: !!(port && !instanceName)
      });
    } else if (config.client === 'pg') {
      // Handle PostgreSQL configuration
      const conn = config.connection || config;
      knexConfig = {
        client: 'pg',
        connection: {
          host: conn.host || 'localhost',
          port: conn.port || 5432,
          database: conn.database,
          user: conn.user,
          password: conn.password
        }
      };
    } else if (config.client === 'mysql' || config.client === 'mysql2') {
      // Handle MySQL configuration
      const conn = config.connection || config;
      knexConfig = {
        client: config.client,
        connection: {
          host: conn.host || 'localhost',
          port: conn.port || 3306,
          database: conn.database,
          user: conn.user,
          password: conn.password
        }
      };
    } else if (config.client === 'oracledb') {
      // Handle Oracle configuration
      const conn = config.connection || config;
      
      // Oracle connection logic:
      // 1. If connectString is provided, use it directly
      // 2. If host/port/database are provided, build connectString
      let connectionConfig = {
        user: conn.user,
        password: conn.password
      };
      
      if (conn.connectString) {
        connectionConfig.connectString = conn.connectString;
      } else {
        // Build connectString from components
        const host = conn.host || 'localhost';
        const port = conn.port || 1521;
        const service = conn.database || conn.service || 'XE';
        connectionConfig.connectString = `${host}:${port}/${service}`;
      }
      
      knexConfig = {
        client: 'oracledb',
        connection: connectionConfig
      };
    }
    
    console.log('🔧 Transformed Knex config:', knexConfig);
    knexCache[env] = knex(knexConfig);
  }
  return knexCache[env];
}

// --- Test DB Connection on Startup ---
async function testConnection() {
  console.log("🔌 Testing database connection...");
  try {
    const currentConnections = getConnections();
    const pool = await sql.connect(currentConnections[defaultConnection].connection);
    const result = await pool.request().query("SELECT TOP 1 * FROM Customer");
    console.log("✅ Database connected. Example row:", result.recordset[0]);
  } catch (err) {
    console.error("❌ Database connection failed:", err);
  }
}
// Run testConnection at startup
testConnection().then(() => {
  // Connection test complete
}).catch((err) => {
  // Connection test failed
});

// --- Middleware: log every request (except noisy status checks) ---
app.use((req, res, next) => {
  // Skip logging for frequent status checks and static assets
  const skipLogging = [
    '/api/system/status',
    '/favicon.ico',
    '/api/health'
  ];
  
  if (!skipLogging.some(path => req.url.includes(path))) {
    console.log(`➡️ ${req.method} ${req.url}`);
  }
  next();
});

// --- Customers endpoint ---

// --- Invoices endpoint ---
app.get('/api/invoices', async (req, res) => {
  const conn = req.query.conn || defaultConnection;
  const db = getDb(conn);
  const currentConnections = getConnections();
  const config = currentConnections[conn] || currentConnections[defaultConnection];
  const dbType = config.client;

  // Get table names for current database
  const invoiceTable = getTableName('Invoice', conn);
  const customerTable = getTableName('Customer', conn);

  // Search/filter params
  const search = req.query.search || '';
  const searchColumn = req.query.searchColumn || '';
  const exactMatch = req.query.exactMatch == '1';
  const limit = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.offset) || 0;

  console.log(`📋 Invoices query: offset=${offset}, limit=${limit}, search="${search}", conn=${conn}`);

  try {
    // Get column names for current database type
    const invoiceIdCol = getColName('InvoiceId', conn);
    const customerIdCol = getColName('CustomerId', conn);
    const invoiceDateCol = getColName('InvoiceDate', conn);
    const billingAddressCol = getColName('BillingAddress', conn);
    const billingCityCol = getColName('BillingCity', conn);
    const billingStateCol = getColName('BillingState', conn);
    const billingCountryCol = getColName('BillingCountry', conn);
    const billingPostalCodeCol = getColName('BillingPostalCode', conn);
    const totalCol = getColName('Total', conn);
    const firstNameCol = getColName('FirstName', conn);
    const lastNameCol = getColName('LastName', conn);
    const emailCol = getColName('Email', conn);

    console.log(`🔍 Invoice columns - Table: ${invoiceTable}, Customer: ${customerTable}, DB Type: ${dbType}`);

    // Build query with proper joins for all database types
    let query = db(`${invoiceTable} as i`)
      .leftJoin(`${customerTable} as c`, `i.${customerIdCol}`, `c.${customerIdCol}`)
      .select([
        `i.${invoiceIdCol} as InvoiceId`,
        `i.${customerIdCol} as CustomerId`,
        `i.${invoiceDateCol} as InvoiceDate`,
        `i.${billingAddressCol} as BillingAddress`,
        `i.${billingCityCol} as BillingCity`,
        `i.${billingStateCol} as BillingState`,
        `i.${billingCountryCol} as BillingCountry`,
        `i.${billingPostalCodeCol} as BillingPostalCode`,
        `i.${totalCol} as Total`,
        `c.${firstNameCol} as CustomerFirstName`,
        `c.${lastNameCol} as CustomerLastName`,
        `c.${emailCol} as CustomerEmail`
      ]);

    // Build count query
    let countQuery = db(`${invoiceTable} as i`)
      .leftJoin(`${customerTable} as c`, `i.${customerIdCol}`, `c.${customerIdCol}`)
      .count('* as total');

    // Apply search filters
    if (search && search.length >= 2) {
      const searchFilter = function() {
        // Search invoice fields
        if (dbType === 'pg') {
          this.whereRaw(`LOWER(i.${invoiceIdCol}::text) LIKE ?`, [`%${search.toLowerCase()}%`])
            .orWhereRaw(`LOWER(i.${totalCol}::text) LIKE ?`, [`%${search.toLowerCase()}%`])
            .orWhereRaw(`LOWER(i.${billingCityCol}) LIKE ?`, [`%${search.toLowerCase()}%`])
            .orWhereRaw(`LOWER(i.${billingCountryCol}) LIKE ?`, [`%${search.toLowerCase()}%`])
            .orWhereRaw(`LOWER(c.${firstNameCol}) LIKE ?`, [`%${search.toLowerCase()}%`])
            .orWhereRaw(`LOWER(c.${lastNameCol}) LIKE ?`, [`%${search.toLowerCase()}%`])
            .orWhereRaw(`LOWER(c.${emailCol}) LIKE ?`, [`%${search.toLowerCase()}%`]);
        } else if (dbType === 'oracledb') {
          this.whereRaw(`LOWER(TO_CHAR(i.${invoiceIdCol})) LIKE ?`, [`%${search.toLowerCase()}%`])
            .orWhereRaw(`LOWER(TO_CHAR(i.${totalCol})) LIKE ?`, [`%${search.toLowerCase()}%`])
            .orWhereRaw(`LOWER(i.${billingCityCol}) LIKE ?`, [`%${search.toLowerCase()}%`])
            .orWhereRaw(`LOWER(i.${billingCountryCol}) LIKE ?`, [`%${search.toLowerCase()}%`])
            .orWhereRaw(`LOWER(c.${firstNameCol}) LIKE ?`, [`%${search.toLowerCase()}%`])
            .orWhereRaw(`LOWER(c.${lastNameCol}) LIKE ?`, [`%${search.toLowerCase()}%`])
            .orWhereRaw(`LOWER(c.${emailCol}) LIKE ?`, [`%${search.toLowerCase()}%`]);
        } else {
          this.whereRaw(`LOWER(CAST(i.${invoiceIdCol} AS VARCHAR)) LIKE ?`, [`%${search.toLowerCase()}%`])
            .orWhereRaw(`LOWER(CAST(i.${totalCol} AS VARCHAR)) LIKE ?`, [`%${search.toLowerCase()}%`])
            .orWhereRaw(`LOWER(i.${billingCityCol}) LIKE ?`, [`%${search.toLowerCase()}%`])
            .orWhereRaw(`LOWER(i.${billingCountryCol}) LIKE ?`, [`%${search.toLowerCase()}%`])
            .orWhereRaw(`LOWER(c.${firstNameCol}) LIKE ?`, [`%${search.toLowerCase()}%`])
            .orWhereRaw(`LOWER(c.${lastNameCol}) LIKE ?`, [`%${search.toLowerCase()}%`])
            .orWhereRaw(`LOWER(c.${emailCol}) LIKE ?`, [`%${search.toLowerCase()}%`]);
        }
      };

      query = query.where(searchFilter);
      countQuery = countQuery.where(searchFilter);
    }

    // Apply pagination and ordering
    query = query.orderBy(`i.${invoiceIdCol}`, 'desc').limit(limit).offset(offset);

    console.log(`🔍 Invoice SQL: ${query.toString()}`);

    const start = Date.now();
    const [rows, countRes] = await Promise.all([query, countQuery]);
    const timeMs = Date.now() - start;

    // Get total count
    let totalRows = 0;
    if (Array.isArray(countRes)) {
      totalRows = parseInt(countRes[0]?.total || countRes[0]?.TOTAL || 0, 10);
    } else {
      totalRows = parseInt(countRes?.total || countRes?.TOTAL || 0, 10);
    }

    // Format the results with customer names
    const formattedInvoices = rows.map(row => ({
      InvoiceId: row.InvoiceId || row.INVOICEID,
      CustomerId: row.CustomerId || row.CUSTOMERID, 
      InvoiceDate: row.InvoiceDate || row.INVOICEDATE,
      BillingAddress: row.BillingAddress || row.BILLINGADDRESS,
      BillingCity: row.BillingCity || row.BILLINGCITY,
      BillingState: row.BillingState || row.BILLINGSTATE,
      BillingCountry: row.BillingCountry || row.BILLINGCOUNTRY,
      BillingPostalCode: row.BillingPostalCode || row.BILLINGPOSTALCODE,
      Total: row.Total || row.TOTAL,
      CustomerName: `${row.CustomerFirstName || row.CUSTOMERFIRSTNAME || ''} ${row.CustomerLastName || row.CUSTOMERLASTNAME || ''}`.trim() || 'Unknown Customer',
      CustomerEmail: row.CustomerEmail || row.CUSTOMEREMAIL
    }));

    console.log(`✅ Invoices query OK: ${formattedInvoices.length} rows of ${totalRows} in ${timeMs}ms (conn: ${conn})`);
    res.json({ 
      rows: formattedInvoices, 
      rowCount: formattedInvoices.length, 
      totalRows, 
      timeMs 
    });

  } catch (err) {
    console.error(`❌ Invoices query error:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

// --- Artists endpoint ---
app.get('/api/artists', async (req, res) => {
  const conn = req.query.conn || defaultConnection;
  const db = getDb(conn);
  const currentConnections = getConnections();
  const config = currentConnections[conn] || currentConnections[defaultConnection];
  const dbType = config.client;

  // Get table names for current database
  const artistTable = getTableName('Artist', conn);
  const albumTable = getTableName('Album', conn);

  // Search/filter params
  const search = req.query.search || '';
  const searchColumn = req.query.searchColumn || '';
  const exactMatch = req.query.exactMatch == '1';
  const limit = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.offset) || 0;

  console.log(`🎭 Artists query: offset=${offset}, limit=${limit}, search="${search}", conn=${conn}`);

  try {
    // Get column names for current database type
    const artistIdCol = getColName('ArtistId', conn);
    const artistNameCol = getColName('Name', conn);
    const albumArtistIdCol = getColName('ArtistId', conn);

    console.log(`🔍 Artist columns - Table: ${artistTable}, Album: ${albumTable}, DB Type: ${dbType}`);

    // Build query with album count
    let query = db(`${artistTable} as ar`)
      .leftJoin(`${albumTable} as al`, `ar.${artistIdCol}`, `al.${albumArtistIdCol}`)
      .select([
        `ar.${artistIdCol} as ArtistId`,
        `ar.${artistNameCol} as Name`,
        db.raw(`COUNT(al.${albumArtistIdCol}) as AlbumCount`)
      ])
      .groupBy(`ar.${artistIdCol}`, `ar.${artistNameCol}`);

    // Build count query
    let countQuery = db(artistTable).count('* as total');

    // Apply search filters
    if (search && search.length >= 2) {
      query = query.where(function() {
        this.whereRaw(`LOWER(ar.${artistNameCol}) LIKE ?`, [`%${search.toLowerCase()}%`]);
      });
      
      countQuery = countQuery.where(function() {
        this.whereRaw(`LOWER(${artistNameCol}) LIKE ?`, [`%${search.toLowerCase()}%`]);
      });
    }

    // Apply pagination and ordering
    query = query.orderBy(`ar.${artistNameCol}`).limit(limit).offset(offset);

    console.log(`🔍 Artist SQL: ${query.toString()}`);

    const start = Date.now();
    const [rows, countRes] = await Promise.all([query, countQuery]);
    const timeMs = Date.now() - start;

    // Get total count
    let totalRows = 0;
    if (Array.isArray(countRes)) {
      totalRows = parseInt(countRes[0]?.total || countRes[0]?.TOTAL || 0, 10);
    } else {
      totalRows = parseInt(countRes?.total || countRes?.TOTAL || 0, 10);
    }

    // Format the results
    const formattedArtists = rows.map(row => ({
      ArtistId: row.ArtistId || row.ARTISTID,
      Name: row.Name || row.NAME,
      AlbumCount: parseInt(row.AlbumCount || row.ALBUMCOUNT || 0, 10)
    }));

    console.log(`✅ Artists query OK: ${formattedArtists.length} rows of ${totalRows} in ${timeMs}ms (conn: ${conn})`);
    res.json({ 
      rows: formattedArtists, 
      rowCount: formattedArtists.length, 
      totalRows, 
      timeMs 
    });

  } catch (err) {
    console.error(`❌ Artists query error:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

// --- Albums endpoint ---
app.get('/api/albums', async (req, res) => {
  const conn = req.query.conn || defaultConnection;
  const db = getDb(conn);
  const currentConnections = getConnections();
  const config = currentConnections[conn] || currentConnections[defaultConnection];
  const dbType = config.client;

  // Get table names for current database
  const albumTable = getTableName('Album', conn);
  const artistTable = getTableName('Artist', conn);

  // Search/filter params
  const search = req.query.search || '';
  const searchColumn = req.query.searchColumn || '';
  const exactMatch = req.query.exactMatch == '1';
  const limit = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.offset) || 0;

  console.log(`💿 Albums query: offset=${offset}, limit=${limit}, search="${search}", conn=${conn}`);

  try {
    // Get column names for current database type
    const albumIdCol = getColName('AlbumId', conn);
    const albumTitleCol = getColName('Title', conn);
    const albumArtistIdCol = getColName('ArtistId', conn);
    const artistIdCol = getColName('ArtistId', conn);
    const artistNameCol = getColName('Name', conn);

    console.log(`🔍 Album columns - Table: ${albumTable}, Artist: ${artistTable}, DB Type: ${dbType}`);

    // Build query with proper joins for all database types
    let query = db(`${albumTable} as al`)
      .leftJoin(`${artistTable} as ar`, `al.${albumArtistIdCol}`, `ar.${artistIdCol}`)
      .select([
        `al.${albumIdCol} as AlbumId`,
        `al.${albumTitleCol} as Title`,
        `al.${albumArtistIdCol} as ArtistId`,
        `ar.${artistNameCol} as ArtistName`
      ]);

    // Build count query
    let countQuery = db(`${albumTable} as al`)
      .leftJoin(`${artistTable} as ar`, `al.${albumArtistIdCol}`, `ar.${artistIdCol}`)
      .count('* as total');

    // Apply search filters
    if (search && search.length >= 2) {
      const searchFilter = function() {
        this.whereRaw(`LOWER(al.${albumTitleCol}) LIKE ?`, [`%${search.toLowerCase()}%`])
          .orWhereRaw(`LOWER(ar.${artistNameCol}) LIKE ?`, [`%${search.toLowerCase()}%`]);
      };

      query = query.where(searchFilter);
      countQuery = countQuery.where(searchFilter);
    }

    // Apply pagination and ordering
    query = query.orderBy(`al.${albumTitleCol}`).limit(limit).offset(offset);

    console.log(`🔍 Album SQL: ${query.toString()}`);

    const start = Date.now();
    const [rows, countRes] = await Promise.all([query, countQuery]);
    const timeMs = Date.now() - start;

    // Get total count
    let totalRows = 0;
    if (Array.isArray(countRes)) {
      totalRows = parseInt(countRes[0]?.total || countRes[0]?.TOTAL || 0, 10);
    } else {
      totalRows = parseInt(countRes?.total || countRes?.TOTAL || 0, 10);
    }

    // Format the results with artist information
    const formattedAlbums = rows.map(row => ({
      AlbumId: row.AlbumId || row.ALBUMID,
      Title: row.Title || row.TITLE,
      ArtistId: row.ArtistId || row.ARTISTID,
      ArtistName: row.ArtistName || row.ARTISTNAME || 'Unknown Artist'
    }));

    console.log(`✅ Albums query OK: ${formattedAlbums.length} rows of ${totalRows} in ${timeMs}ms (conn: ${conn})`);
    res.json({ 
      rows: formattedAlbums, 
      rowCount: formattedAlbums.length, 
      totalRows, 
      timeMs 
    });

  } catch (err) {
    console.error(`❌ Albums query error:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

// --- Employees endpoint ---

// --- Config endpoint ---

// --- Connections endpoint ---
app.get("/api/connections", (req, res) => {
  // Get connections with session overrides applied
  const allConnections = getConnections();
  
  // Return the available connection names and details (without passwords)
  const safeConnections = Object.fromEntries(
    Object.entries(allConnections).map(([name, config]) => [
      name,
      {
        ...config,
        connection: config.connection ? {
          ...config.connection,
          password: undefined, // Hide password
          hasPassword: !!config.connection.password // Flag to indicate password exists
        } : undefined,
        password: undefined, // Hide password for direct config format too
        hasPassword: !!config.password // Flag to indicate password exists
      }
    ])
  );
  res.json({ connections: safeConnections, default: defaultConnection });
});

// --- Dashboard API Endpoints ---
app.get("/api/dashboard/customers", async (req, res) => {
  const db = getDb(req.query.conn);
  try {
    const tableName = getTableName('Customer', req.query.conn);
    const result = await db(tableName).count('* as count').first();
    const count = result ? (result.count || result.COUNT || result['count(*)'] || 0) : 0;
    res.json({ count: parseInt(count) });
  } catch (err) {
    console.error("❌ Dashboard customers count failed:", err);
    res.status(500).json({ error: err.message, count: 0 });
  }
});

app.get("/api/dashboard/recent-sales", async (req, res) => {
  const db = getDb(req.query.conn);
  try {
    const tableName = getTableName('Invoice', req.query.conn);
    const period = req.query.period || 'alltime';
    
    let query = db(tableName);
    
    // Apply time filtering if not 'alltime'
    if (period !== 'alltime') {
      const dateCol = getColName('InvoiceDate', req.query.conn);
      
      // First, let's see what the actual date range is in the database
      try {
        const dateRange = await db(tableName)
          .select(db.raw(`MIN(${dateCol}) as minDate, MAX(${dateCol}) as maxDate`))
          .first();
        console.log(`📅 Database date range:`, dateRange);
        
        // Also get a few sample dates to understand the format
        const sampleDates = await db(tableName).select(dateCol).orderBy(dateCol, 'desc').limit(3);
        console.log(`📅 Sample recent dates:`, sampleDates.map(row => row[dateCol]));
      } catch (err) {
        console.log(`📅 Could not fetch date range:`, err.message);
      }
      
      const now = new Date();
      let filterDate;
      
      switch (period) {
        case 'day':
          // For "day", we want only TODAY's data, not >= today
          // Fix timezone issue by using UTC date construction
          const todayUTC = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
          filterDate = todayUTC;
          break;
        case 'month':
          const monthStartUTC = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
          filterDate = monthStartUTC;
          break;
        case 'year':
          const yearStartUTC = new Date(Date.UTC(now.getFullYear(), 0, 1));
          filterDate = yearStartUTC;
          break;
        default:
          filterDate = new Date(0); // All time
      }
      
      // Try multiple date formats to handle different database storage formats
      const filterDateISO = filterDate.toISOString().split('T')[0]; // '2025-10-22'
      
      console.log(`📅 Filtering ${period} sales for ${filterDateISO}`);
      
      // Use database-specific date comparison that's more robust
      const currentConnections = getConnections();
      const config = currentConnections[req.query.conn] || currentConnections[defaultConnection];
      
      if (period === 'day') {
        // For day, we want exact date match, not >= 
        if (config.client === 'mssql') {
          query = query.whereRaw(`CAST(${dateCol} as DATE) = CAST(? as DATE)`, [filterDateISO]);
        } else {
          query = query.whereRaw(`DATE(${dateCol}) = ?`, [filterDateISO]);
        }
      } else {
        // For month/year, we want >= comparison
        if (config.client === 'mssql') {
          query = query.whereRaw(`CAST(${dateCol} as DATE) >= CAST(? as DATE)`, [filterDateISO]);
        } else {
          query = query.where(dateCol, '>=', filterDateISO);
        }
      }
    }
    
    const result = await query.count('* as count').first();
    const count = result ? (result.count || result.COUNT || result['count(*)'] || 0) : 0;
    console.log(`📊 Sales count for ${period}: ${count}`);
    res.json({ count: parseInt(count), period });
  } catch (err) {
    console.error("❌ Dashboard recent sales count failed:", err);
    res.status(500).json({ error: err.message, count: 0, period: req.query.period || 'alltime' });
  }
});

app.get("/api/dashboard/top-tracks", async (req, res) => {
  const db = getDb(req.query.conn);
  try {
    const tableName = getTableName('Track', req.query.conn);
    const result = await db(tableName).count('* as count').first();
    const count = result ? (result.count || result.COUNT || result['count(*)'] || 0) : 0;
    res.json({ count: parseInt(count) });
  } catch (err) {
    console.error("❌ Dashboard tracks count failed:", err);
    res.status(500).json({ error: err.message, count: 0 });
  }
});

app.get("/api/dashboard/revenue", async (req, res) => {
  const db = getDb(req.query.conn);
  try {
    const tableName = getTableName('Invoice', req.query.conn);
    const period = req.query.period || 'alltime';
    
    const totalCol = getColName('Total', req.query.conn);
    
    let query = db(tableName);
    
    // Apply time filtering if not 'alltime'
    if (period !== 'alltime') {
      const dateCol = getColName('InvoiceDate', req.query.conn);
      
      // First, let's see what the actual date range is in the database
      try {
        const dateRange = await db(tableName)
          .select(db.raw(`MIN(${dateCol}) as minDate, MAX(${dateCol}) as maxDate`))
          .first();
        console.log(`📅 Database date range:`, dateRange);
        
        // Also get a few sample dates to understand the format
        const sampleDates = await db(tableName).select(dateCol).orderBy(dateCol, 'desc').limit(3);
        console.log(`📅 Sample recent dates:`, sampleDates.map(row => row[dateCol]));
      } catch (err) {
        console.log(`📅 Could not fetch date range:`, err.message);
      }
      
      const now = new Date();
      let filterDate;
      
      switch (period) {
        case 'day':
          // For "day", we want only TODAY's data, not >= today
          // Fix timezone issue by using UTC date construction
          const todayUTC = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
          filterDate = todayUTC;
          break;
        case 'month':
          const monthStartUTC = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
          filterDate = monthStartUTC;
          break;
        case 'year':
          const yearStartUTC = new Date(Date.UTC(now.getFullYear(), 0, 1));
          filterDate = yearStartUTC;
          break;
        default:
          filterDate = new Date(0); // All time
      }
      
      // Try multiple date formats to handle different database storage formats
      const filterDateISO = filterDate.toISOString().split('T')[0]; // '2025-10-22'
      
      console.log(`📅 Filtering ${period} revenue for ${filterDateISO}`);
      
      // Use database-specific date comparison that's more robust
      const currentConnections = getConnections();
      const config = currentConnections[req.query.conn] || currentConnections[defaultConnection];
      
      if (period === 'day') {
        // For day, we want exact date match, not >= 
        if (config.client === 'mssql') {
          query = query.whereRaw(`CAST(${dateCol} as DATE) = CAST(? as DATE)`, [filterDateISO]);
        } else {
          query = query.whereRaw(`DATE(${dateCol}) = ?`, [filterDateISO]);
        }
      } else {
        // For month/year, we want >= comparison
        if (config.client === 'mssql') {
          query = query.whereRaw(`CAST(${dateCol} as DATE) >= CAST(? as DATE)`, [filterDateISO]);
        } else {
          query = query.where(dateCol, '>=', filterDateISO);
        }
      }
    }
    
    const result = await query.sum(`${totalCol} as total`).first();
    const total = result ? (result.total || result.TOTAL || result['sum(`Total`)'] || 0) : 0;
    const formatted = new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD' 
    }).format(parseFloat(total) || 0);
    
    console.log(`📊 Revenue total for ${period}: ${total} (formatted: ${formatted})`);
    res.json({ total: parseFloat(total) || 0, formatted, period });
  } catch (err) {
    console.error("❌ Dashboard revenue calculation failed:", err);
    res.status(500).json({ error: err.message, total: 0, formatted: '$0.00', period: req.query.period || 'alltime' });
  }
});

app.get("/api/dashboard/recent-customers", async (req, res) => {
  const db = getDb(req.query.conn);
  try {
    const tableName = getTableName('Customer', req.query.conn);
    const currentConnections = getConnections();
    const config = currentConnections[req.query.conn] || currentConnections[defaultConnection];
    
    let query = db(tableName);
    
    if (config.client === 'pg') {
      query = query.select('customer_id as customerId', 'first_name as firstName', 'last_name as lastName', 'email', 'country')
                   .orderBy('customer_id', 'desc');
    } else if (config.client === 'oracledb') {
      query = query.select('CUSTOMERID as customerId', 'FIRSTNAME as firstName', 'LASTNAME as lastName', 'EMAIL as email', 'COUNTRY as country')
                   .orderBy('CUSTOMERID', 'desc');
    } else {
      query = query.select('CustomerId as customerId', 'FirstName as firstName', 'LastName as lastName', 'Email as email', 'Country as country')
                   .orderBy('CustomerId', 'desc');
    }
    
    const customers = await query.limit(10);
    res.json({ customers });
  } catch (err) {
    console.error("❌ Dashboard recent customers failed:", err);
    res.status(500).json({ error: err.message, customers: [] });
  }
});

// --- Invoice Report endpoint ---
app.get("/api/report/invoice/:invoiceId", async (req, res) => {
  const db = getDb(req.query.conn);
  const invoiceId = req.params.invoiceId;
  const start = Date.now();
  
  try {
    const invoiceTable = getTableName("Invoice", req.query.conn);
    const customerTable = getTableName("Customer", req.query.conn);
    const invoiceLineTable = getTableName("InvoiceLine", req.query.conn);
    const trackTable = getTableName("Track", req.query.conn);

    // Get invoice details
    const invoice = await db(invoiceTable).where({ [getColName('InvoiceId', req.query.conn)]: invoiceId }).first();
    if (!invoice) return res.status(404).json({ error: "Invoice not found." });

    // Get customer details
    const customer = await db(customerTable).where({ [getColName('CustomerId', req.query.conn)]: invoice[getColName('CustomerId', req.query.conn)] }).first();

    // Get tracks purchased (via InvoiceLine -> Track)
    // DEMO MODE: Check if we should use a slower query for demonstration
    const isDemoMode = req.query.demo === 'slow' || process.env.DEMO_SLOW_QUERIES === 'true';
    
    console.log(`📊 DEBUG: Invoice report ${invoiceId} - Slow Performance Mode: ${isDemoMode}, req.query.demo: ${req.query.demo}`);
    
    let tracks;
    let executionMethod = 'standard'; // Track which method was used
    let executionDetails = '';
    
    if (isDemoMode) {
      // DEMO MODE: Use stored procedure approach for realistic demo
      console.log('🐌 DEMO MODE: Using sp_InvoiceReport stored procedure');
      executionMethod = 'stored_procedure';
      executionDetails = 'sp_InvoiceReport';
      
      try {
        // Call the stored procedure that we'll optimize during the demo
        const result = await db.raw(`EXEC sp_InvoiceReport @InvoiceId = ?`, [invoiceId]);
        
        console.log('🔍 DEBUG: Raw result structure:', {
          hasRecordset: !!result.recordset,
          hasRecordsets: !!result.recordsets,
          hasRows: !!result.rows,
          recordsetLength: result.recordset ? result.recordset.length : 'N/A',
          recordsetsLength: result.recordsets ? result.recordsets.length : 'N/A',
          resultKeys: Object.keys(result),
          isArray: Array.isArray(result),
          resultLength: result.length
        });
        
        // Debug: Show what's actually in each array element
        if (Array.isArray(result)) {
          console.log('🔍 DEBUG: Array elements inspection:');
          for (let i = 0; i < Math.min(result.length, 5); i++) {
            const element = result[i];
            console.log(`  result[${i}]:`, {
              type: typeof element,
              isArray: Array.isArray(element),
              length: element ? element.length : 'N/A',
              hasTrackId: element && element.TrackId ? true : false,
              hasTrackName: element && element.TrackName ? true : false,
              hasUnitPrice: element && element.UnitPrice ? true : false,
              sample: element ? Object.keys(element) : 'no data',
              actualData: element && Object.keys(element).length < 10 ? element : 'too many keys'
            });
          }
          
          console.log(`🔍 DEBUG: Total result array length: ${result.length}`);
        }
        
        // Handle different result formats from different drivers
        if (result.recordsets && result.recordsets.length > 1) {
          // Standard format: result.recordsets[0] = customer, result.recordsets[1] = tracks
          tracks = result.recordsets[1];
          console.log('📊 Using result.recordsets[1] for tracks');
        } else if (result.recordset) {
          // Single recordset format
          tracks = result.recordset;
          console.log('📊 Using result.recordset for tracks');
        } else if (Array.isArray(result) && result.length > 0) {
          // Check if this is an array of individual row objects (not nested arrays)
          if (result[0] && typeof result[0] === 'object' && !Array.isArray(result[0])) {
            // Look for track-like objects in the array
            const trackObjects = result.filter(item => 
              item && (item.TrackId || item.TrackName || item.UnitPrice)
            );
            
            if (trackObjects.length > 0) {
              tracks = trackObjects;
              console.log(`📊 Found ${trackObjects.length} track objects in result array`);
            } else {
              // If no obvious track objects, the whole array might be tracks
              // Check if any object has track-like properties
              for (let i = 0; i < result.length; i++) {
                if (result[i] && Object.keys(result[i]).some(key => 
                  ['TrackId', 'TrackName', 'Name', 'UnitPrice', 'Quantity', 'Composer'].includes(key)
                )) {
                  tracks = result.slice(i); // Take from this position onwards
                  console.log(`� Found track-like properties starting at result[${i}], taking ${tracks.length} items`);
                  break;
                }
              }
            }
          } else {
            // Array format with nested arrays: Look for the result set that looks like tracks
            for (let i = 0; i < result.length; i++) {
              if (Array.isArray(result[i]) && result[i].length > 0 && result[i][0] && result[i][0].TrackId) {
                tracks = result[i];
                console.log(`📊 Found tracks in nested result[${i}]`);
                break;
              }
            }
            
            // If we still haven't found tracks, look for any non-empty array
            if (!tracks) {
              for (let i = 0; i < result.length; i++) {
                if (Array.isArray(result[i]) && result[i].length > 0) {
                  console.log(`🔍 Checking nested result[${i}] contents:`, result[i][0] ? Object.keys(result[i][0]) : 'empty');
                  // Look for track-like properties
                  if (result[i][0] && (result[i][0].TrackName || result[i][0].Name || result[i][0].UnitPrice)) {
                    tracks = result[i];
                    console.log(`📊 Found track-like data in nested result[${i}]`);
                    break;
                  }
                }
              }
            }
          }
        } else {
          // Try direct access
          tracks = result.rows || result;
        }
        
        console.log(`📊 DEBUG: sp_InvoiceReport returned ${tracks ? tracks.length : 0} tracks`);
        console.log('🔍 DEBUG: First track sample:', tracks && tracks[0] ? JSON.stringify(tracks[0], null, 2) : 'No tracks');
        
        if (!tracks || tracks.length === 0) {
          // Fallback to intentionally slow query if procedure doesn't exist or fails
          console.log('⚠️ sp_InvoiceReport not found or returned no tracks, falling back to intentionally slow demo query');
          executionMethod = 'slow_fallback';
          executionDetails = 'Inefficient Query (Demo Fallback)';
          
          // DEMO MODE FALLBACK: Use an intentionally inefficient query to simulate performance issues
          // This mimics what a junior developer might write - multiple subqueries and inefficient patterns
          tracks = await db.raw(`
            SELECT DISTINCT
              t.${getColName('TrackId', req.query.conn)},
              t.${getColName('Name', req.query.conn)} as TrackName,
              t.${getColName('Composer', req.query.conn)},
              t.${getColName('GenreId', req.query.conn)},
              t.${getColName('Milliseconds', req.query.conn)},
              (SELECT il_sub.${getColName('UnitPrice', req.query.conn)} 
               FROM ${invoiceLineTable} il_sub 
               WHERE il_sub.${getColName('TrackId', req.query.conn)} = t.${getColName('TrackId', req.query.conn)} 
               AND il_sub.${getColName('InvoiceId', req.query.conn)} = ?) as ${getColName('UnitPrice', req.query.conn)},
              (SELECT il_sub2.${getColName('Quantity', req.query.conn)} 
               FROM ${invoiceLineTable} il_sub2 
               WHERE il_sub2.${getColName('TrackId', req.query.conn)} = t.${getColName('TrackId', req.query.conn)} 
               AND il_sub2.${getColName('InvoiceId', req.query.conn)} = ?) as ${getColName('Quantity', req.query.conn)}
            FROM ${trackTable} t
            WHERE t.${getColName('TrackId', req.query.conn)} IN (
              SELECT DISTINCT il2.${getColName('TrackId', req.query.conn)}
              FROM ${invoiceLineTable} il2
              WHERE il2.${getColName('InvoiceId', req.query.conn)} = ?
              AND EXISTS (
                SELECT 1 FROM ${invoiceTable} i2 
                WHERE i2.${getColName('InvoiceId', req.query.conn)} = il2.${getColName('InvoiceId', req.query.conn)}
                AND i2.${getColName('InvoiceId', req.query.conn)} = ?
              )
            )
            ORDER BY t.${getColName('TrackId', req.query.conn)}
          `, [invoiceId, invoiceId, invoiceId, invoiceId]);
          
          // Add a small delay to simulate the inefficiency
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Extract the actual data (handle different driver formats)
          tracks = tracks.recordset || tracks.rows || tracks;
        }
      } catch (err) {
        console.log('⚠️ Error calling sp_InvoiceReport:', err.message);
        console.log('Falling back to intentionally slow demo query');
        executionMethod = 'slow_fallback';
        executionDetails = 'Inefficient Query (SP Error Fallback)';
        
        // DEMO MODE FALLBACK: Use an intentionally inefficient query to simulate performance issues
        // This mimics what a junior developer might write - multiple subqueries and inefficient patterns
        tracks = await db.raw(`
          SELECT DISTINCT
            t.${getColName('TrackId', req.query.conn)},
            t.${getColName('Name', req.query.conn)} as TrackName,
            t.${getColName('Composer', req.query.conn)},
            t.${getColName('GenreId', req.query.conn)},
            t.${getColName('Milliseconds', req.query.conn)},
            (SELECT il_sub.${getColName('UnitPrice', req.query.conn)} 
             FROM ${invoiceLineTable} il_sub 
             WHERE il_sub.${getColName('TrackId', req.query.conn)} = t.${getColName('TrackId', req.query.conn)} 
             AND il_sub.${getColName('InvoiceId', req.query.conn)} = ?) as ${getColName('UnitPrice', req.query.conn)},
            (SELECT il_sub2.${getColName('Quantity', req.query.conn)} 
             FROM ${invoiceLineTable} il_sub2 
             WHERE il_sub2.${getColName('TrackId', req.query.conn)} = t.${getColName('TrackId', req.query.conn)} 
             AND il_sub2.${getColName('InvoiceId', req.query.conn)} = ?) as ${getColName('Quantity', req.query.conn)}
          FROM ${trackTable} t
          WHERE t.${getColName('TrackId', req.query.conn)} IN (
            SELECT DISTINCT il2.${getColName('TrackId', req.query.conn)}
            FROM ${invoiceLineTable} il2
            WHERE il2.${getColName('InvoiceId', req.query.conn)} = ?
            AND EXISTS (
              SELECT 1 FROM ${invoiceTable} i2 
              WHERE i2.${getColName('InvoiceId', req.query.conn)} = il2.${getColName('InvoiceId', req.query.conn)}
              AND i2.${getColName('InvoiceId', req.query.conn)} = ?
            )
          )
          ORDER BY t.${getColName('TrackId', req.query.conn)}
        `, [invoiceId, invoiceId, invoiceId, invoiceId]);
        
        // Add a small delay to simulate the inefficiency
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Extract the actual data (handle different driver formats)
        tracks = tracks.recordset || tracks.rows || tracks;
      }
    } else {
      // Normal efficient query with complete track details including Album and Artist
      executionMethod = 'standard';
      executionDetails = 'Optimized JOIN Query with Album/Artist';
      
      // Get additional table names
      const albumTable = getTableName("Album", req.query.conn);
      const artistTable = getTableName("Artist", req.query.conn);
      
      // Build comprehensive query with all related data
      tracks = await db(`${invoiceLineTable} as il`)
        .join(`${trackTable} as t`, `il.${getColName('TrackId', req.query.conn)}`, `t.${getColName('TrackId', req.query.conn)}`)
        .leftJoin(`${albumTable} as al`, `t.${getColName('AlbumId', req.query.conn)}`, `al.${getColName('AlbumId', req.query.conn)}`)
        .leftJoin(`${artistTable} as ar`, `al.${getColName('ArtistId', req.query.conn)}`, `ar.${getColName('ArtistId', req.query.conn)}`)
        .select([
          `t.${getColName('TrackId', req.query.conn)} as TrackId`,
          `t.${getColName('Name', req.query.conn)} as TrackName`,
          `t.${getColName('Composer', req.query.conn)} as Composer`,
          `t.${getColName('GenreId', req.query.conn)} as GenreId`,
          `t.${getColName('Milliseconds', req.query.conn)} as Milliseconds`,
          `il.${getColName('UnitPrice', req.query.conn)} as UnitPrice`,
          `il.${getColName('Quantity', req.query.conn)} as Quantity`,
          `al.${getColName('Title', req.query.conn)} as AlbumTitle`,
          `ar.${getColName('Name', req.query.conn)} as ArtistName`
        ])
        .where(`il.${getColName('InvoiceId', req.query.conn)}`, invoiceId)
        .orderBy(`t.${getColName('TrackId', req.query.conn)}`);
        
      console.log(`🎵 Track query SQL: ${tracks.toString()}`);
    }

    const timeMs = Date.now() - start;
    console.log(`📊 DEBUG: Invoice report ${invoiceId} timing - start: ${start}, end: ${Date.now()}, duration: ${timeMs}ms`);
    logToFile(`📊 Invoice report ${invoiceId} completed in ${timeMs}ms (${req.query.conn})`);

    // Get database type for normalization
    const currentConnections = getConnections();
    const config = currentConnections[req.query.conn] || currentConnections[defaultConnection];
    const dbType = config.client;

    // Normalize invoice data
    const normalizedInvoice = {
      InvoiceId: invoice[getColName('InvoiceId', req.query.conn)],
      CustomerId: invoice[getColName('CustomerId', req.query.conn)],
      InvoiceDate: invoice[getColName('InvoiceDate', req.query.conn)],
      BillingAddress: invoice[getColName('BillingAddress', req.query.conn)],
      BillingCity: invoice[getColName('BillingCity', req.query.conn)],
      BillingState: invoice[getColName('BillingState', req.query.conn)],
      BillingCountry: invoice[getColName('BillingCountry', req.query.conn)],
      BillingPostalCode: invoice[getColName('BillingPostalCode', req.query.conn)],
      Total: invoice[getColName('Total', req.query.conn)]
    };

    // Normalize customer data  
    const normalizedCustomer = {
      CustomerId: customer[getColName('CustomerId', req.query.conn)],
      FirstName: customer[getColName('FirstName', req.query.conn)],
      LastName: customer[getColName('LastName', req.query.conn)],
      Email: customer[getColName('Email', req.query.conn)],
      Address: customer[getColName('Address', req.query.conn)],
      City: customer[getColName('City', req.query.conn)],
      State: customer[getColName('State', req.query.conn)],
      Country: customer[getColName('Country', req.query.conn)],
      PostalCode: customer[getColName('PostalCode', req.query.conn)],
      Phone: customer[getColName('Phone', req.query.conn)],
      Fax: customer[getColName('Fax', req.query.conn)]
    };

    // Normalize tracks data for different database types
    let normalizedTracks = tracks;
    if (Array.isArray(tracks)) {
      normalizedTracks = tracks.map(track => {
        if (dbType === 'oracledb') {
          // Oracle returns UPPERCASE column names
          return {
            TrackId: track.TRACKID || track.TrackId,
            TrackName: track.TRACKNAME || track.TrackName,
            Composer: track.COMPOSER || track.Composer,
            GenreId: track.GENREID || track.GenreId,
            Milliseconds: track.MILLISECONDS || track.Milliseconds,
            UnitPrice: track.UNITPRICE || track.UnitPrice,
            Quantity: track.QUANTITY || track.Quantity,
            AlbumTitle: track.ALBUMTITLE || track.AlbumTitle,
            ArtistName: track.ARTISTNAME || track.ArtistName
          };
        } else if (dbType === 'pg') {
          // PostgreSQL might return snake_case, but our query uses aliases so should be PascalCase
          return {
            TrackId: track.trackid || track.TrackId,
            TrackName: track.trackname || track.TrackName,
            Composer: track.composer || track.Composer,
            GenreId: track.genreid || track.GenreId,
            Milliseconds: track.milliseconds || track.Milliseconds,
            UnitPrice: track.unitprice || track.UnitPrice,
            Quantity: track.quantity || track.Quantity,
            AlbumTitle: track.albumtitle || track.AlbumTitle,
            ArtistName: track.artistname || track.ArtistName
          };
        } else {
          // SQL Server and MySQL should already have proper casing
          return track;
        }
      });
    }

    // Structure the report
    const report = {
      invoice: normalizedInvoice,
      customer: normalizedCustomer,
      tracks: normalizedTracks,
      timeMs: timeMs,
      executionMethod: executionMethod,
      executionDetails: executionDetails
    };
    
    console.log(`✅ Invoice report ${invoiceId} completed: ${normalizedTracks.length} tracks, ${timeMs}ms`);
    res.json(report);
  } catch (err) {
    const timeMs = Date.now() - start;
    console.error("❌ Invoice report query failed:", err);
    logToFile(`❌ Invoice report ${invoiceId} failed after ${timeMs}ms: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

// --- Ad-hoc SQL query endpoint ---
app.post("/api/query", async (req, res) => {
  const db = getDb(req.query.conn);
  const start = Date.now();
  try {
    console.log(`➡️ Using connection: ${req.query.conn}`);
    console.log(`📝 Running SQL: ${req.body.sql}`);
    const result = await db.raw(req.body.sql);
    let data;
    // MSSQL: rows.recordset; PostgreSQL: rows.rows; MySQL: rows[0] or rows; Oracle: rows
    if (result && typeof result === 'object') {
      if (Array.isArray(result)) {
        data = result;
      } else if (result.recordset) {
        data = result.recordset;
      } else if (result.rows) {
        data = result.rows;
      } else if (Array.isArray(result[0])) {
        data = result[0];
      } else {
        data = result;
      }
    } else {
      data = [];
    }
    const timeMs = Date.now() - start;
    const rowCount = Array.isArray(data) ? data.length : 0;
    console.log(`✅ Query OK: ${rowCount} rows in ${timeMs} ms (conn: ${req.query.conn})`);
    res.json({ rows: data, rowCount, timeMs });
  } catch (err) {
    console.error("❌ SQL query failed:", err);
    res.status(500).json({ error: err.message });
  }
});

// Helper to get correct column name for each DB type
function getColName(col, conn) {
  const currentConnections = getConnections();
  const config = currentConnections[conn] || currentConnections[defaultConnection];
  if (config.client === 'pg') {
    // Map known columns to snake_case for PostgreSQL
    const map = {
      InvoiceId: 'invoice_id',
      CustomerId: 'customer_id',
      TrackId: 'track_id',
      InvoiceDate: 'invoice_date',
      Total: 'total',
      FirstName: 'first_name',
      LastName: 'last_name',
      Email: 'email',
      Country: 'country',
      Composer: 'composer',
      GenreId: 'genre_id',
      Milliseconds: 'milliseconds',
      UnitPrice: 'unit_price',
      Quantity: 'quantity',
      Name: 'name',
      Title: 'title',
      AlbumId: 'album_id',
      ArtistId: 'artist_id'
    };
    return map[col] || col.toLowerCase();
  }
  if (config.client === 'oracledb') {
    // Map known columns to uppercase for Oracle
    const map = {
      InvoiceId: 'INVOICEID',
      CustomerId: 'CUSTOMERID',
      TrackId: 'TRACKID',
      InvoiceDate: 'INVOICEDATE',
      Total: 'TOTAL',
      FirstName: 'FIRSTNAME',
      LastName: 'LASTNAME',
      Email: 'EMAIL',
      Country: 'COUNTRY',
      Composer: 'COMPOSER',
      GenreId: 'GENREID',
      Milliseconds: 'MILLISECONDS',
      UnitPrice: 'UNITPRICE',
      Quantity: 'QUANTITY',
      Name: 'NAME'
    };
    return map[col] || col.toUpperCase();
  }
  return col;
}

// Helper to convert snake_case to PascalCase
function snakeToPascalCase(str) {
  const commonMappings = {
    'customer_id': 'CustomerId',
    'first_name': 'FirstName',
    'last_name': 'LastName',
    'email': 'Email',
    'company': 'Company',
    'address': 'Address',
    'city': 'City',
    'state': 'State',
    'country': 'Country',
    'postal_code': 'PostalCode',
    'phone': 'Phone',
    'fax': 'Fax',
    'support_rep_id': 'SupportRepId',
    'invoice_id': 'InvoiceId',
    'invoice_date': 'InvoiceDate',
    'billing_address': 'BillingAddress',
    'billing_city': 'BillingCity',
    'billing_state': 'BillingState',
    'billing_country': 'BillingCountry',
    'billing_postal_code': 'BillingPostalCode',
    'total': 'Total'
  };
  
  // Use mapping if available, otherwise convert snake_case to PascalCase
  return commonMappings[str] || str.split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}
// Helper to get correct table name for each DB type
function getTableName(table, conn) {
  const currentConnections = getConnections();
  const config = currentConnections[conn] || currentConnections[defaultConnection];
  if (config.client === 'pg') {
    // Map known tables to snake_case for PostgreSQL
    const map = {
      Customer: 'customer',
      Invoice: 'invoice',
      InvoiceLine: 'invoice_line',
      Track: 'track',
      Employee: 'employee',
      AppConfig: 'app_config',
      Offers: 'offers'
    };
    return `public.${map[table] || table.toLowerCase()}`;
  }
  if (config.client === 'oracledb') {
    // Map known tables to uppercase for Oracle
    const map = {
      Customer: 'CUSTOMER',
      Invoice: 'INVOICE',
      InvoiceLine: 'INVOICELINE',
      Track: 'TRACK',
      Employee: 'EMPLOYEE',
      AppConfig: 'APPCONFIG',
      Offers: 'OFFERS'
    };
    return map[table] || table.toUpperCase();
  }
  return table;
}

// --- Start Server ---
// --- Cross-DB Table Mapping ---
const tableMappings = {
  mssql: {
    Customer: "Customer",
    Invoice: "Invoice",
    Employee: "Employee",
    Offers: "Offers",
    Track: "Track",
    Album: "Album",
    Artist: "Artist"
  },
  pg: {
    Customer: "public.customer",
    Invoice: "public.invoice",
    Employee: "public.employee",
    Offers: "public.offers",
    Track: "public.track",
    Album: "public.album",
    Artist: "public.artist"
  },
  mysql: {
    Customer: "Customer",
    Invoice: "Invoice",
    Employee: "Employee",
    Offers: "Offers",
    Track: "Track",
    Album: "Album",
    Artist: "Artist"
  },
  oracledb: {
    Customer: "CUSTOMER",
    Invoice: "INVOICE",
    Employee: "EMPLOYEE",
    Offers: "OFFERS",
    Track: "TRACK",
    Album: "ALBUM",
    Artist: "ARTIST"
  }
};

// --- Unified Table Data Endpoint ---
app.get('/api/table/:table', async (req, res) => {
  const { table } = req.params;
  const conn = req.query.conn || defaultConnection;
  const currentConnections = getConnections();
  const config = currentConnections[conn] || currentConnections[defaultConnection];
  const dbType = config.client;
  const mappedTable = (tableMappings[dbType] && tableMappings[dbType][table]) ? tableMappings[dbType][table] : table;
  const db = getDb(conn);
  // Search/filter params
  const search = req.query.search || '';
  const searchColumn = req.query.searchColumn || '';
  const exactMatch = req.query.exactMatch == '1';
  const limit = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.offset) || 0;
  
  console.log(`🎯 Table ${table} query: offset=${offset}, limit=${limit}, search="${search}", conn=${conn}`);
  
  try {
    let query = db(mappedTable).select('*');
    let countQuery = db(mappedTable).count({total: '*'});
    
    // Debug logging for PostgreSQL
    if (dbType === 'pg') {
      console.log(`🔍 PostgreSQL Debug - Table: ${table}, Mapped: ${mappedTable}, DB Type: ${dbType}`);
    }
    
    // Dynamic search logic
    if (search) {
      let columnsInfo = await db(mappedTable).columnInfo();
      let colNames = Object.keys(columnsInfo);
      let colTypes = {};
      Object.entries(columnsInfo).forEach(([col, info]) => {
        colTypes[col] = info.type;
      });
      // Fallback for PostgreSQL if colNames is empty: query information_schema.columns
      if (colNames.length === 0 && dbType === 'pg') {
        let schema = 'public';
        let tableName = table.includes('.') ? table.split('.')[1] : table;
        // Remove quotes if present
        tableName = tableName.replace(/"/g, '');
        try {
          const infoRows = await db('information_schema.columns')
            .select('column_name', 'data_type')
            .whereRaw('LOWER(table_schema) = ?', [schema.toLowerCase()])
            .andWhereRaw('LOWER(table_name) = ?', [tableName.toLowerCase()]);
          colNames = infoRows.map(r => r.column_name);
          colTypes = {};
          infoRows.forEach(r => {
            // Map PostgreSQL types to JS/Knex types
            if (r.data_type === 'integer') colTypes[r.column_name] = 'integer';
            else if (r.data_type === 'bigint') colTypes[r.column_name] = 'integer';
            else if (r.data_type === 'double precision' || r.data_type === 'numeric' || r.data_type === 'real') colTypes[r.column_name] = 'float';
            else colTypes[r.column_name] = 'text';
          });
          console.log('PostgreSQL infoRows:', infoRows);
          console.log('PostgreSQL colNames:', colNames);
        } catch (err) {
          console.warn('Failed to query information_schema.columns for', table, err);
        }
      }
      if (searchColumn && colNames.includes(searchColumn)) {
        let op = exactMatch ? '=' : 'like';
        let val = exactMatch ? search : `%${search}%`;
        
        // Handle different column types
        if (colTypes[searchColumn] === 'integer') {
          // Only use integer comparison for pure numbers
          if (/^[-+]?\d+$/.test(search)) {
            op = '=';
            val = parseInt(search, 10);
            query.where(searchColumn, op, val);
            countQuery.where(searchColumn, op, val);
          }
          // For non-pure numbers (like "2025-01"), don't apply any filter
          // This prevents 500 errors when searching dates with special characters
        } else {
          // For text/date columns, always use string comparison
          // Convert column to string for date searches with special chars
          if (searchColumn.toLowerCase().includes('date')) {
            // For date columns, determine operator based on search format
            if (exactMatch && search.match(/^\d{4}-\d{2}-\d{2}$/)) {
              // Full date format (YYYY-MM-DD) with exact match - use exact comparison
              op = '=';
              val = search;
            } else {
              // Partial date format (YYYY or YYYY-MM) or no exact match - use LIKE
              op = 'like';
              val = `%${search}%`;
            }
            
            console.log(`🎯 Date search: ${search} using ${op} with value: ${val}`);
            
            // For date columns, convert to string to handle partial date searches
            // Use database-specific string conversion functions
            const currentConnections = getConnections();
            const config = currentConnections[conn] || currentConnections[defaultConnection];
            
            if (config.client === 'pg') {
              // PostgreSQL: to_char function
              query.whereRaw(`to_char(${searchColumn}, 'YYYY-MM-DD') ${op} ?`, [val]);
              countQuery.whereRaw(`to_char(${searchColumn}, 'YYYY-MM-DD') ${op} ?`, [val]);
            } else if (config.client === 'oracledb') {
              // Oracle: to_char function
              query.whereRaw(`to_char(${searchColumn}, 'YYYY-MM-DD') ${op} ?`, [val]);
              countQuery.whereRaw(`to_char(${searchColumn}, 'YYYY-MM-DD') ${op} ?`, [val]);
            } else if (config.client === 'mysql') {
              // MySQL: date_format function
              query.whereRaw(`date_format(${searchColumn}, '%Y-%m-%d') ${op} ?`, [val]);
              countQuery.whereRaw(`date_format(${searchColumn}, '%Y-%m-%d') ${op} ?`, [val]);
            } else {
              // SQL Server: convert function
              query.whereRaw(`convert(varchar, ${searchColumn}, 23) ${op} ?`, [val]);
              countQuery.whereRaw(`convert(varchar, ${searchColumn}, 23) ${op} ?`, [val]);
            }
          } else {
            query.where(searchColumn, op, val);
            countQuery.where(searchColumn, op, val);
          }
        }
      } else if (colNames.length > 0) {
        // Search all columns
        query.where(function() {
          let any = false;
          colNames.forEach(col => {
            let op = exactMatch ? '=' : 'like';
            let val = exactMatch ? search : `%${search}%`;
            if (colTypes[col] === 'integer') {
              if (/^[-+]?\d+$/.test(search)) {
                op = '=';
                val = parseInt(search, 10);
                this.orWhere(col, op, val);
                any = true;
              }
            } else {
              this.orWhere(col, op, val);
              any = true;
            }
          });
        });
        countQuery.where(function() {
          let any = false;
          colNames.forEach(col => {
            let op = exactMatch ? '=' : 'like';
            let val = exactMatch ? search : `%${search}%`;
            if (colTypes[col] === 'integer') {
              if (/^[-+]?\d+$/.test(search)) {
                op = '=';
                val = parseInt(search, 10);
                this.orWhere(col, op, val);
                any = true;
              }
            } else {
              this.orWhere(col, op, val);
              any = true;
            }
          });
        });
      } else {
        // No columns found for filtering
        console.warn('No columns found for filtering. Search ignored.');
      }
    }
  
  // SQL Server requires ORDER BY when using OFFSET
  const currentConnections = getConnections();
  const config = currentConnections[conn] || currentConnections[defaultConnection];
  if (config.client === 'mssql' && offset > 0) {
    // Add ORDER BY for SQL Server pagination - use first column or a common ID column
    const columnsInfo = await db(mappedTable).columnInfo();
    const firstColumn = Object.keys(columnsInfo)[0];
    if (firstColumn) {
      query.orderBy(firstColumn);
    }
  }
  
  query.limit(limit).offset(offset);
  // Log SQL
  console.log(`SQL: ${query.toString()}`);
  const start = Date.now();
  const [rows, countRes] = await Promise.all([query, countQuery]);
  const timeMs = Date.now() - start;
  // totalRows should always be the full count, not just the current page
  let totalRows = 0;
  if (Array.isArray(countRes)) {
    if (countRes[0] && (typeof countRes[0].total === 'number' || typeof countRes[0].total === 'string')) {
      totalRows = parseInt(countRes[0].total, 10);
    }
  } else if (countRes && (typeof countRes.total === 'number' || typeof countRes.total === 'string')) {
    totalRows = parseInt(countRes.total, 10);
  }
  const columns = await db(mappedTable).columnInfo();
  
  // Normalize column names for PostgreSQL and Oracle to match frontend expectations
  let normalizedRows = rows;
  if (config.client === 'pg') {
    normalizedRows = rows.map(row => {
      const normalizedRow = {};
      Object.keys(row).forEach(key => {
        // Convert snake_case to PascalCase for common columns
        const pascalKey = snakeToPascalCase(key);
        normalizedRow[pascalKey] = row[key];
      });
      return normalizedRow;
    });
  } else if (config.client === 'oracledb') {
    // Oracle returns UPPERCASE column names, convert to PascalCase
    normalizedRows = rows.map(row => {
      const normalizedRow = {};
      Object.keys(row).forEach(key => {
        // Convert UPPERCASE to PascalCase for common columns
        const pascalKey = key.charAt(0).toUpperCase() + key.slice(1).toLowerCase();
        normalizedRow[pascalKey] = row[key];
      });
      return normalizedRow;
    });
  }
  
  logWithTimestamp(`✅ ${table} query OK: ${rows.length} rows of ${totalRows} in ${timeMs} ms (conn: ${conn})`);
  res.json({ rows: normalizedRows, columns, rowCount: normalizedRows.length, totalRows, timeMs });
  } catch (err) {
    console.error(`❌ Table ${table} query error:`, err.message);
    console.error(`❌ Query details: offset=${offset}, limit=${limit}, search="${search}", conn=${conn}`);
    res.status(500).json({ error: err.message });
  }
});

// --- Customer Search endpoint ---
app.get('/api/customers', async (req, res) => {
  const conn = req.query.conn || defaultConnection;
  const search = req.query.search || '';
  const db = getDb(conn);
  const currentConnections = getConnections();
  const config = currentConnections[conn] || currentConnections[defaultConnection];
  const dbType = config.client;
  const customerTable = (tableMappings[dbType] && tableMappings[dbType]['Customer']) ? tableMappings[dbType]['Customer'] : 'Customer';
  
  try {
    let query = db(customerTable).select('*');
    
    if (search && search.length >= 2) {
      // Get correct column names for this database
      const firstNameCol = getColName('FirstName', conn);
      const lastNameCol = getColName('LastName', conn);
      const emailCol = getColName('Email', conn);
      
      // Search in FirstName, LastName, and Email
      query = query.where(function() {
        this.whereRaw(`LOWER(${firstNameCol}) LIKE ?`, [`%${search.toLowerCase()}%`])
          .orWhereRaw(`LOWER(${lastNameCol}) LIKE ?`, [`%${search.toLowerCase()}%`])
          .orWhereRaw(`LOWER(${emailCol}) LIKE ?`, [`%${search.toLowerCase()}%`]);
        
        // Add full name search with database-specific concatenation
        if (dbType === 'mssql') {
          this.orWhereRaw(`LOWER(${firstNameCol} + ' ' + ${lastNameCol}) LIKE ?`, [`%${search.toLowerCase()}%`]);
        } else if (dbType === 'oracledb') {
          this.orWhereRaw(`LOWER(${firstNameCol} || ' ' || ${lastNameCol}) LIKE ?`, [`%${search.toLowerCase()}%`]);
        } else if (dbType === 'pg') {
          this.orWhereRaw(`LOWER(${firstNameCol} || ' ' || ${lastNameCol}) LIKE ?`, [`%${search.toLowerCase()}%`]);
        } else {
          this.orWhereRaw(`LOWER(CONCAT(${firstNameCol}, ' ', ${lastNameCol})) LIKE ?`, [`%${search.toLowerCase()}%`]);
        }
      });
    }
    
    const rawCustomers = await query.limit(20).orderBy(getColName('LastName', conn), getColName('FirstName', conn));
    
    // Normalize column names for consistent frontend consumption
    const customers = rawCustomers.map(customer => {
      if (dbType === 'pg') {
        // Map PostgreSQL snake_case to PascalCase for frontend
        return {
          CustomerId: customer.customer_id,
          FirstName: customer.first_name,
          LastName: customer.last_name,
          Email: customer.email,
          Address: customer.address,
          City: customer.city,
          State: customer.state,
          Country: customer.country,
          PostalCode: customer.postal_code,
          Phone: customer.phone,
          Fax: customer.fax,
          Company: customer.company,
          SupportRepId: customer.support_rep_id
        };
      } else if (dbType === 'oracledb') {
        // Map Oracle UPPERCASE to PascalCase for frontend
        return {
          CustomerId: customer.CUSTOMERID,
          FirstName: customer.FIRSTNAME,
          LastName: customer.LASTNAME,
          Email: customer.EMAIL,
          Address: customer.ADDRESS,
          City: customer.CITY,
          State: customer.STATE,
          Country: customer.COUNTRY,
          PostalCode: customer.POSTALCODE,
          Phone: customer.PHONE,
          Fax: customer.FAX,
          Company: customer.COMPANY,
          SupportRepId: customer.SUPPORTREPID
        };
      } else {
        // SQL Server and MySQL already use PascalCase
        return customer;
      }
    });
    
    console.log(`🔍 Customer search "${search}" returned ${customers.length} results`);
    res.json(customers);
  } catch (error) {
    console.error('Customer search error:', error);
    res.status(500).json({ error: error.message });
  }
});

// --- Track Search endpoint ---
app.get('/api/tracks', async (req, res) => {
  const conn = req.query.conn || defaultConnection;
  const search = req.query.search || '';
  const limit = parseInt(req.query.limit) || 20;
  const offset = parseInt(req.query.offset) || 0;
  const db = getDb(conn);
  const currentConnections = getConnections();
  const config = currentConnections[conn] || currentConnections[defaultConnection];
  const dbType = config.client;
  
  try {
    // Get table names for this database type
    const trackTable = getTableName('Track', conn);
    const albumTable = getTableName('Album', conn);
    const artistTable = getTableName('Artist', conn);
    
    // Get column names for this database type
    const trackIdCol = getColName('TrackId', conn);
    const trackNameCol = getColName('Name', conn);
    const unitPriceCol = getColName('UnitPrice', conn);
    const trackAlbumIdCol = getColName('AlbumId', conn);
    const albumIdCol = getColName('AlbumId', conn);
    const albumTitleCol = getColName('Title', conn);
    const albumArtistIdCol = getColName('ArtistId', conn);
    const artistIdCol = getColName('ArtistId', conn);
    const artistNameCol = getColName('Name', conn);
    
    console.log(`🔧 Track query - DB: ${dbType}, Tables: Track=${trackTable}, Album=${albumTable}, Artist=${artistTable}`);
    console.log(`🔧 Track columns: TrackId=${trackIdCol}, Name=${trackNameCol}, UnitPrice=${unitPriceCol}, AlbumId=${trackAlbumIdCol}`);
    
    // Build the main query with proper joins for Oracle
    let query = db(`${trackTable} as t`)
      .leftJoin(`${albumTable} as al`, `t.${trackAlbumIdCol}`, `al.${albumIdCol}`)
      .leftJoin(`${artistTable} as ar`, `al.${albumArtistIdCol}`, `ar.${artistIdCol}`)
      .select([
        `t.${trackIdCol} as TrackId`,
        `t.${trackNameCol} as Name`,
        `t.${unitPriceCol} as UnitPrice`,
        `al.${albumTitleCol} as AlbumTitle`,
        `ar.${artistNameCol} as ArtistName`
      ]);
    
    // Build count query with same joins
    let totalQuery = db(`${trackTable} as t`)
      .leftJoin(`${albumTable} as al`, `t.${trackAlbumIdCol}`, `al.${albumIdCol}`)
      .leftJoin(`${artistTable} as ar`, `al.${albumArtistIdCol}`, `ar.${artistIdCol}`);
    
    // Apply search filters if provided
    if (search && search.length >= 2) {
      const searchFilter = function() {
        this.whereRaw(`LOWER(t.${trackNameCol}) LIKE ?`, [`%${search.toLowerCase()}%`])
          .orWhereRaw(`LOWER(al.${albumTitleCol}) LIKE ?`, [`%${search.toLowerCase()}%`])
          .orWhereRaw(`LOWER(ar.${artistNameCol}) LIKE ?`, [`%${search.toLowerCase()}%`]);
      };
      
      query = query.where(searchFilter);
      totalQuery = totalQuery.where(searchFilter);
    }
    
    console.log(`🔍 Track SQL: ${query.toString()}`);
    
    // Execute queries
    const start = Date.now();
    const [rawTracks, totalCountResult] = await Promise.all([
      query.limit(limit).offset(offset).orderBy(`t.${trackIdCol}`),
      totalQuery.count('* as total').first()
    ]);
    const timeMs = Date.now() - start;
    
    // Get total count
    const totalCount = totalCountResult?.total || totalCountResult?.TOTAL || 0;
    
    // Normalize column names for consistent frontend consumption
    const tracks = rawTracks.map(track => {
      if (dbType === 'oracledb') {
        // Oracle returns UPPERCASE column names
        return {
          TrackId: track.TRACKID || track.TrackId,
          Name: track.NAME || track.Name,
          UnitPrice: track.UNITPRICE || track.UnitPrice,
          AlbumTitle: track.ALBUMTITLE || track.AlbumTitle,
          ArtistName: track.ARTISTNAME || track.ArtistName
        };
      } else if (dbType === 'pg') {
        // PostgreSQL might return snake_case, but our query uses aliases so should be PascalCase
        return {
          TrackId: track.trackid || track.TrackId,
          Name: track.name || track.Name,
          UnitPrice: track.unitprice || track.UnitPrice,
          AlbumTitle: track.albumtitle || track.AlbumTitle,
          ArtistName: track.artistname || track.ArtistName
        };
      } else {
        // SQL Server and MySQL already use PascalCase
        return track;
      }
    });
    
    console.log(`✅ Tracks query OK: ${tracks.length} rows of ${totalCount} in ${timeMs}ms (conn: ${conn})`);
    res.json({
      tracks: tracks,
      total: totalCount,
      limit: limit,
      offset: offset
    });
    
  } catch (err) {
    console.error(`❌ Track search error:`, err);
    res.status(500).json({ error: err.message });
  }
});

// --- List Tables endpoint ---
app.get("/api/tables", async (req, res) => {
  const db = getDb(req.query.conn);
  const currentConnections = getConnections();
  const config = currentConnections[req.query.conn] || currentConnections[defaultConnection];
  try {
    let tables = [];
    if (config.client === "pg") {
      // PostgreSQL: query information_schema.tables
      const rows = await db("information_schema.tables")
        .select("table_name")
        .where({ table_schema: "public" });
      tables = rows.map(r => r.table_name);
    } else if (config.client === "mssql") {
      // SQL Server: query INFORMATION_SCHEMA.TABLES
      const rows = await db.raw("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'");
      tables = rows.recordset ? rows.recordset.map(r => r.TABLE_NAME) : rows.map(r => r.TABLE_NAME);
    } else if (config.client === "mysql") {
      // MySQL: query information_schema.tables
      const dbName = config.connection.database;
      const rows = await db("information_schema.tables")
        .select("table_name")
        .where({ table_schema: dbName });
      tables = rows.map(r => r.table_name);
    } else if (config.client === "oracledb") {
      // Oracle: query user_tables
      const rows = await db.raw("SELECT table_name FROM user_tables");
      tables = rows.map(r => r.TABLE_NAME || r.table_name);
    }
    res.json({ tables });
  } catch (err) {
    console.error("❌ Table list query failed:", err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// CONNECTION MANAGEMENT API ENDPOINTS
// ============================================================================

// Test connection endpoint
app.post('/api/test-connection', async (req, res) => {
  try {
    const connectionConfig = req.body;
    console.log('🔧 Testing connection:', {
      client: connectionConfig.client,
      host: connectionConfig.host,
      database: connectionConfig.database,
      user: connectionConfig.user,
      hasPassword: !!connectionConfig.password,
      port: connectionConfig.port,
      instanceName: connectionConfig.options?.instanceName,
      hasInstanceName: !!connectionConfig.options?.instanceName
    });
    
    // Create a temporary Knex instance to test the connection
    let testConfig = {
      client: connectionConfig.client
    };
    
    if (connectionConfig.client === 'mssql') {
      // For SQL Server, try using the mssql library directly instead of through Knex
      // since Knex might be adding default ports
      try {
        
        let serverString = connectionConfig.host;
        if (connectionConfig.options?.instanceName) {
          serverString += `\\${connectionConfig.options.instanceName}`;
        }
        
        const config = {
          server: serverString,
          database: connectionConfig.database,
          options: {
            encrypt: connectionConfig.options?.encrypt !== false,
            trustServerCertificate: connectionConfig.options?.trustServerCertificate !== false,
            trustedConnection: connectionConfig.options?.trustedConnection || false
          }
        };
        
        // Only add port for default instance (no instance name)
        if (!connectionConfig.options?.instanceName && connectionConfig.port) {
          config.port = parseInt(connectionConfig.port);
        }
        
        if (!connectionConfig.options?.trustedConnection) {
          config.user = connectionConfig.user;
          config.password = connectionConfig.password;
          console.log('🔧 Using SQL Server Authentication:', { 
            user: connectionConfig.user, 
            hasPassword: !!connectionConfig.password 
          });
        } else {
          // For Windows Authentication, use the simplest approach
          console.log('🔧 Using Windows Authentication (Trusted Connection)');
          console.log('🔧 Current process user:', process.env.USERNAME || process.env.USER || 'unknown');
          console.log('🔧 Current process domain:', process.env.USERDOMAIN || 'unknown');
          
          // Don't set user, password, or authentication object
          // Just rely on trustedConnection: true in options
          console.log('🔧 Using pure Windows Authentication - no explicit credentials');
        }
        
        console.log('🔧 Direct mssql connection config:', {
          ...config,
          password: config.password ? '***' : undefined,
          trustedConnection: config.options.trustedConnection
        });
        
        const pool = await sql.connect(config);
        await pool.request().query('SELECT 1');
        await pool.close();
        
        console.log('✅ Connection test successful');
        res.json({ success: true, message: 'Connection successful' });
        return;
        
      } catch (error) {
        console.error('❌ Connection test failed:', error.message);
        res.json({ success: false, error: error.message });
        return;
      }
    }
    
    if (connectionConfig.client === 'mssql') {
      // Build server string with instance name if provided
      let serverString = connectionConfig.host;
      if (connectionConfig.options?.instanceName) {
        serverString += `\\${connectionConfig.options.instanceName}`;
      }
      
      testConfig.connection = {
        server: serverString,
        database: connectionConfig.database,
        options: {
          encrypt: connectionConfig.options?.encrypt !== false, // Default true
          trustServerCertificate: connectionConfig.options?.trustServerCertificate !== false, // Default true
          trustedConnection: connectionConfig.options?.trustedConnection || false
        }
      };
      
      // Only add port for default instance (no instance name)
      if (!connectionConfig.options?.instanceName && connectionConfig.port) {
        testConfig.connection.port = parseInt(connectionConfig.port);
      }
      
      console.log('🔧 SQL Server connection config:', {
        server: serverString,
        database: connectionConfig.database,
        port: testConfig.connection.port,
        hasPort: 'port' in testConfig.connection,
        hasInstanceName: !!connectionConfig.options?.instanceName,
        instanceName: connectionConfig.options?.instanceName
      });
      
      if (!connectionConfig.options?.trustedConnection) {
        testConfig.connection.user = connectionConfig.user;
        testConfig.connection.password = connectionConfig.password;
        console.log('🔧 Using SQL Server Authentication:', { 
          user: connectionConfig.user, 
          hasPassword: !!connectionConfig.password 
        });
      } else {
        console.log('🔧 Using Windows Authentication (Trusted Connection)');
      }
      
      console.log('🔧 Final connection object:', {
        ...testConfig.connection,
        password: testConfig.connection.password ? '***' : undefined
      });
    } else if (connectionConfig.client === 'mysql2') {
      testConfig.connection = {
        host: connectionConfig.host,
        port: connectionConfig.port ? parseInt(connectionConfig.port) : 3306,
        user: connectionConfig.user,
        password: connectionConfig.password,
        database: connectionConfig.database
      };
    } else if (connectionConfig.client === 'pg') {
      testConfig.connection = {
        host: connectionConfig.host,
        port: connectionConfig.port ? parseInt(connectionConfig.port) : 5432,
        user: connectionConfig.user,
        password: connectionConfig.password,
        database: connectionConfig.database
      };
    } else if (connectionConfig.client === 'oracledb') {
      // Oracle connection logic:
      // 1. If connectString is provided, use it directly
      // 2. If host/port/database are provided, build connectString
      let connectionObj = {
        user: connectionConfig.user,
        password: connectionConfig.password
      };
      
      if (connectionConfig.connectString) {
        connectionObj.connectString = connectionConfig.connectString;
      } else {
        // Build connectString from components
        const host = connectionConfig.host || 'localhost';
        const port = connectionConfig.port || 1521;
        const service = connectionConfig.database || connectionConfig.service || 'XE';
        connectionObj.connectString = `${host}:${port}/${service}`;
      }
      
      testConfig.connection = connectionObj;
    }
    
    const testDb = knex(testConfig);
    
    // Try a simple query to test the connection
    // Oracle requires "FROM DUAL" for simple SELECT queries
    if (connectionConfig.client === 'oracledb') {
      await testDb.raw('SELECT 1 FROM DUAL');
    } else {
      await testDb.raw('SELECT 1');
    }
    
    // Clean up the test connection
    await testDb.destroy();
    
    console.log('✅ Connection test successful');
    res.json({ success: true, message: 'Connection successful' });
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    res.json({ success: false, error: error.message });
  }
});

// Test connection by name (uses stored config with password)
app.post('/api/test-connection-by-name', async (req, res) => {
  try {
    const { connectionName } = req.body;
    
    if (!connectionName) {
      return res.json({ success: false, error: 'Connection name is required' });
    }
    
    // Get the actual stored connection configuration with password
    const allConnections = getConnections();
    const connectionConfig = allConnections[connectionName];
    
    if (!connectionConfig) {
      return res.json({ success: false, error: `Connection "${connectionName}" not found` });
    }
    
    console.log('🔧 Testing stored connection:', connectionName, {
      client: connectionConfig.client,
      host: connectionConfig.connection?.host || connectionConfig.host,
      database: connectionConfig.connection?.database || connectionConfig.database,
      user: connectionConfig.connection?.user || connectionConfig.user,
      hasPassword: !!(connectionConfig.connection?.password || connectionConfig.password),
      port: connectionConfig.connection?.port || connectionConfig.port,
      instanceName: connectionConfig.connection?.options?.instanceName || connectionConfig.options?.instanceName,
      hasInstanceName: !!(connectionConfig.connection?.options?.instanceName || connectionConfig.options?.instanceName)
    });
    
    // Flatten the config for testing (same logic as existing test-connection endpoint)
    const flatConfig = {
      client: connectionConfig.client,
      host: connectionConfig.connection?.server || connectionConfig.connection?.host || connectionConfig.host || 'localhost',
      server: connectionConfig.connection?.server || connectionConfig.connection?.host || connectionConfig.host || 'localhost',
      database: connectionConfig.connection?.database || connectionConfig.database,
      user: connectionConfig.connection?.user || connectionConfig.user,
      password: connectionConfig.connection?.password || connectionConfig.password,
      port: connectionConfig.connection?.port || connectionConfig.port,
      connectString: connectionConfig.connection?.connectString || connectionConfig.connectString,
      options: {
        ...connectionConfig.options,
        ...connectionConfig.connection?.options
      }
    };
    
    // Create a temporary Knex instance to test the connection
    let testConfig = {
      client: flatConfig.client
    };
    
    if (flatConfig.client === 'mssql') {
      // For SQL Server, try using the mssql library directly
      try {
        let serverString = flatConfig.host;
        if (flatConfig.options?.instanceName) {
          serverString += `\\${flatConfig.options.instanceName}`;
        }
        
        const config = {
          server: serverString,
          database: flatConfig.database,
          options: {
            encrypt: flatConfig.options?.encrypt !== false,
            trustServerCertificate: flatConfig.options?.trustServerCertificate !== false,
            trustedConnection: flatConfig.options?.trustedConnection || false
          }
        };
        
        // Only add port for default instance (no instance name)
        if (!flatConfig.options?.instanceName && flatConfig.port) {
          config.port = parseInt(flatConfig.port);
        }
        
        if (!flatConfig.options?.trustedConnection) {
          config.user = flatConfig.user;
          config.password = flatConfig.password;
        }
        
        const pool = await sql.connect(config);
        await pool.request().query('SELECT 1');
        await pool.close();
        
        console.log('✅ SQL Server connection test successful for:', connectionName);
        return res.json({ success: true, message: 'Connection successful' });
        
      } catch (error) {
        console.error('❌ SQL Server connection test failed for:', connectionName, error.message);
        return res.json({ success: false, error: error.message });
      }
    } else if (flatConfig.client === 'oracledb') {
      // Handle Oracle connections specifically
      let connectionObj = {
        user: flatConfig.user,
        password: flatConfig.password
      };
      
      if (flatConfig.connectString) {
        connectionObj.connectString = flatConfig.connectString;
      } else {
        // Build connectString from components
        const host = flatConfig.host || 'localhost';
        const port = flatConfig.port || 1521;
        const service = flatConfig.database || flatConfig.service || 'XE';
        connectionObj.connectString = `${host}:${port}/${service}`;
      }
      
      testConfig.connection = connectionObj;
    } else {
      // For other database types (MySQL, PostgreSQL)
      testConfig.connection = {
        host: flatConfig.host,
        database: flatConfig.database,
        user: flatConfig.user,
        password: flatConfig.password
      };
      
      if (flatConfig.port) {
        testConfig.connection.port = parseInt(flatConfig.port);
      }
      
      // Add any additional options
      if (flatConfig.options) {
        testConfig.connection = { ...testConfig.connection, ...flatConfig.options };
      }
    }
    
    // Test the connection
    const testDb = knex(testConfig);
    
    // Use appropriate test query based on database type
    if (flatConfig.client === 'oracledb') {
      await testDb.raw('SELECT 1 FROM DUAL');
    } else {
      await testDb.raw('SELECT 1');
    }
    await testDb.destroy();
    
    console.log('✅ Connection test successful for:', connectionName);
    res.json({ success: true, message: 'Connection successful' });
    
  } catch (error) {
    console.error('❌ Connection test failed for:', req.body.connectionName || 'unknown', error.message);
    res.json({ success: false, error: error.message });
  }
});

// Update connection endpoint (temporary session-based)
app.post('/api/update-connection', async (req, res) => {
  try {
    const { name, config } = req.body;
    
    console.log('🔧 Updating connection:', name, {
      client: config.client,
      host: config.host,
      server: config.server,
      database: config.database,
      user: config.user,
      hasPassword: !!config.password,
      port: config.port,
      instanceName: config.options?.instanceName,
      options: config.options
    });
    
    // Store the updated connection in memory (session-based)
    if (!global.sessionConnections) {
      global.sessionConnections = {};
    }
    
    // Ensure proper format for session storage
    const sessionConfig = {
      client: config.client,
      displayName: config.displayName,
      host: config.server || config.host,
      database: config.database,
      user: config.user,
      password: config.password,
      port: config.port,
      options: config.options || {},
      instanceName: config.options?.instanceName
    };
    
    global.sessionConnections[name] = sessionConfig;
    
    // Clear the knex cache for this connection to force recreation with new settings
    if (knexCache[name]) {
      console.log('🔧 Clearing knex cache for connection:', name);
      try {
        await knexCache[name].destroy();
      } catch (err) {
        console.log('🔧 Error destroying cached connection:', err.message);
      }
      delete knexCache[name];
    }
    
    console.log('✅ Connection updated in session with config:', sessionConfig);
    res.json({ success: true, message: 'Connection updated temporarily for this session' });
    
  } catch (error) {
    console.error('❌ Connection update failed:', error.message);
    res.json({ success: false, error: error.message });
  }
});

// --- Customer CRUD Operations ---

// Create new customer
app.post('/api/customers', async (req, res) => {
  const db = getDb(req.query.conn);
  const start = Date.now();
  
  // Get config outside try block so it's accessible in catch block
  const tableName = getTableName('Customer', req.query.conn);
  const currentConnections = getConnections();
  const config = currentConnections[req.query.conn] || currentConnections[defaultConnection];
  
  try {
    const { 
      FirstName: firstName, 
      LastName: lastName, 
      Email: email,
      Company: company, 
      Address: address, 
      City: city, 
      State: state, 
      Country: country, 
      PostalCode: postalCode, 
      Phone: phone, 
      Fax: fax,
      SupportRepId: supportRepId 
    } = req.body;
    
    console.log(`➡️ Creating customer via connection: ${req.query.conn}`);
    console.log(`📝 Customer data:`, req.body);
    console.log(`🔧 Extracted fields:`, { firstName, lastName, email, company, address, city, state, country, postalCode, phone, fax, supportRepId });
    
    console.log(`🔧 Database config - Client: ${config.client}, Table: ${tableName}`);
    
    let result;
    if (config.client === 'pg') {
      // PostgreSQL
      const insertData = {
        first_name: firstName,
        last_name: lastName,
        email: email,
        company: company && company.trim() !== '' ? company : null,
        address: address && address.trim() !== '' ? address : null,
        city: city && city.trim() !== '' ? city : null,
        state: state && state.trim() !== '' ? state : null,
        country: country && country.trim() !== '' ? country : null,
        postal_code: postalCode && postalCode.trim() !== '' ? postalCode : null,
        phone: phone && phone.trim() !== '' ? phone : null,
        fax: fax && fax.trim() !== '' ? fax : null,
        support_rep_id: supportRepId || null
      };
      
      console.log('🔧 PostgreSQL insert data:', insertData);
      
      result = await db(tableName).insert(insertData).returning('customer_id');
    } else if (config.client === 'oracledb') {
      // Oracle
      console.log('🔧 Getting next Oracle Customer ID...');
      const customerIdResult = await db.raw('SELECT NVL(MAX(CUSTOMERID), 0) + 1 as next_id FROM CUSTOMER');
      const nextId = customerIdResult[0]?.NEXT_ID || 1;
      
      console.log(`🔧 Next Oracle Customer ID: ${nextId}`);
      
      // For Oracle, handle empty strings properly - use null for optional fields
      const insertData = {
        CUSTOMERID: nextId,
        FIRSTNAME: firstName,
        LASTNAME: lastName,
        EMAIL: email,
        COMPANY: company && company.trim() !== '' ? company : null,
        ADDRESS: address && address.trim() !== '' ? address : null,
        CITY: city && city.trim() !== '' ? city : null,
        STATE: state && state.trim() !== '' ? state : null,
        COUNTRY: country && country.trim() !== '' ? country : null,
        POSTALCODE: postalCode && postalCode.trim() !== '' ? postalCode : null,
        PHONE: phone && phone.trim() !== '' ? phone : null,
        FAX: fax && fax.trim() !== '' ? fax : null,
        SUPPORTREPID: supportRepId || null
      };
      
      console.log('🔧 Oracle insert data:', insertData);
      
      result = await db('CUSTOMER').insert(insertData);
      console.log('🔧 Oracle insert result:', result);
    } else {
      // SQL Server and MySQL
      const insertData = {
        FirstName: firstName,
        LastName: lastName,
        Email: email,
        Company: company && company.trim() !== '' ? company : null,
        Address: address && address.trim() !== '' ? address : null,
        City: city && city.trim() !== '' ? city : null,
        State: state && state.trim() !== '' ? state : null,
        Country: country && country.trim() !== '' ? country : null,
        PostalCode: postalCode && postalCode.trim() !== '' ? postalCode : null,
        Phone: phone && phone.trim() !== '' ? phone : null,
        Fax: fax && fax.trim() !== '' ? fax : null,
        SupportRepId: supportRepId || null
      };
      
      console.log(`🔧 ${config.client} insert data:`, insertData);
      
      result = await db(tableName).insert(insertData);
    }
    
    const timeMs = Date.now() - start;
    console.log(`✅ Customer created successfully in ${timeMs}ms`);
    logToFile(`✅ Customer created: ${email} in ${timeMs}ms (conn: ${req.query.conn})`);
    
    res.json({ 
      success: true, 
      message: 'Customer created successfully',
      customerId: config.client === 'pg' ? result[0]?.customer_id : (config.client === 'oracledb' ? result : result[0]),
      timeMs 
    });
    
  } catch (err) {
    const timeMs = Date.now() - start;
    console.error("❌ Customer creation failed:", err);
    
    // Provide more specific error information for different databases
    if (config.client === 'oracledb' && err.errorNum) {
      console.error("❌ Oracle Error Details:", {
        errorNum: err.errorNum,
        message: err.message,
        code: err.code,
        offset: err.offset
      });
      
      if (err.errorNum === 1400) {
        console.error("❌ ORA-01400: NOT NULL constraint violation - a required field is missing a value");
      }
    } else if (config.client === 'mssql' && err.number) {
      console.error("❌ SQL Server Error Details:", {
        number: err.number,
        message: err.message,
        state: err.state,
        class: err.class,
        serverName: err.serverName,
        procName: err.procName,
        lineNumber: err.lineNumber
      });
      
      if (err.number === 515) {
        console.error("❌ SQL Server Error 515: Cannot insert NULL into a column that doesn't allow nulls");
      }
    }
    
    logToFile(`❌ Customer creation failed after ${timeMs}ms: ${err.message}`);
    res.status(500).json({ success: false, error: err.message, timeMs });
  }
});

// Update existing customer
app.put('/api/customers/:id', async (req, res) => {
  const db = getDb(req.query.conn);
  const start = Date.now();
  try {
    const customerId = req.params.id;
    const { firstName, lastName, company, address, city, state, country, postalCode, phone, fax, email, supportRepId } = req.body;
    
    console.log(`➡️ Updating customer ${customerId} via connection: ${req.query.conn}`);
    console.log(`📝 Update data:`, req.body);
    
    const tableName = getTableName('Customer', req.query.conn);
    const currentConnections = getConnections();
    const config = currentConnections[req.query.conn] || currentConnections[defaultConnection];
    
    let result;
    if (config.client === 'pg') {
      // PostgreSQL
      result = await db(tableName)
        .where('customer_id', customerId)
        .update({
          first_name: firstName,
          last_name: lastName,
          company: company || null,
          address: address || null,
          city: city || null,
          state: state || null,
          country: country || null,
          postal_code: postalCode || null,
          phone: phone || null,
          fax: fax || null,
          email: email,
          support_rep_id: supportRepId || null
        });
    } else if (config.client === 'oracledb') {
      // Oracle
      result = await db('CUSTOMER')
        .where('CUSTOMERID', customerId)
        .update({
          FIRSTNAME: firstName,
          LASTNAME: lastName,
          COMPANY: company || null,
          ADDRESS: address || null,
          CITY: city || null,
          STATE: state || null,
          COUNTRY: country || null,
          POSTALCODE: postalCode || null,
          PHONE: phone || null,
          FAX: fax || null,
          EMAIL: email,
          SUPPORTREPID: supportRepId || null
        });
    } else {
      // SQL Server and MySQL
      result = await db(tableName)
        .where('CustomerId', customerId)
        .update({
          FirstName: firstName,
          LastName: lastName,
          Company: company || null,
          Address: address || null,
          City: city || null,
          State: state || null,
          Country: country || null,
          PostalCode: postalCode || null,
          Phone: phone || null,
          Fax: fax || null,
          Email: email,
          SupportRepId: supportRepId || null
        });
    }
    
    const timeMs = Date.now() - start;
    
    if (result === 0) {
      console.log(`⚠️ Customer ${customerId} not found for update`);
      res.status(404).json({ success: false, error: 'Customer not found', timeMs });
      return;
    }
    
    console.log(`✅ Customer ${customerId} updated successfully in ${timeMs}ms`);
    logToFile(`✅ Customer updated: ${customerId} (${email}) in ${timeMs}ms (conn: ${req.query.conn})`);
    
    res.json({ 
      success: true, 
      message: 'Customer updated successfully',
      customerId,
      timeMs 
    });
    
  } catch (err) {
    const timeMs = Date.now() - start;
    console.error("❌ Customer update failed:", err);
    logToFile(`❌ Customer update failed after ${timeMs}ms: ${err.message}`);
    res.status(500).json({ success: false, error: err.message, timeMs });
  }
});

// Delete customer
app.delete('/api/customers/:id', async (req, res) => {
  const db = getDb(req.query.conn);
  const start = Date.now();
  try {
    const customerId = req.params.id;
    const cascadeDelete = req.query.cascade === 'true';
    
    console.log(`➡️ Deleting customer ${customerId} via connection: ${req.query.conn} (cascade: ${cascadeDelete})`);
    
    const currentConnections = getConnections();
    const config = currentConnections[req.query.conn] || currentConnections[defaultConnection];
    
    let result;
    
    if (cascadeDelete) {
      // Perform cascading delete - delete related records first
      console.log(`🔄 Performing cascading delete for customer ${customerId}`);
      
      // Delete invoice lines first, then invoices, then customer
      const invoiceTableName = getTableName('Invoice', req.query.conn);
      const invoiceLineTableName = getTableName('InvoiceLine', req.query.conn);
      const customerTableName = getTableName('Customer', req.query.conn);
      
      await db.transaction(async (trx) => {
        if (config.client === 'pg') {
          // PostgreSQL
          // Delete invoice lines for this customer's invoices
          await trx.raw(`
            DELETE FROM ${invoiceLineTableName} 
            WHERE invoice_id IN (
              SELECT invoice_id FROM ${invoiceTableName} WHERE customer_id = ?
            )
          `, [customerId]);
          
          // Delete invoices for this customer
          await trx(invoiceTableName).where('customer_id', customerId).del();
          
          // Delete customer
          result = await trx(customerTableName).where('customer_id', customerId).del();
          
        } else if (config.client === 'oracledb') {
          // Oracle
          // Delete invoice lines for this customer's invoices
          await trx.raw(`
            DELETE FROM INVOICELINE 
            WHERE INVOICEID IN (
              SELECT INVOICEID FROM INVOICE WHERE CUSTOMERID = ?
            )
          `, [customerId]);
          
          // Delete invoices for this customer
          await trx('INVOICE').where('CUSTOMERID', customerId).del();
          
          // Delete customer
          result = await trx('CUSTOMER').where('CUSTOMERID', customerId).del();
          
        } else {
          // SQL Server and MySQL
          // Delete invoice lines for this customer's invoices
          await trx.raw(`
            DELETE FROM InvoiceLine 
            WHERE InvoiceId IN (
              SELECT InvoiceId FROM Invoice WHERE CustomerId = ?
            )
          `, [customerId]);
          
          // Delete invoices for this customer
          await trx('Invoice').where('CustomerId', customerId).del();
          
          // Delete customer
          result = await trx(customerTableName).where('CustomerId', customerId).del();
        }
      });
      
    } else {
      // Regular delete - let database constraints handle it
      const tableName = getTableName('Customer', req.query.conn);
      
      if (config.client === 'pg') {
        // PostgreSQL
        result = await db(tableName).where('customer_id', customerId).del();
      } else if (config.client === 'oracledb') {
        // Oracle
        result = await db('CUSTOMER').where('CUSTOMERID', customerId).del();
      } else {
        // SQL Server and MySQL
        result = await db(tableName).where('CustomerId', customerId).del();
      }
    }
    
    const timeMs = Date.now() - start;
    
    if (result === 0) {
      console.log(`⚠️ Customer ${customerId} not found for deletion`);
      res.status(404).json({ success: false, error: 'Customer not found', timeMs });
      return;
    }
    
    console.log(`✅ Customer ${customerId} deleted successfully in ${timeMs}ms (cascade: ${cascadeDelete})`);
    logToFile(`✅ Customer deleted: ${customerId} in ${timeMs}ms (conn: ${req.query.conn}, cascade: ${cascadeDelete})`);
    
    res.json({ 
      success: true, 
      message: cascadeDelete ? 'Customer and related records deleted successfully' : 'Customer deleted successfully',
      customerId,
      timeMs 
    });
    
  } catch (err) {
    const timeMs = Date.now() - start;
    console.error("❌ Customer deletion failed:", err);
    logToFile(`❌ Customer deletion failed after ${timeMs}ms: ${err.message}`);
    res.status(500).json({ success: false, error: err.message, timeMs });
  }
});

// Get single customer details
app.get('/api/customers/:id', async (req, res) => {
  const db = getDb(req.query.conn);
  const start = Date.now();
  try {
    const customerId = req.params.id;
    
    console.log(`➡️ Fetching customer ${customerId} via connection: ${req.query.conn}`);
    
    const tableName = getTableName('Customer', req.query.conn);
    const currentConnections = getConnections();
    const config = currentConnections[req.query.conn] || currentConnections[defaultConnection];
    
    let result;
    if (config.client === 'pg') {
      // PostgreSQL
      result = await db(tableName).where('customer_id', customerId).first();
    } else if (config.client === 'oracledb') {
      // Oracle
      result = await db('CUSTOMER').where('CUSTOMERID', customerId).first();
    } else {
      // SQL Server and MySQL
      result = await db(tableName).where('CustomerId', customerId).first();
    }
    
    const timeMs = Date.now() - start;
    
    if (!result) {
      console.log(`⚠️ Customer ${customerId} not found`);
      res.status(404).json({ success: false, error: 'Customer not found', timeMs });
      return;
    }
    
    console.log(`✅ Customer ${customerId} fetched successfully in ${timeMs}ms`);
    
    res.json({ 
      success: true,
      customer: result,
      timeMs 
    });
    
  } catch (err) {
    const timeMs = Date.now() - start;
    console.error("❌ Customer fetch failed:", err);
    logToFile(`❌ Customer fetch failed after ${timeMs}ms: ${err.message}`);
    res.status(500).json({ success: false, error: err.message, timeMs });
  }
});

// ============================================================================
// INVOICE CRUD ENDPOINTS
// ============================================================================

// Create invoice
app.post('/api/invoice', async (req, res) => {
  const db = getDb(req.body.connection);
  const currentConnections = getConnections();
  const config = currentConnections[req.body.connection] || currentConnections[defaultConnection];
  const dbType = config.client;
  const start = Date.now();
  try {
    console.log(`➡️ Creating invoice via connection: ${req.body.connection}`);
    
    const tableName = getTableName('Invoice', req.body.connection);
    const invoiceData = { ...req.body };
    const tracksData = invoiceData.Tracks || []; // Extract tracks data
    delete invoiceData.connection;
    delete invoiceData.Tracks; // Remove tracks from invoice data
    
    // Map column names for database compatibility
    let mappedInvoiceData = {};
    if (dbType === 'pg') {
      // PostgreSQL uses snake_case
      mappedInvoiceData = {
        customer_id: invoiceData.CustomerId,
        invoice_date: invoiceData.InvoiceDate,
        billing_address: invoiceData.BillingAddress,
        billing_city: invoiceData.BillingCity,
        billing_state: invoiceData.BillingState,
        billing_country: invoiceData.BillingCountry,
        billing_postal_code: invoiceData.BillingPostalCode,
        total: invoiceData.Total
      };
    } else if (dbType === 'oracledb') {
      // Oracle uses UPPERCASE
      mappedInvoiceData = {
        CUSTOMERID: invoiceData.CustomerId,
        INVOICEDATE: invoiceData.InvoiceDate,
        BILLINGADDRESS: invoiceData.BillingAddress,
        BILLINGCITY: invoiceData.BillingCity,
        BILLINGSTATE: invoiceData.BillingState,
        BILLINGCOUNTRY: invoiceData.BillingCountry,
        BILLINGPOSTALCODE: invoiceData.BillingPostalCode,
        TOTAL: invoiceData.Total
      };
    } else {
      // SQL Server and MySQL use PascalCase
      mappedInvoiceData = invoiceData;
    }
    
    // Insert the invoice and get the result
    const result = await db(tableName).insert(mappedInvoiceData);
    
    // Try to get the new invoice ID
    let newInvoiceId = null;
    if (Array.isArray(result) && result.length > 0) {
      newInvoiceId = result[0];
    } else if (result && result.insertId) {
      newInvoiceId = result.insertId;
    }
    
    // If we couldn't get the ID from insert, try to find the most recent invoice for this customer
    if (!newInvoiceId && invoiceData.CustomerId) {
      try {
        const customerIdCol = getColName('CustomerId', req.body.connection);
        const invoiceIdCol = getColName('InvoiceId', req.body.connection);
        
        const recentInvoice = await db(tableName)
          .where(customerIdCol, invoiceData.CustomerId)
          .orderBy(invoiceIdCol, 'desc')
          .first();
        if (recentInvoice) {
          // Handle different database column name cases
          if (dbType === 'pg') {
            newInvoiceId = recentInvoice.invoice_id;
          } else if (dbType === 'oracledb') {
            newInvoiceId = recentInvoice.INVOICEID;
          } else {
            newInvoiceId = recentInvoice.InvoiceId;
          }
        }
      } catch (err) {
        console.log('Could not fetch recent invoice ID:', err.message);
      }
    }
    
    // Create invoice line items if we have tracks and an invoice ID
    if (newInvoiceId && tracksData && tracksData.length > 0) {
      try {
        console.log(`➡️ Creating ${tracksData.length} invoice line items for invoice ${newInvoiceId}`);
        
        const invoiceLineTable = getTableName('InvoiceLine', req.body.connection);
        
        // Create line items for each track
        const lineItems = tracksData.map(track => {
          let lineItemData = {};
          
          if (dbType === 'pg') {
            // PostgreSQL uses snake_case
            lineItemData = {
              invoice_id: newInvoiceId,
              track_id: track.TrackId,
              unit_price: track.UnitPrice,
              quantity: track.Quantity
            };
          } else if (dbType === 'oracledb') {
            // Oracle uses UPPERCASE
            lineItemData = {
              INVOICEID: newInvoiceId,
              TRACKID: track.TrackId,
              UNITPRICE: track.UnitPrice,
              QUANTITY: track.Quantity
            };
          } else {
            // SQL Server and MySQL use PascalCase
            lineItemData = {
              InvoiceId: newInvoiceId,
              TrackId: track.TrackId,
              UnitPrice: track.UnitPrice,
              Quantity: track.Quantity
            };
          }
          
          return lineItemData;
        });
        
        // Insert all line items
        await db(invoiceLineTable).insert(lineItems);
        console.log(`✅ Created ${lineItems.length} invoice line items successfully`);
        
      } catch (lineItemError) {
        console.error('❌ Failed to create invoice line items:', lineItemError);
        // Don't fail the whole invoice creation, just log the error
      }
    }
    
    const timeMs = Date.now() - start;
    console.log(`✅ Invoice created successfully in ${timeMs}ms, ID: ${newInvoiceId}`);
    
    res.json({ 
      success: true,
      data: result,
      invoiceId: newInvoiceId,
      timeMs 
    });
    
  } catch (err) {
    const timeMs = Date.now() - start;
    console.error("❌ Invoice creation failed:", err);
    logToFile(`❌ Invoice creation failed after ${timeMs}ms: ${err.message}`);
    res.status(500).json({ success: false, error: err.message, timeMs });
  }
});

// Update invoice
app.put('/api/invoice/:id', async (req, res) => {
  const db = getDb(req.body.connection);
  const start = Date.now();
  try {
    const invoiceId = req.params.id;
    console.log(`➡️ Updating invoice ${invoiceId} via connection: ${req.body.connection}`);
    
    const tableName = getTableName('Invoice', req.body.connection);
    const invoiceData = { ...req.body };
    delete invoiceData.connection;
    
    const result = await db(tableName).where('InvoiceId', invoiceId).update(invoiceData);
    
    const timeMs = Date.now() - start;
    console.log(`✅ Invoice ${invoiceId} updated successfully in ${timeMs}ms`);
    
    res.json({ 
      success: true,
      data: result,
      timeMs 
    });
    
  } catch (err) {
    const timeMs = Date.now() - start;
    console.error("❌ Invoice update failed:", err);
    logToFile(`❌ Invoice update failed after ${timeMs}ms: ${err.message}`);
    res.status(500).json({ success: false, error: err.message, timeMs });
  }
});

// Delete invoice
app.delete('/api/invoice/:id', async (req, res) => {
  const db = getDb(req.body.connection);
  const start = Date.now();
  try {
    const invoiceId = req.params.id;
    
    console.log(`➡️ Deleting invoice ${invoiceId} via connection: ${req.body.connection}`);
    
    await db.transaction(async trx => {
      // Delete invoice lines first (foreign key constraint)
      await trx('InvoiceLine').where('InvoiceId', invoiceId).del();
      
      // Then delete the invoice
      const tableName = getTableName('Invoice', req.body.connection);
      await trx(tableName).where('InvoiceId', invoiceId).del();
    });
    
    const timeMs = Date.now() - start;
    console.log(`✅ Invoice ${invoiceId} deleted successfully in ${timeMs}ms`);
    
    res.json({ 
      success: true,
      timeMs 
    });
    
  } catch (err) {
    const timeMs = Date.now() - start;
    console.error("❌ Invoice deletion failed:", err);
    logToFile(`❌ Invoice deletion failed after ${timeMs}ms: ${err.message}`);
    res.status(500).json({ success: false, error: err.message, timeMs });
  }
});

// Get single invoice details
app.get('/api/invoice/:id', async (req, res) => {
  const db = getDb(req.query.conn);
  const start = Date.now();
  try {
    const invoiceId = req.params.id;
    
    console.log(`➡️ Fetching invoice ${invoiceId} via connection: ${req.query.conn}`);
    
    const tableName = getTableName('Invoice', req.query.conn);
    const result = await db(tableName).where('InvoiceId', invoiceId).first();
    
    if (!result) {
      return res.status(404).json({ success: false, error: 'Invoice not found' });
    }
    
    const timeMs = Date.now() - start;
    console.log(`✅ Invoice ${invoiceId} fetched successfully in ${timeMs}ms`);
    
    res.json({ 
      success: true,
      data: result,
      timeMs 
    });
    
  } catch (err) {
    const timeMs = Date.now() - start;
    console.error("❌ Invoice fetch failed:", err);
    logToFile(`❌ Invoice fetch failed after ${timeMs}ms: ${err.message}`);
    res.status(500).json({ success: false, error: err.message, timeMs });
  }
});

// ============================================================================
// EMPLOYEE CRUD ENDPOINTS
// ============================================================================

// Create employee
app.post('/api/employee', async (req, res) => {
  const db = getDb(req.body.connection);
  const start = Date.now();
  try {
    console.log(`➡️ Creating employee via connection: ${req.body.connection}`);
    
    const tableName = getTableName('Employee', req.body.connection);
    const employeeData = { ...req.body };
    delete employeeData.connection;
    
    const result = await db(tableName).insert(employeeData);
    
    const timeMs = Date.now() - start;
    console.log(`✅ Employee created successfully in ${timeMs}ms`);
    
    res.json({ 
      success: true,
      data: result,
      timeMs 
    });
    
  } catch (err) {
    const timeMs = Date.now() - start;
    console.error("❌ Employee creation failed:", err);
    logToFile(`❌ Employee creation failed after ${timeMs}ms: ${err.message}`);
    res.status(500).json({ success: false, error: err.message, timeMs });
  }
});

// Update employee
app.put('/api/employee/:id', async (req, res) => {
  const db = getDb(req.body.connection);
  const start = Date.now();
  try {
    const employeeId = req.params.id;
    console.log(`➡️ Updating employee ${employeeId} via connection: ${req.body.connection}`);
    
    const tableName = getTableName('Employee', req.body.connection);
    const employeeData = { ...req.body };
    delete employeeData.connection;
    
    const result = await db(tableName).where('EmployeeId', employeeId).update(employeeData);
    
    const timeMs = Date.now() - start;
    console.log(`✅ Employee ${employeeId} updated successfully in ${timeMs}ms`);
    
    res.json({ 
      success: true,
      data: result,
      timeMs 
    });
    
  } catch (err) {
    const timeMs = Date.now() - start;
    console.error("❌ Employee update failed:", err);
    logToFile(`❌ Employee update failed after ${timeMs}ms: ${err.message}`);
    res.status(500).json({ success: false, error: err.message, timeMs });
  }
});

// Delete employee
app.delete('/api/employee/:id', async (req, res) => {
  const db = getDb(req.body.connection);
  const start = Date.now();
  try {
    const employeeId = req.params.id;
    
    console.log(`➡️ Deleting employee ${employeeId} via connection: ${req.body.connection}`);
    
    const tableName = getTableName('Employee', req.body.connection);
    const result = await db(tableName).where('EmployeeId', employeeId).del();
    
    const timeMs = Date.now() - start;
    console.log(`✅ Employee ${employeeId} deleted successfully in ${timeMs}ms`);
    
    res.json({ 
      success: true,
      timeMs 
    });
    
  } catch (err) {
    const timeMs = Date.now() - start;
    console.error("❌ Employee deletion failed:", err);
    logToFile(`❌ Employee deletion failed after ${timeMs}ms: ${err.message}`);
    res.status(500).json({ success: false, error: err.message, timeMs });
  }
});

// Get single employee details
app.get('/api/employee/:id', async (req, res) => {
  const db = getDb(req.query.conn);
  const start = Date.now();
  try {
    const employeeId = req.params.id;
    
    console.log(`➡️ Fetching employee ${employeeId} via connection: ${req.query.conn}`);
    
    const tableName = getTableName('Employee', req.query.conn);
    const result = await db(tableName).where('EmployeeId', employeeId).first();
    
    if (!result) {
      return res.status(404).json({ success: false, error: 'Employee not found' });
    }
    
    const timeMs = Date.now() - start;
    console.log(`✅ Employee ${employeeId} fetched successfully in ${timeMs}ms`);
    
    res.json({ 
      success: true,
      data: result,
      timeMs 
    });
    
  } catch (err) {
    const timeMs = Date.now() - start;
    console.error("❌ Employee fetch failed:", err);
    logToFile(`❌ Employee fetch failed after ${timeMs}ms: ${err.message}`);
    res.status(500).json({ success: false, error: err.message, timeMs });
  }
});

// Update detection endpoint
app.get('/api/system/status', async (req, res) => {
  try {
    let currentCommit = null;
    let updateAvailable = false;
    let needsRestart = false;
    
    // Try to read current git commit
    try {
      if (fs.existsSync('.git/HEAD')) {
        const head = fs.readFileSync('.git/HEAD', 'utf8').trim();
        if (head.startsWith('ref: ')) {
          const ref = head.substring(5);
          if (fs.existsSync(`.git/${ref}`)) {
            currentCommit = fs.readFileSync(`.git/${ref}`, 'utf8').trim();
          }
        } else {
          currentCommit = head;
        }
      }
    } catch (err) {
      console.log('Could not read current git commit:', err.message);
    }
    
    // Check if the commit has changed since startup
    if (currentGitCommit && currentCommit && currentGitCommit !== currentCommit) {
      updateAvailable = true;
      
      // Log important update detection
      console.log(`🔄 Update detected: ${currentGitCommit?.substring(0, 8)} → ${currentCommit?.substring(0, 8)}`);
      
      // Check if package.json was modified in recent commits
      // This is a simplified check - could be enhanced with proper git diff parsing
      try {
        const { execSync } = await import('child_process');
        const gitDiff = execSync(`git diff ${currentGitCommit} ${currentCommit} --name-only`, { encoding: 'utf8' });
        const changedFiles = gitDiff.split('\n').filter(f => f.trim());
        
        // Files that require restart
        const restartRequiredFiles = [
          'package.json', 
          'server.js', 
          'serve.js',
          'ecosystem.config.cjs'
        ];
        
        needsRestart = changedFiles.some(file => 
          restartRequiredFiles.some(restartFile => file.includes(restartFile))
        );
        
        if (needsRestart) {
          console.log(`⚠️ Restart required - critical files changed:`, changedFiles.filter(f => 
            restartRequiredFiles.some(rf => f.includes(rf))
          ));
        }
        
      } catch (err) {
        // If git diff fails, assume restart needed for safety
        needsRestart = true;
        console.log('⚠️ Could not check git diff, assuming restart needed');
      }
    }
    
    res.json({
      success: true,
      startupTime: startupTime.toISOString(),
      startupCommit: currentGitCommit ? currentGitCommit.substring(0, 8) : null,
      currentCommit: currentCommit ? currentCommit.substring(0, 8) : null,
      updateAvailable,
      needsRestart,
      uptime: Math.floor((Date.now() - startupTime.getTime()) / 1000),
      fileWatchingEnabled,
      features: {
        hotReload: fileWatchingEnabled,
        autoUpdate: fileWatchingEnabled
      }
    });
    
  } catch (err) {
    console.error('❌ System status check failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Service restart endpoint (for admin use)
app.post('/api/system/restart', async (req, res) => {
  try {
    const { adminKey } = req.body;
    
    // Simple admin key check (in production, use proper authentication)
    if (adminKey !== 'restart-chinook-services') {
      return res.status(403).json({ success: false, error: 'Invalid admin key' });
    }
    
    console.log('🔄 Service restart requested via API');
    
    res.json({ 
      success: true, 
      message: 'Restart initiated. Services will restart in 3 seconds.',
      countdown: 3
    });
    
    // Graceful shutdown with delay
    setTimeout(() => {
      console.log('🔄 Initiating graceful restart...');
      process.exit(0); // NSSM will restart the service automatically
    }, 3000);
    
  } catch (err) {
    console.error('❌ Service restart failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Catch-all handler for React Router (must be after all API routes)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(3001, () => {
  console.log("🚀 Backend running on http://localhost:3001");
});