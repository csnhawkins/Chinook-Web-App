import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, DatabaseConnection, EnvironmentType } from '../types';
import { ConnectionService } from '../services/connectionService';

interface AppContextType {
  // Authentication
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  adminMode: boolean;
  setAdminMode: (mode: boolean) => void;
  
  // Site Configuration
  siteName: string;
  setSiteName: (name: string) => void;
  logoUrl: string | null;
  setLogoUrl: (url: string | null) => void;
  
  // Database Connection
  activeConnection: DatabaseConnection | null;
  setActiveConnection: (connection: DatabaseConnection | null) => void;
  setNormalizedConnection: (name: string, connection: any) => void;
  refreshConnections: () => Promise<void>;
  connections: DatabaseConnection[];
  setConnections: (connections: DatabaseConnection[]) => void;
  environment: EnvironmentType;
  setEnvironment: (env: EnvironmentType) => void;
  
  // Loading and Error states
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  
  // Notifications
  notifications: Array<{
    id: string;
    type: 'success' | 'warning' | 'error' | 'info';
    message: string;
    timestamp: Date;
  }>;
  addNotification: (type: 'success' | 'warning' | 'error' | 'info', message: string) => void;
  removeNotification: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

// Helper function to normalize connection data for compatibility
const normalizeConnection = (name: string, connection: any): DatabaseConnection => {
  const normalized: DatabaseConnection = {
    ...connection,
    name: name,
    displayName: connection.displayName || name,
  };

  // Map client to type for backward compatibility
  switch (connection.client) {
    case 'mssql':
      normalized.type = 'mssql';
      break;
    case 'mysql':
    case 'mysql2':
      normalized.type = 'mysql';
      break;
    case 'pg':
      normalized.type = 'postgresql';
      break;
    case 'oracledb':
      normalized.type = 'oracle';
      break;
  }

  // Determine environment from name if not set
  if (!normalized.environment) {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('prod')) {
      normalized.environment = 'production';
    } else if (nameLower.includes('dev')) {
      normalized.environment = 'development';
    } else {
      normalized.environment = 'nonproduction';
    }
  }

