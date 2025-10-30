import React, { useState } from 'react';
import { X, Eye, EyeOff, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { DatabaseConnection } from '../../types';
import { ConnectionService } from '../../services/connectionService';

interface ConnectionModalProps {
  connection: DatabaseConnection | null;
  connectionName: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, config: DatabaseConnection) => void;
}

const ConnectionModal: React.FC<ConnectionModalProps> = ({
  connection,
  connectionName,
  isOpen,
  onClose,
  onSave
}) => {
  const [config, setConfig] = useState<DatabaseConnection>(connection || {
    client: 'mssql',
    displayName: '',
    connection: {
      user: '',
      password: '',
      server: '',
      database: '',
      port: 1433,
      options: {
        encrypt: true,
        trustServerCertificate: true,
        instanceName: ''
      }
    }
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    
    try {
      const result = await ConnectionService.testConnection(config);
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'Test failed'
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(connectionName, config);
      onClose();
    } catch (error) {
      console.error('Failed to save connection:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateConnection = (path: string, value: any) => {
    setConfig(prev => {
      const newConfig = { ...prev };
      const keys = path.split('.');
      let current: any = newConfig;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newConfig;
    });
    setTestResult(null); // Clear test result when config changes
  };

  const conn = (config.connection || {}) as any;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Edit Connection: {connectionName}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={config.displayName || ''}
                onChange={(e) => updateConnection('displayName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter display name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Database Type
              </label>
              <select
                value={config.client}
                onChange={(e) => updateConnection('client', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="mssql">SQL Server</option>
                <option value="mysql2">MySQL</option>
                <option value="pg">PostgreSQL</option>
                <option value="oracledb">Oracle</option>
              </select>
            </div>
          </div>

          {/* Connection Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Server/Host
              </label>
              <input
                type="text"
                value={conn.server || conn.host || ''}
                onChange={(e) => updateConnection('connection.server', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="localhost"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Port
              </label>
              <input
                type="number"
                value={conn.port || ''}
                onChange={(e) => updateConnection('connection.port', parseInt(e.target.value) || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={config.client === 'mssql' ? '1433' : config.client === 'pg' ? '5432' : '3306'}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {config.client === 'oracledb' ? 'Connect String' : 'Database Name'}
            </label>
            <input
              type="text"
              value={config.client === 'oracledb' ? (conn.connectString || '') : (conn.database || '')}
              onChange={(e) => updateConnection(
                config.client === 'oracledb' ? 'connection.connectString' : 'connection.database', 
                e.target.value
              )}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={config.client === 'oracledb' ? 'e.g., localhost:1521/PDBPROD' : 'Enter database name'}
            />
            {config.client === 'oracledb' && (
              <p className="text-xs text-gray-500 mt-1">
                Format: host:port/service_name (e.g., localhost:1521/PDBPROD)
              </p>
            )}
          </div>

          {/* Authentication */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                value={conn.user || ''}
                onChange={(e) => updateConnection('connection.user', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter username"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={conn.password || ''}
                  onChange={(e) => updateConnection('connection.password', e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* SQL Server Options */}
          {config.client === 'mssql' && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900">SQL Server Options</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instance Name (optional)
                </label>
                <input
                  type="text"
                  value={conn.options?.instanceName || ''}
                  onChange={(e) => updateConnection('connection.options.instanceName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., SQLEXPRESS"
                />
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={conn.options?.encrypt !== false}
                    onChange={(e) => updateConnection('connection.options.encrypt', e.target.checked)}
                    className="mr-2"
                  />
                  Encrypt Connection
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={conn.options?.trustServerCertificate !== false}
                    onChange={(e) => updateConnection('connection.options.trustServerCertificate', e.target.checked)}
                    className="mr-2"
                  />
                  Trust Server Certificate
                </label>
              </div>
            </div>
          )}

          {/* Test Result */}
          {testResult && (
            <div className={`p-4 rounded-lg flex items-center space-x-2 ${
              testResult.success 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {testResult.success ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
              <span className="text-sm">{testResult.message}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleTest}
            disabled={testing}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {testing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <CheckCircle className="h-4 w-4 mr-2" />
            )}
            {testing ? 'Testing...' : 'Test Connection'}
          </button>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionModal;