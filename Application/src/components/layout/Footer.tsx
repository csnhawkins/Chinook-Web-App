import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Database, FileText, X, ExternalLink, BarChart3, Palette, Wrench, Settings, FolderOpen, Users, Music, Rocket, Smartphone, Link } from 'lucide-react';

const Footer: React.FC = () => {
  const { activeConnection, environment, siteName } = useApp();
  const [showChangelog, setShowChangelog] = useState(false);

  const getVersionInfo = () => {
    return {
      app: '2.2.0',
      build: '2024.10.30',
      commit: 'abc123f'
    };
  };

  const version = getVersionInfo();

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
    <>
      <footer className="bg-white border-t border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between text-xs text-gray-500">
          {/* Left side - App info */}
          <div className="flex items-center space-x-4">
            <span className="font-medium text-gray-700">{siteName}</span>
            <span>v{version.app}</span>
            <span>Build {version.build}</span>
            {activeConnection && (
              <div className="flex items-center space-x-1">
                <Database className="h-3 w-3" />
                <span>{activeConnection.displayName || activeConnection.name}</span>
              </div>
            )}
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center space-x-3">
            <span className="text-gray-600">{getEnvironmentDisplayName()}</span>
            <button
              onClick={() => setShowChangelog(true)}
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition-colors"
            >
              <FileText className="h-3 w-3" />
              <span>Changelog</span>
            </button>
            <a
              href="https://github.com/csnhawkins/Chinook-Web-App"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </footer>

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
                  <div className="flex items-center"><Rocket className="h-4 w-4 mr-2" /> <strong>Enhanced Login:</strong> Added quick login buttons for AdminUser and ReadOnly access</div>
                  <div className="flex items-center"><Smartphone className="h-4 w-4 mr-2" /> <strong>Responsive Header:</strong> Optimized layout for narrow screens and side-by-side comparisons</div>
                  <div className="flex items-center"><Link className="h-4 w-4 mr-2" /> <strong>Updated Links:</strong> GitHub repository link updated to new location</div>
                  <div className="flex items-center"><Palette className="h-4 w-4 mr-2" /> <strong>UI Polish:</strong> Improved spacing and text sizing for better mobile experience</div>
                </div>
              </div>

              {/* Version 2.1.0 */}
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <h4 className="font-semibold text-gray-900">Version 2.1.0</h4>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex items-center"><BarChart3 className="h-4 w-4 mr-2" /> <strong>Performance Monitoring:</strong> Added real-time query performance indicators</div>
                  <div className="flex items-center"><Palette className="h-4 w-4 mr-2" /> <strong>UI Improvements:</strong> Enhanced admin settings with immediate feedback</div>
                  <div className="flex items-center"><Wrench className="h-4 w-4 mr-2" /> <strong>Bug Fixes:</strong> Fixed tracks pagination and Reports auto-population</div>
                  <div className="flex items-center"><Settings className="h-4 w-4 mr-2" /> <strong>Settings:</strong> Site name and logo customization with live preview</div>
                </div>
              </div>

              {/* Version 2.0.0 */}
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <h4 className="font-semibold text-gray-900">Version 2.0.0</h4>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Major</span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex items-center"><Rocket className="h-4 w-4 mr-2" /> <strong>Complete Modernization:</strong> Migrated from vanilla HTML/JS to React + TypeScript</div>
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
                  <div className="flex items-center"><FolderOpen className="h-4 w-4 mr-2" /> <strong>Multi-Database Support:</strong> PostgreSQL, MySQL, Oracle, SQL Server</div>
                  <div className="flex items-center"><Users className="h-4 w-4 mr-2" /> <strong>Customer Management:</strong> Full CRUD operations with search</div>
                  <div className="flex items-center"><Music className="h-4 w-4 mr-2" /> <strong>Music Catalog:</strong> Track and album browsing</div>
                  <div className="flex items-center"><FileText className="h-4 w-4 mr-2" /> <strong>Invoice System:</strong> Basic invoice management</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Footer;