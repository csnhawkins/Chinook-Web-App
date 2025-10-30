import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Menu, Settings, GraduationCap, LogOut, User, Database, HelpCircle, X } from 'lucide-react';
import ConnectionSwitcher from '../connections/ConnectionSwitcher';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { 
    currentUser, 
    setCurrentUser, 
    environment,
    adminMode,
    siteName,
    logoUrl
  } = useApp();
  
  const navigate = useNavigate();
  const [showAbout, setShowAbout] = useState(false);
  const [showChangelog, setShowChangelog] = useState(false);
  
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      setCurrentUser(null);
    }
  };

  // Determine environment theme
  const getEnvironmentTheme = () => {
    switch (environment) {
      case 'production':
        return 'border-production-600';
      case 'development':
        return 'border-development-600';
      default:
        return 'border-nonproduction-600';
    }
  };

  const getEnvironmentColor = () => {
    switch (environment) {
      case 'production':
        return 'text-production-600 bg-production-100';
      case 'development':
        return 'text-development-600 bg-development-100';
      default:
        return 'text-nonproduction-600 bg-nonproduction-100';
    }
  };

  const getEnvironmentLabel = () => {
    switch (environment) {
      case 'production':
        return 'PRODUCTION';
      case 'development':
        return 'DEVELOPMENT';
      default:
        return 'NON-PRODUCTION';
    }
  };

  const getEnvironmentDisplayName = () => {
    switch (environment) {
      case 'production':
        return 'Production';
      case 'development':
        return 'Development';
      default:
        return 'Non-Production';
    }
  };

  return (
    <header className={`bg-white shadow-sm border-b-4 ${getEnvironmentTheme()}`}>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side */}
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <div className="ml-4 flex items-center space-x-2 lg:space-x-4">
              {logoUrl && (
                <img 
                  src={logoUrl} 
                  alt="Logo" 
                  className="h-6 w-6 lg:h-8 lg:w-8 object-contain"
                  onError={(e) => {
                    // Hide image if it fails to load
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
              <div className="min-w-0 flex-shrink">
                <h1 className="text-sm lg:text-lg font-semibold text-gray-900 truncate">
                  <span className="hidden lg:inline">{siteName} Hub</span>
                  <span className="lg:hidden">{siteName.length > 12 ? siteName.substring(0, 12) + '...' : siteName}</span>
                </h1>
                <div className="text-xs text-gray-600 hidden lg:block">
                  Cross-DB Customer Admin Hub
                </div>
              </div>
              
              {/* Environment indicator */}
              <div className={`hidden xl:flex items-center space-x-2 rounded-lg px-2 lg:px-3 py-1 ${getEnvironmentColor()}`}>
                <Database className="h-3 w-3 lg:h-4 lg:w-4" />
                <span className="text-xs lg:text-sm font-medium">
                  {getEnvironmentLabel()}
                </span>
              </div>
              
              {/* Admin mode indicator */}
              <div className={`flex items-center space-x-1 lg:space-x-2 rounded-lg px-2 lg:px-3 py-1 ${
                adminMode 
                  ? 'bg-green-100 text-green-800 border border-green-300' 
                  : 'bg-orange-100 text-orange-800 border border-orange-300'
              }`}>
                <User className="h-3 w-3 lg:h-4 lg:w-4" />
                <span className="text-xs lg:text-sm font-medium">
                  {adminMode ? 'ADMIN' : 'VIEW'}
                </span>
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-1 lg:space-x-4">
            {/* Connection switcher */}
            <div className="hidden lg:block">
              <ConnectionSwitcher />
            </div>

            {/* Action buttons */}
            <button 
              className="p-1 lg:p-2 text-gray-600 hover:bg-gray-100 rounded-md"
              title="Settings"
              onClick={() => navigate('/settings')}
            >
              <Settings className="h-4 w-4 lg:h-5 lg:w-5" />
            </button>
            
            <button 
              className="p-1 lg:p-2 text-gray-600 hover:bg-gray-100 rounded-md"
              title="Tutorials"
              onClick={() => navigate('/tutorials')}
            >
              <GraduationCap className="h-4 w-4 lg:h-5 lg:w-5" />
            </button>

            <button 
              className="p-1 lg:p-2 text-gray-600 hover:bg-gray-100 rounded-md"
              title="About & Help"
              onClick={() => setShowAbout(true)}
            >
              <HelpCircle className="h-4 w-4 lg:h-5 lg:w-5" />
            </button>

            {/* User menu */}
            <div className="flex items-center space-x-1 lg:space-x-3">
              <div className="flex items-center space-x-1 lg:space-x-2 bg-gray-100 rounded-lg px-2 lg:px-3 py-1 lg:py-2">
                <User className="h-4 w-4 lg:h-5 lg:w-5 text-gray-600" />
                <div className="hidden xl:block">
                  <div className="text-sm font-medium text-gray-900">
                    {currentUser?.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {adminMode ? 'Administrator' : 'Viewer'}
                  </div>
                </div>
              </div>
              
              <button 
                onClick={handleLogout}
                className="p-1 lg:p-2 text-gray-600 hover:bg-gray-100 rounded-md"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4 lg:h-5 lg:w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* About Modal */}
      {showAbout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">About {siteName}</h3>
              <button
                onClick={() => setShowAbout(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4 text-sm text-gray-600">
              <div>
                <div className="font-medium text-gray-900">Version</div>
                <div>2.2.0</div>
              </div>
              <div>
                <div className="font-medium text-gray-900">Environment</div>
                <div>{getEnvironmentDisplayName()}</div>
              </div>
              <div>
                <div className="font-medium text-gray-900">Features</div>
                <ul className="mt-1 space-y-1">
                  <li>• Multi-database customer management</li>
                  <li>• Invoice reporting and analytics</li>
                  <li>• Performance monitoring</li>
                  <li>• Tutorial system with guided learning</li>
                </ul>
              </div>
              <div className="pt-4 border-t">
                <button
                  onClick={() => {
                    setShowAbout(false);
                    setShowChangelog(true);
                  }}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  View Changelog
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Changelog Modal */}
      {showChangelog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Changelog</h3>
              <button
                onClick={() => setShowChangelog(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-6">
              {/* Version 2.2.0 */}
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <h4 className="font-semibold text-gray-900">Version 2.2.0</h4>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Latest</span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>🚀 <strong>Enhanced Login:</strong> Added quick login buttons for AdminUser and ReadOnly access</div>
                  <div>📱 <strong>Responsive Header:</strong> Optimized layout for narrow screens and side-by-side comparisons</div>
                  <div>🔗 <strong>Updated Links:</strong> GitHub repository link updated to new location</div>
                  <div>🎨 <strong>UI Polish:</strong> Improved spacing and text sizing for better mobile experience</div>
                </div>
              </div>

              {/* Version 2.1.0 */}
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <h4 className="font-semibold text-gray-900">Version 2.1.0</h4>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>📊 <strong>Performance Monitoring:</strong> Added real-time query performance indicators</div>
                  <div>🎨 <strong>UI Improvements:</strong> Enhanced admin settings with immediate feedback</div>
                  <div>🔧 <strong>Bug Fixes:</strong> Fixed tracks pagination and Reports auto-population</div>
                  <div>⚙️ <strong>Settings:</strong> Site name and logo customization with live preview</div>
                </div>
              </div>

              {/* Version 2.0.0 */}
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <h4 className="font-semibold text-gray-900">Version 2.0.0</h4>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Major</span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>🚀 <strong>Complete Modernization:</strong> Migrated from vanilla HTML/JS to React + TypeScript</div>
                  <div>📚 <strong>Tutorial System:</strong> Interactive quest-based learning with progress tracking</div>
                  <div>📈 <strong>Advanced Reports:</strong> Cross-table joins with detailed invoice analysis</div>
                  <div>👨‍💼 <strong>Admin Mode:</strong> Role-based access control with viewer restrictions</div>
                  <div>🎯 <strong>Sidebar Navigation:</strong> Organized system and admin sections</div>
                </div>
              </div>

              {/* Version 1.5.0 */}
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <h4 className="font-semibold text-gray-900">Version 1.5.0</h4>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>🗃️ <strong>Multi-Database Support:</strong> PostgreSQL, MySQL, Oracle, SQL Server</div>
                  <div>👥 <strong>Customer Management:</strong> Full CRUD operations with search</div>
                  <div>🎵 <strong>Music Catalog:</strong> Track and album browsing</div>
                  <div>📄 <strong>Invoice System:</strong> Basic invoice management</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;