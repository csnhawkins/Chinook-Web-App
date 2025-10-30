import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Database, Settings, Loader2, Edit, TestTube, Filter } from 'lucide-react';
import { DatabaseConnection } from '../types';
import { ConnectionService } from '../services/connectionService';
import { useApp } from '../context/AppContext';
import ConnectionModal from '../components/connections/ConnectionModal';

const ConnectionsPage: React.FC = () => {
  const { addNotification, setNormalizedConnection, activeConnection, refreshConnections } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [connections, setConnections] = useState<Record<string, DatabaseConnection>>({});
  const [defaultConnection, setDefaultConnection] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [testingConnection, setTestingConnection] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; timestamp: number }>>({});
  const [editingConnection, setEditingConnection] = useState<string | null>(null);
  const [selectedRdbms, setSelectedRdbms] = useState<string>('all');

  useEffect(() => {
    loadConnections();
  }, []);

  // Handle edit parameter from URL
  useEffect(() => {
    const editParam = searchParams.get('edit');
    if (editParam && connections[editParam]) {
      setEditingConnection(editParam);
      // Clear the parameter after opening the modal
      setSearchParams(params => {
        params.delete('edit');
        return params;
      });
    }
  }, [connections, searchParams, setSearchParams]);

  const loadConnections = async () => {
    try {
      setLoading(true);
      const data = await ConnectionService.getConnections();
      setConnections(data.connections);
      setDefaultConnection(data.default);
    } catch (error) {
      addNotification('error', 'Failed to load connections');
      console.error('Error loading connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async (name: string, _config: DatabaseConnection) => {
    try {
      setTestingConnection(name);
      const result = await ConnectionService.testConnectionByName(name);
      
      // Store test result for visual feedback
      setTestResults(prev => ({
        ...prev,
        [name]: { success: result.success, timestamp: Date.now() }
      }));
      
      if (result.success) {
        addNotification('success', `✅ Connection "${name}" tested successfully`);
      } else {
        addNotification('error', `❌ Connection test failed: ${result.message || 'Unknown error'}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setTestResults(prev => ({
        ...prev,
        [name]: { success: false, timestamp: Date.now() }
      }));
      addNotification('error', `❌ Failed to test connection "${name}": ${errorMessage}`);
      console.error('Error testing connection:', error);
    } finally {
      setTestingConnection(null);
      // Clear test result after 3 seconds
      setTimeout(() => {
        setTestResults(prev => {
          const newResults = { ...prev };
          delete newResults[name];
          return newResults;
        });
      }, 3000);
    }
  };

  const handleSwitchConnection = (name: string, config: DatabaseConnection) => {
    setNormalizedConnection(name, config);
    addNotification('success', `Switched to connection "${name}"`);
  };

  const handleSaveConnection = async (name: string, config: DatabaseConnection) => {
    try {
      await ConnectionService.updateConnection(name, config);
      addNotification('success', `Connection "${name}" updated successfully`);
      await loadConnections();
      await refreshConnections(); // Also refresh the global app context
      setEditingConnection(null);
    } catch (error) {
      addNotification('error', `Failed to update connection "${name}"`);
      console.error('Error updating connection:', error);
    }
  };

  const getEnvironmentType = (name: string): 'production' | 'nonproduction' | 'development' => {
    if (name.toLowerCase().includes('prod')) return 'production';
    if (name.toLowerCase().includes('dev')) return 'development';
    return 'nonproduction';
  };

  const getEnvironmentColors = (env: 'production' | 'nonproduction' | 'development') => {
    switch (env) {
      case 'production':
        return 'bg-production-50 border-production-200 text-production-800';
      case 'development':
        return 'bg-development-50 border-development-200 text-development-800';
      default:
        return 'bg-nonproduction-50 border-nonproduction-200 text-nonproduction-800';
    }
  };

  const getClientDisplayName = (client: string) => {
    switch (client) {
      case 'mssql': return 'SQL Server';
      case 'mysql':
      case 'mysql2': return 'MySQL';
      case 'pg': return 'PostgreSQL';
      case 'oracledb': return 'Oracle';
      default: return client;
    }
  };

  const getAvailableRdbmsTypes = () => {
    const types = new Set<string>();
    Object.values(connections).forEach(config => {
      types.add(config.client);
    });
    return Array.from(types).sort();
  };

  const filterConnectionsByRdbms = (connections: Record<string, DatabaseConnection>) => {
    if (selectedRdbms === 'all') return connections;
    
    return Object.fromEntries(
      Object.entries(connections).filter(([_, config]) => config.client === selectedRdbms)
    );
  };

  const groupConnectionsByRdbms = (connections: Record<string, DatabaseConnection>) => {
    const groups: Record<string, Record<string, DatabaseConnection>> = {};
    
    Object.entries(connections).forEach(([name, config]) => {
      const rdbmsType = config.client;
      if (!groups[rdbmsType]) {
        groups[rdbmsType] = {};
      }
      groups[rdbmsType][name] = config;
    });
    
    return groups;
  };

  const formatConnectionString = (config: DatabaseConnection) => {
    const conn = config.connection || config;
    let host = (conn as any).server || (conn as any).host || 'localhost';
    
    // For SQL Server, add instance name if specified
    if (config.client === 'mssql') {
      const instanceName = (conn as any).options?.instanceName || config.options?.instanceName;
      if (instanceName) {
        host += `\\${instanceName}`;
      }
    }
    
    const port = (conn as any).port ? `:${(conn as any).port}` : '';
    const database = (conn as any).database;
    return `${host}${port}/${database}`;
  };

  const ConnectionCard = ({ name, config }: { name: string, config: DatabaseConnection }) => {
    const environment = getEnvironmentType(name);
    const isDefault = name === defaultConnection;
    const isActive = activeConnection?.name === name;
    const isTesting = testingConnection === name;
    const testResult = testResults[name];
    const hasRecentTestResult = testResult && (Date.now() - testResult.timestamp < 3000);

    return (
      <div
        key={name}
        className={`relative bg-white rounded-lg border-2 shadow-sm hover:shadow-md transition-shadow ${
          isActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
        }`}
      >
        {/* Badges */}
        {isDefault && (
          <div className="absolute top-2 right-2">
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
              Default
            </span>
          </div>
        )}
        
        {isActive && (
          <div className="absolute top-2 left-2">
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
              Active
            </span>
          </div>
        )}

        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${getEnvironmentColors(environment)}`}>
                <Database className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {config.displayName || name}
                </h3>
                <p className="text-sm text-gray-500">
                  {getClientDisplayName(config.client)}
                </p>
              </div>
            </div>
          </div>

          {/* Connection Details */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm">
              <span className="text-gray-500 w-16">Host:</span>
              <span className="text-gray-900 font-mono text-xs">
                {formatConnectionString(config)}
              </span>
            </div>
            {/* Show instance for SQL Server */}
            {config.client === 'mssql' && (config.connection?.options?.instanceName || config.options?.instanceName) && (
              <div className="flex items-center text-sm">
                <span className="text-gray-500 w-16">Instance:</span>
                <span className="text-gray-900 font-mono text-xs">
                  {config.connection?.options?.instanceName || config.options?.instanceName}
                </span>
              </div>
            )}
            <div className="flex items-center text-sm">
              <span className="text-gray-500 w-16">User:</span>
              <span className="text-gray-900">
                {config.connection?.user || config.user || 'Not specified'}
              </span>
            </div>
            <div className="flex items-center text-sm">
              <span className="text-gray-500 w-16">Auth:</span>
              <span className={`text-sm ${config.hasPassword || config.connection?.hasPassword ? 'text-green-600' : 'text-amber-600'}`}>
                {config.hasPassword || config.connection?.hasPassword ? 
                  '🔒 Password securely stored' : 
                  '⚠️ No password configured'
                }
              </span>
            </div>
            {/* Show test result feedback */}
            {hasRecentTestResult && testResult && (
              <div className="flex items-center text-sm">
                <span className="text-gray-500 w-16">Status:</span>
                <span className={`text-sm font-medium ${testResult.success ? 'text-green-600' : 'text-red-600'}`}>
                  {testResult.success ? '✅ Test passed' : '❌ Test failed'}
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex space-x-2">
            {!isActive && (
              <button
                onClick={() => handleSwitchConnection(name, config)}
                className="flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <Database className="h-4 w-4 mr-1" />
                Switch
              </button>
            )}
            
            <button
              onClick={() => handleTestConnection(name, config)}
              disabled={isTesting}
              className={`flex-1 flex items-center justify-center px-3 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm ${
                hasRecentTestResult && testResult
                  ? testResult.success 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
              title={config.hasPassword || config.connection?.hasPassword ? 'Test connection with stored credentials' : 'Password required for testing'}
            >
              {isTesting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : hasRecentTestResult && testResult ? (
                testResult.success ? (
                  <>
                    <TestTube className="h-4 w-4 mr-1" />
                    ✅ Passed
                  </>
                ) : (
                  <>
                    <TestTube className="h-4 w-4 mr-1" />
                    ❌ Failed
                  </>
                )
              ) : (
                <>
                  <TestTube className="h-4 w-4 mr-1" />
                  Test
                </>
              )}
            </button>
            
            <button
              onClick={() => setEditingConnection(name)}
              className="flex items-center justify-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
            >
              <Edit className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading connections...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Database Connections</h1>
          <p className="text-gray-600 mt-1">
            Manage and test your database connections across different environments
          </p>
        </div>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Settings className="h-4 w-4 mr-2" />
          Add Connection
        </button>
      </div>

      {/* RDBMS Filter */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <Filter className="h-4 w-4 text-gray-500 mr-2" />
            <span className="text-sm font-medium text-gray-700">Filter by Database Type:</span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedRdbms('all')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                selectedRdbms === 'all'
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Types
            </button>
            {getAvailableRdbmsTypes().map(rdbmsType => (
              <button
                key={rdbmsType}
                onClick={() => setSelectedRdbms(rdbmsType)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  selectedRdbms === rdbmsType
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {getClientDisplayName(rdbmsType)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Connections by RDBMS Type */}
      <div className="space-y-8">
        {selectedRdbms === 'all' ? (
          // Show grouped by RDBMS type
          Object.entries(groupConnectionsByRdbms(connections)).map(([rdbmsType, rdbmsConnections]) => (
            <div key={rdbmsType} className="space-y-4">
              <div className="flex items-center space-x-3">
                <Database className="h-5 w-5 text-gray-500" />
                <h2 className="text-xl font-semibold text-gray-900">
                  {getClientDisplayName(rdbmsType)}
                </h2>
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
                  {Object.keys(rdbmsConnections).length} connection{Object.keys(rdbmsConnections).length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(rdbmsConnections).map(([name, config]) => (
                  <ConnectionCard key={name} name={name} config={config} />
                ))}
              </div>
            </div>
          ))
        ) : (
          // Show filtered connections
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Database className="h-5 w-5 text-gray-500" />
              <h2 className="text-xl font-semibold text-gray-900">
                {getClientDisplayName(selectedRdbms)}
              </h2>
              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
                {Object.keys(filterConnectionsByRdbms(connections)).length} connection{Object.keys(filterConnectionsByRdbms(connections)).length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(filterConnectionsByRdbms(connections)).map(([name, config]) => (
                <ConnectionCard key={name} name={name} config={config} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Empty State */}
      {Object.keys(connections).length === 0 && (
        <div className="text-center py-12">
          <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No connections found</h3>
          <p className="text-gray-600 mb-4">
            Configure your database connections in the connections.js file
          </p>
        </div>
      )}
      
      {/* Connection Edit Modal */}
      {editingConnection && (
        <ConnectionModal
          connection={connections[editingConnection]}
          connectionName={editingConnection}
          isOpen={!!editingConnection}
          onClose={() => setEditingConnection(null)}
          onSave={handleSaveConnection}
        />
      )}
    </div>
  );
};

export default ConnectionsPage;