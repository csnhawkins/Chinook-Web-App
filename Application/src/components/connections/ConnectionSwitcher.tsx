import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Database, CheckCircle, Edit } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ConnectionService } from '../../services/connectionService';
import { DatabaseConnection } from '../../types';

const ConnectionSwitcher: React.FC = () => {
  const { activeConnection, environment, setNormalizedConnection, addNotification } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [connections, setConnections] = useState<Record<string, DatabaseConnection>>({});
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadConnections();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadConnections = async () => {
    try {
      setLoading(true);
      const data = await ConnectionService.getConnections();
      setConnections(data.connections);
    } catch (error) {
      console.error('Failed to load connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditConnection = (name: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the switch action
    setIsOpen(false);
    navigate(`/connections?edit=${encodeURIComponent(name)}`);
  };

  const handleConnectionSwitch = (name: string, config: DatabaseConnection) => {
    setNormalizedConnection(name, config);
    addNotification('success', `Switched to ${name}`);
    setIsOpen(false);
  };

  const getEnvironmentColor = () => {
    switch (environment) {
      case 'production':
        return 'bg-production-100 text-production-800 border-production-200';
      case 'development':
        return 'bg-development-100 text-development-800 border-development-200';
      default:
        return 'bg-nonproduction-100 text-nonproduction-800 border-nonproduction-200';
    }
  };

  const getEnvironmentLabel = () => {
    switch (environment) {
      case 'production':
        return 'Production';
      case 'development':
        return 'Development';
      default:
        return 'Non-Production';
    }
  };

  // Filter connections based on current environment or show SQL Server by default
  const getRelevantConnections = () => {
    return Object.entries(connections).filter(([, config]) => {
      // If we have an active connection, show connections of the same type
      if (activeConnection?.client) {
        return config.client === activeConnection.client;
      }
      // Default to SQL Server connections
      return config.client === 'mssql';
    });
  };

  const relevantConnections = getRelevantConnections();
  const currentConnectionDisplayName = activeConnection?.displayName || activeConnection?.name || 'No Connection';

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center px-2 lg:px-3 py-1 lg:py-1.5 rounded-lg border text-xs lg:text-sm font-medium transition-colors hover:opacity-80 max-w-[180px] lg:max-w-none ${getEnvironmentColor()}`}
      >
        <Database className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2 flex-shrink-0" />
        <div className="flex flex-col items-start min-w-0 flex-1">
          <span className="text-xs opacity-75 leading-tight">{getEnvironmentLabel()}</span>
          <span className="text-xs lg:text-sm leading-tight truncate w-full">{currentConnectionDisplayName}</span>
        </div>
        <ChevronDown className={`h-3 w-3 lg:h-4 lg:w-4 ml-1 lg:ml-2 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 lg:w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="font-medium text-gray-900">Switch Connection</h3>
            <p className="text-sm text-gray-500">
              {activeConnection?.client ? `${activeConnection.client.toUpperCase()} connections` : 'SQL Server connections'}
            </p>
          </div>

          {/* Connection List */}
          <div className="max-h-64 overflow-y-auto">
            {loading ? (
              <div className="px-4 py-3 text-sm text-gray-500">Loading connections...</div>
            ) : relevantConnections.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500">No connections found</div>
            ) : (
              relevantConnections.map(([name, config]) => {
                const isActive = activeConnection?.name === name;
                const displayName = config.displayName || name;
                
                return (
                  <div
                    key={name}
                    className={`w-full px-4 py-3 border-b border-gray-50 last:border-b-0 ${
                      isActive ? 'bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => handleConnectionSwitch(name, config)}
                        disabled={isActive}
                        className={`flex-1 text-left ${
                          isActive ? 'cursor-default' : 'cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center">
                          <span className="font-medium text-gray-900">{displayName}</span>
                          {isActive && (
                            <CheckCircle className="h-4 w-4 text-green-600 ml-2" />
                          )}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {config.connection?.database || 'Unknown database'}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {config.client?.toUpperCase()}
                        </div>
                      </button>
                      
                      <button
                        onClick={(e) => handleEditConnection(name, e)}
                        className="ml-2 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                        title="Edit connection"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/connections');
              }}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Manage all connections →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectionSwitcher;