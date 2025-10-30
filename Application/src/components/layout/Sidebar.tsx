import React from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { 
  Home, 
  Users, 
  Disc3,
  Mic,
  Music,
  Receipt,
  GraduationCap,
  Settings,
  Database,
  Package,
  FileText,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const { environment, adminMode } = useApp();

  // Environment-based accent color
  const getAccentColor = () => {
    switch (environment) {
      case 'production':
        return 'text-production-600 bg-production-100 border-production-200';
      case 'development':
        return 'text-development-600 bg-development-100 border-development-200';
      default:
        return 'text-nonproduction-600 bg-nonproduction-100 border-nonproduction-200';
    }
  };

  const mainNavigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Customers', href: '/customers', icon: Users },
    { name: 'Artists', href: '/artists', icon: Mic },
    { name: 'Albums', href: '/albums', icon: Disc3 },
    { name: 'Tracks', href: '/tracks', icon: Music },
    { name: 'Invoices', href: '/invoices', icon: Receipt, adminOnly: true },
    { name: 'Offers', href: '/offers', icon: Package, adminOnly: true },
    { name: 'Reports', href: '/reports', icon: FileText },
  ];

  const systemNavigation = [
    { name: 'Connections', href: '/connections', icon: Database },
    { name: 'Tutorials', href: '/tutorials', icon: GraduationCap },
    { name: 'Settings', href: '/settings', icon: Settings, adminOnly: true },
  ];

  // Filter navigation based on admin mode
  const filteredMainNavigation = mainNavigation.filter(item => 
    !item.adminOnly || (item.adminOnly && adminMode)
  );

  const filteredSystemNavigation = systemNavigation.filter(item => 
    !item.adminOnly || (item.adminOnly && adminMode)
  );

  return (
    <div className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-gray-200 sidebar-transition ${
      isOpen ? 'w-64' : 'w-16'
    }`}>
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
        {isOpen && (
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
              <img 
                src="/logo.png" 
                alt="Chinook Logo" 
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  // Fallback to text logo if image doesn't load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div className="w-8 h-8 bg-primary-600 rounded-lg items-center justify-center hidden">
                <span className="text-white font-bold text-sm">C</span>
              </div>
            </div>
            <span className="ml-3 text-lg font-semibold text-gray-900">
              Chinook
            </span>
          </div>
        )}
        
        <button
          onClick={onToggle}
          className="p-1.5 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
        >
          {isOpen ? (
            <ChevronLeft className="h-5 w-5" />
          ) : (
            <ChevronRight className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 custom-scrollbar overflow-y-auto">
        {/* Main Navigation Section */}
        <div className="space-y-1">
          {filteredMainNavigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? `${getAccentColor()}`
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {isOpen && (
                  <span className="ml-3 truncate">{item.name}</span>
                )}
                {!isOpen && (
                  <div className="absolute left-16 ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    {item.name}
                  </div>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Separator */}
        {isOpen && <div className="my-4 border-t border-gray-200"></div>}
        {!isOpen && (
          <div className="my-4 mx-3 flex justify-center">
            <div className="w-6 border-t border-gray-300"></div>
          </div>
        )}

        {/* System Navigation Section */}
        <div className="space-y-1">
          {isOpen && (
            <div className="px-3 py-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                System
              </h3>
            </div>
          )}
          {filteredSystemNavigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'text-slate-700 bg-slate-100 border-slate-200'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                  }`
                }
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {isOpen && (
                  <span className="ml-3 truncate">{item.name}</span>
                )}
                {!isOpen && (
                  <div className="absolute left-16 ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    {item.name}
                  </div>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      {isOpen && (
        <div className="p-4 border-t border-gray-200">
          <div className={`p-2 rounded-lg ${getAccentColor()}`}>
            <p className="text-xs font-medium">
              Environment: {environment.toUpperCase()}
            </p>
            <p className="text-xs opacity-75">
              Mode: {adminMode ? 'Administrator' : 'Viewer'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;