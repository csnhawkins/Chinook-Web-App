import React, { useState } from 'react';
import { User, Lock, Shield, Eye, Lightbulb, AlertTriangle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { User as UserType } from '../../types';

const Login: React.FC = () => {
  const { setCurrentUser, adminMode, setAdminMode } = useApp();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username.trim()) {
      alert('Please enter a username');
      return;
    }

    setIsLoading(true);
    
    // Simulate login delay
    setTimeout(() => {
      const user: UserType = {
        id: Date.now().toString(),
        name: formData.username.trim(),
        role: adminMode ? 'admin' : 'viewer',
        loginTime: new Date()
      };
      
      setCurrentUser(user);
      setIsLoading(false);
    }, 1000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
            <img 
              src="/logo.png" 
              alt="Chinook Logo" 
              className="w-12 h-12 object-contain"
              onError={(e) => {
                // Fallback to icon if image doesn't load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            <div className="w-12 h-12 bg-primary-600 rounded-lg items-center justify-center hidden">
              <span className="text-white font-bold text-lg">C</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Chinook Music Store</h1>
          <p className="text-lg font-medium text-primary-600">Cross-DB Customer Admin Hub</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Welcome Back</h2>
            <p className="text-gray-600 text-sm mt-1">Please sign in to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="form-input pl-10"
                  placeholder="Enter your username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="form-label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="form-input pl-10"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            {/* Admin Mode Toggle */}
            <div className="flex items-center justify-center space-x-3 py-2">
              <div className="flex items-center space-x-2">
                <Eye className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Viewer</span>
              </div>
              
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={adminMode}
                  onChange={(e) => setAdminMode(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Admin</span>
                <Shield className="h-4 w-4 text-gray-500" />
              </div>
            </div>

            {/* Recent Logins Section */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Quick Login</h3>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ username: 'AdminUser', password: 'admin123' });
                    setAdminMode(true);
                    setTimeout(() => {
                      const user: UserType = {
                        id: Date.now().toString(),
                        name: 'AdminUser',
                        role: 'admin',
                        loginTime: new Date()
                      };
                      setCurrentUser(user);
                    }, 500);
                  }}
                  className="w-full text-left px-3 py-2 text-sm bg-white border border-gray-200 rounded hover:bg-gray-50 transition-colors flex items-center"
                >
                  <Shield className="h-4 w-4 text-blue-600 mr-2" />
                  AdminUser
                  <span className="ml-auto text-xs text-gray-500">Admin</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ username: 'ReadOnly', password: 'readonly123' });
                    setAdminMode(false);
                    setTimeout(() => {
                      const user: UserType = {
                        id: Date.now().toString(),
                        name: 'ReadOnly',
                        role: 'viewer',
                        loginTime: new Date()
                      };
                      setCurrentUser(user);
                    }, 500);
                  }}
                  className="w-full text-left px-3 py-2 text-sm bg-white border border-gray-200 rounded hover:bg-gray-50 transition-colors flex items-center"
                >
                  <Eye className="h-4 w-4 text-green-600 mr-2" />
                  ReadOnly
                  <span className="ml-auto text-xs text-gray-500">Viewer</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary btn-md flex items-center justify-center mt-4"
            >
              {isLoading ? (
                <>
                  <div className="spinner h-5 w-5 mr-2"></div>
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 flex items-center">
              <Lightbulb className="h-3 w-3 mr-1" />
              Use any username and password to login
            </p>
            {adminMode && (
              <p className="text-xs text-warning-600 mt-1 flex items-center">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Admin mode allows adding, editing, and deleting records
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;