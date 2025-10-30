import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Database, Image, Globe, ToggleLeft, ToggleRight, Info, LogOut } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DatabaseConnection } from '../types';

const Settings: React.FC = () => {
  const { 
    activeConnection, 
    connections,
    setActiveConnection,
    currentUser,
    setCurrentUser,
    adminMode,
    setAdminMode,
    siteName,
    setSiteName,
    logoUrl,
    setLogoUrl
  } = useApp();

  const [selectedRDBMS, setSelectedRDBMS] = useState<string>('all');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [slowPerformanceMode, setSlowPerformanceMode] = useState<boolean>(false);

  // Filter connections by RDBMS type
  const filteredConnections = selectedRDBMS === 'all' 
    ? connections 
    : connections.filter(conn => {
        const client = conn.client?.toLowerCase();
        switch (selectedRDBMS) {
          case 'mssql':
            return client === 'mssql' || client === 'tedious';
          case 'pg':
            return client === 'pg' || client === 'postgresql';
          case 'mysql':
            return client === 'mysql' || client === 'mysql2';
          case 'oracledb':
            return client === 'oracledb' || client === 'oracle';
          default:
            return true;
        }
      });

  const getRDBMSDisplayName = (client: string) => {
    const clientLower = client?.toLowerCase() || '';
    if (clientLower.includes('mssql') || clientLower.includes('tedious')) return 'SQL Server';
    if (clientLower.includes('pg') || clientLower.includes('postgresql')) return 'PostgreSQL';
    if (clientLower.includes('mysql')) return 'MySQL';
    if (clientLower.includes('oracle')) return 'Oracle';
    return client || 'Unknown';
  };

  const getRDBMSType = (client: string) => {
    const clientLower = client?.toLowerCase() || '';
    if (clientLower.includes('mssql') || clientLower.includes('tedious')) return 'mssql';
    if (clientLower.includes('pg') || clientLower.includes('postgresql')) return 'pg';
    if (clientLower.includes('mysql')) return 'mysql';
    if (clientLower.includes('oracle')) return 'oracledb';
    return 'all';
  };

  const handleConnectionSelect = (connection: DatabaseConnection) => {
    setActiveConnection(connection);
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFile(file);
      
      // Create a URL for the file and update the logo immediately
      const fileUrl = URL.createObjectURL(file);
      setLogoUrl(fileUrl);
      
      console.log('Logo file selected and applied:', file.name);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      setCurrentUser(null);
    }
  };

  useEffect(() => {
    // Load saved slow performance mode setting from localStorage
    const savedSlowMode = localStorage.getItem('slowPerformanceMode');
    if (savedSlowMode) setSlowPerformanceMode(savedSlowMode === 'true');
  }, []);

  // Auto-select RDBMS filter based on active connection
  useEffect(() => {
    if (activeConnection?.client) {
      const rdbmsType = getRDBMSType(activeConnection.client);
      setSelectedRDBMS(rdbmsType);
    }
  }, [activeConnection]);

  // Save slow performance mode setting to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('slowPerformanceMode', slowPerformanceMode.toString());
  }, [slowPerformanceMode]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <SettingsIcon className="w-8 h-8 text-gray-600" />
          Administrator Settings
        </h1>
        <p className="text-gray-600">Configure database connections and application settings</p>
      </div>

      {/* RDBMS Type Filter */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600" />
            Database Connections
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Update connection details in the <code>connections.js</code> file, if required
          </p>
        </div>
        <div className="card-body">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              RDBMS Type Filter
              {activeConnection && selectedRDBMS !== 'all' && (
                <span className="ml-2 text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                  Auto-filtered to active database type
                </span>
              )}
            </label>
            <select
              className="input w-full max-w-xs"
              value={selectedRDBMS}
              onChange={(e) => setSelectedRDBMS(e.target.value)}
            >
              <option value="all">All</option>
              <option value="mssql">SQL Server</option>
              <option value="pg">PostgreSQL</option>
              <option value="mysql">MySQL</option>
              <option value="oracledb">Oracle</option>
            </select>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Available Connections</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredConnections.length === 0 ? (
                <p className="text-gray-500 text-sm">No connections found for the selected RDBMS type.</p>
              ) : (
                filteredConnections.map((connection) => (
                  <div
                    key={connection.name}
                    className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                      activeConnection?.name === connection.name
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => handleConnectionSelect(connection)}
                  >
                    <div>
                      <div className="font-medium text-gray-900">
                        {connection.displayName || connection.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {getRDBMSDisplayName(connection.client)} • {connection.name}
                      </div>
                    </div>
                    {activeConnection?.name === connection.name && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Application Settings */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Globe className="w-5 h-5 text-green-600" />
            Application Settings
          </h2>
        </div>
        <div className="card-body space-y-4">
          {/* Site Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Site Name
              <span className="ml-2 text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                Click to edit - changes apply immediately
              </span>
            </label>
            <input
              type="text"
              className="input w-full max-w-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              placeholder="Enter site name (e.g., Chinook Music Store)"
            />
            <p className="text-xs text-gray-500 mt-1">
              This name appears in the top-left header and updates immediately as you type
            </p>
          </div>

          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Image className="w-4 h-4" />
              Upload Logo Image
              <span className="ml-2 text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                Shows immediately in header
              </span>
            </label>
            <input
              type="file"
              className="input w-full max-w-md"
              accept="image/*"
              onChange={handleLogoUpload}
            />
            {logoUrl && (
              <div className="mt-2 flex items-center gap-3">
                <img 
                  src={logoUrl} 
                  alt="Current logo" 
                  className="h-8 w-8 object-contain border border-gray-200 rounded"
                />
                <div>
                  <p className="text-sm text-green-600">
                    Logo active and visible in header
                  </p>
                  <button
                    onClick={() => setLogoUrl(null)}
                    className="text-xs text-red-600 hover:text-red-800"
                  >
                    Remove logo
                  </button>
                </div>
              </div>
            )}
            {logoFile && (
              <p className="text-sm text-green-600 mt-1">
                Selected: {logoFile.name}
              </p>
            )}
          </div>

          {/* Admin Mode Toggle */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="flex items-center">
                {adminMode ? (
                  <ToggleRight className="w-6 h-6 text-green-600" />
                ) : (
                  <ToggleLeft className="w-6 h-6 text-gray-400" />
                )}
              </div>
              <div>
                <div className="font-medium text-gray-900">
                  Admin Mode
                </div>
                <div className="text-sm text-gray-600">
                  {adminMode ? 'Administrator privileges enabled' : 'Read-only viewer mode'}
                </div>
              </div>
              <input
                type="checkbox"
                className="sr-only"
                checked={adminMode}
                onChange={(e) => setAdminMode(e.target.checked)}
              />
            </label>
          </div>

          {/* Slow Performance Mode */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="flex items-center">
                {slowPerformanceMode ? (
                  <ToggleRight className="w-6 h-6 text-orange-600" />
                ) : (
                  <ToggleLeft className="w-6 h-6 text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900 flex items-center gap-2">
                  Slow Performance Mode
                  <div className="group relative">
                    <Info className="w-4 h-4 text-gray-400 cursor-help" />
                    <div className="invisible group-hover:visible absolute left-1/2 -top-2 transform -translate-x-1/2 -translate-y-full bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
                      Enables slow queries in Reports tab for performance demonstrations
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  {slowPerformanceMode ? (
                    <span className="text-orange-600">
                      🐌 Reports will use slower stored procedures for demo purposes
                    </span>
                  ) : (
                    'Reports use optimized queries for fast performance'
                  )}
                </div>
              </div>
              <input
                type="checkbox"
                className="sr-only"
                checked={slowPerformanceMode}
                onChange={(e) => setSlowPerformanceMode(e.target.checked)}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Session Information */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">Session Information</h2>
        </div>
        <div className="card-body">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Current User</div>
              <div className="text-sm text-gray-600">
                {currentUser?.name} • {adminMode ? 'Administrator' : 'Viewer'}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-300 rounded-md hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Information Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-blue-800 text-sm">
            <strong>Note:</strong> Changes to site name and logo are temporary for this session. 
            Database connection changes take effect immediately.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;