  return normalized;
};

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  // Authentication state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [adminMode, setAdminMode] = useState<boolean>(false);
  
  // Site configuration state
  const [siteName, setSiteName] = useState<string>('Chinook Music Store');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  
  // Database connection state
  const [activeConnection, setActiveConnection] = useState<DatabaseConnection | null>(null);
  const [connections, setConnections] = useState<DatabaseConnection[]>([]);
  const [environment, setEnvironment] = useState<EnvironmentType>('nonproduction');
  
  // UI state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'success' | 'warning' | 'error' | 'info';
    message: string;
    timestamp: Date;
  }>>([]);

  // Load persisted state on mount
  useEffect(() => {
    const persistedAdminMode = sessionStorage.getItem('chinookAdminMode');
    if (persistedAdminMode === 'true') {
      setAdminMode(true);
    }
    
    const persistedUser = sessionStorage.getItem('chinookUser');
    if (persistedUser) {
      try {
        setCurrentUser(JSON.parse(persistedUser));
      } catch (e) {
        console.warn('Failed to parse persisted user data');
      }
    }
    
    const persistedConnection = sessionStorage.getItem('chinookActiveConnection');
    if (persistedConnection) {
      try {
        setActiveConnection(JSON.parse(persistedConnection));
      } catch (e) {
        console.warn('Failed to parse persisted connection data');
      }
    }

    // Load site configuration from localStorage
    const savedSiteName = localStorage.getItem('siteName');
    const savedLogoUrl = localStorage.getItem('logoUrl');
    
    if (savedSiteName) setSiteName(savedSiteName);
    if (savedLogoUrl) setLogoUrl(savedLogoUrl);
  }, []);

  // Persist site configuration changes
  useEffect(() => {
    localStorage.setItem('siteName', siteName);
  }, [siteName]);

  useEffect(() => {
    if (logoUrl) {
      localStorage.setItem('logoUrl', logoUrl);
    } else {
      localStorage.removeItem('logoUrl');
    }
  }, [logoUrl]);

  // Load available connections and set default if none selected
  useEffect(() => {
    const loadConnections = async () => {
      try {
        setIsLoading(true);
        const data = await ConnectionService.getConnections();
        
        // Convert connections object to array
        const connectionArray = Object.entries(data.connections).map(([name, config]) => 
          normalizeConnection(name, config)
        );
        setConnections(connectionArray);
        
        // If no active connection is set, find and set default Production SQL Server
        if (!activeConnection) {
          // Look for production SQL Server connection first
          let defaultConnection = connectionArray.find(conn => 
            conn.environment === 'production' && 
            (conn.type === 'mssql' || conn.client === 'mssql')
          );
          
          // If no production SQL Server, try any production connection
          if (!defaultConnection) {
            defaultConnection = connectionArray.find(conn => 
              conn.environment === 'production'
            );
          }
          
          // If no production connection, try any SQL Server connection
          if (!defaultConnection) {
            defaultConnection = connectionArray.find(conn => 
              conn.type === 'mssql' || conn.client === 'mssql'
            );
          }
          
          // If still nothing, use the default from backend or first available
          if (!defaultConnection && data.default) {
            const defaultConfig = data.connections[data.default];
            if (defaultConfig) {
              defaultConnection = normalizeConnection(data.default, defaultConfig);
            }
          }
          
          // Fallback to first connection
          if (!defaultConnection && connectionArray.length > 0) {
            defaultConnection = connectionArray[0];
          }
          
          if (defaultConnection) {
            setActiveConnection(defaultConnection);
            addNotification('info', `Connected to ${defaultConnection.displayName || defaultConnection.name}`);
          }
        }
      } catch (error) {
        console.error('Failed to load connections:', error);
        addNotification('error', 'Failed to load database connections');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadConnections();
  }, []); // Run once on mount

  // Persist admin mode changes
  useEffect(() => {
    sessionStorage.setItem('chinookAdminMode', adminMode.toString());
  }, [adminMode]);

  // Persist user changes
  useEffect(() => {
    if (currentUser) {
      sessionStorage.setItem('chinookUser', JSON.stringify(currentUser));
    } else {
      sessionStorage.removeItem('chinookUser');
    }
  }, [currentUser]);

  // Persist active connection changes
  useEffect(() => {
    if (activeConnection) {
      sessionStorage.setItem('chinookActiveConnection', JSON.stringify(activeConnection));
      // Determine environment based on connection name/type
      const connectionName = activeConnection.name || activeConnection.displayName || '';
      if (connectionName.toLowerCase().includes('prod') || 
          activeConnection.environment === 'production') {
        setEnvironment('production');
      } else if (connectionName.toLowerCase().includes('dev') || 
                 activeConnection.environment === 'development') {
        setEnvironment('development');
      } else {
        setEnvironment('nonproduction');
      }
    } else {
      sessionStorage.removeItem('chinookActiveConnection');
    }
  }, [activeConnection]);

  // Notification management
  const addNotification = (type: 'success' | 'warning' | 'error' | 'info', message: string) => {
    const id = Date.now().toString();
    const notification = {
      id,
      type,
      message,
      timestamp: new Date()
    };
    
    setNotifications(prev => [...prev, notification]);
    
    // Auto-remove notification after 5 seconds (except errors)
    if (type !== 'error') {
      setTimeout(() => {
        removeNotification(id);
      }, 5000);
    }
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const refreshConnections = async () => {
    try {
      console.log('Refreshing connections from backend...');
      const data = await ConnectionService.getConnections();
      
      // Convert connections object to array
      const connectionArray = Object.entries(data.connections).map(([name, config]) => 
        normalizeConnection(name, config)
      );
      setConnections(connectionArray);
      
      // Update active connection with latest data if it exists
      if (activeConnection?.name) {
        const updatedConnection = connectionArray.find(conn => conn.name === activeConnection.name);
        if (updatedConnection) {
          console.log('Updating active connection with latest data:', updatedConnection);
          setActiveConnection(updatedConnection);
        }
      }
    } catch (error) {
      console.error('Failed to refresh connections:', error);
      addNotification('error', 'Failed to refresh connections');
    }
  };

  const setNormalizedConnection = (name: string, connection: any) => {
    const normalized = normalizeConnection(name, connection);
    setActiveConnection(normalized);
  };

  const value: AppContextType = {
    // Authentication
    currentUser,
    setCurrentUser,
    adminMode,
    setAdminMode,
    
    // Site Configuration
    siteName,
    setSiteName,
    logoUrl,
    setLogoUrl,
    
    // Database Connection
    activeConnection,
    setActiveConnection,
    setNormalizedConnection,
    refreshConnections,
    connections,
    setConnections,
    environment,
    setEnvironment,
    
    // Loading and Error states
    isLoading,
    setIsLoading,
    error,
    setError,
    
    // Notifications
    notifications,
    addNotification,
    removeNotification
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};