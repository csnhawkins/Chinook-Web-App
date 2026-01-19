import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Users, Disc3, TrendingUp, Loader2, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';
import { DashboardService } from '../services/dashboardService';

const Dashboard: React.FC = () => {
  const { activeConnection, environment, addNotification } = useApp();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    customerCount: 0,
    totalInvoices: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(false);
  const [hasData, setHasData] = useState(false);
  const [timePeriod, setTimePeriod] = useState('alltime');

  useEffect(() => {
    if (activeConnection) {
      // Add a small delay to ensure connection is stable
      const timer = setTimeout(() => {
        loadDashboardData();
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setStats({ customerCount: 0, totalInvoices: 0, totalRevenue: 0 });
      setHasData(false);
    }
  }, [activeConnection, timePeriod]);

  const loadDashboardData = async () => {
    if (!activeConnection?.name) {
      console.log('No active connection available for dashboard');
      return;
    }
    
    try {
      setLoading(true);
      console.log('Loading dashboard data for connection:', activeConnection.name);
      console.log('Active connection object:', activeConnection);
      const dashboardStats = await DashboardService.getDashboardStats(activeConnection.name, timePeriod);
      setStats(dashboardStats);
      setHasData(true);
      addNotification('success', 'Dashboard data loaded successfully');
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      addNotification('error', `Failed to load dashboard data: ${errorMessage}`);
      setHasData(false);
      // Set fallback data
      setStats({ customerCount: 0, totalInvoices: 0, totalRevenue: 0 });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'customers':
        navigate('/customers');
        break;
      case 'albums':
        navigate('/albums');
        break;
      case 'invoice':
        navigate('/invoices');
        break;
      default:
        console.log(`Unknown action: ${action}`);
    }
  };

  const getDisplayName = () => {
    return activeConnection?.displayName || activeConnection?.name || 'No Connection';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome to your music store overview</p>
        </div>
        <div className="flex items-center gap-4">
          {/* Time Period Filter */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setTimePeriod('day')}
              className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                timePeriod === 'day' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Day
            </button>
            <button
              onClick={() => setTimePeriod('month')}
              className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                timePeriod === 'month' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setTimePeriod('year')}
              className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                timePeriod === 'year' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Year
            </button>
            <button
              onClick={() => setTimePeriod('alltime')}
              className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                timePeriod === 'alltime' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All Time
            </button>
          </div>
          
          {activeConnection && (
            <button
              onClick={loadDashboardData}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          )}
        </div>
      </div>

      {/* Connection Status */}
      {!activeConnection && (
        <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-warning-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-warning-800">
                No Database Connection
              </h3>
              <p className="text-sm text-warning-700 mt-1">
                Please configure a database connection to view your data.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? (
                    <Loader2 className="h-6 w-6 animate-spin inline" />
                  ) : hasData ? (
                    stats.customerCount.toLocaleString()
                  ) : (
                    '---'
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Disc3 className="h-8 w-8 text-success-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Invoices</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? (
                    <Loader2 className="h-6 w-6 animate-spin inline" />
                  ) : hasData ? (
                    stats.totalInvoices > 0 ? stats.totalInvoices.toLocaleString() : '0'
                  ) : (
                    '---'
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-warning-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? (
                    <Loader2 className="h-6 w-6 animate-spin inline" />
                  ) : hasData ? (
                    formatCurrency(stats.totalRevenue)
                  ) : (
                    '$---'
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart3 className="h-8 w-8 text-danger-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Data Status</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? (
                    <Loader2 className="h-6 w-6 animate-spin inline" />
                  ) : hasData ? (
                    <CheckCircle className="h-6 w-6 text-green-500 inline" />
                  ) : (
                    <AlertTriangle className="h-6 w-6 text-yellow-500 inline" />
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Environment Info */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">System Information</h3>
        </div>
        <div className="card-body">
          <dl className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Environment</dt>
              <dd className={`text-lg font-semibold ${
                environment === 'production' ? 'text-production-700' :
                environment === 'development' ? 'text-development-700' :
                'text-nonproduction-700'
              }`}>
                {environment.toUpperCase()}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Database</dt>
              <dd className="text-lg font-semibold text-gray-900">
                {activeConnection?.type?.toUpperCase() || 'Not Connected'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Connection</dt>
              <dd className="text-lg font-semibold text-gray-900">
                {getDisplayName()}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => handleQuickAction('customers')}
              className="btn-primary btn-md w-full"
            >
              View Customers
            </button>
            <button 
              onClick={() => handleQuickAction('albums')}
              className="btn-primary btn-md w-full"
              style={{ backgroundColor: '#7c3aed', borderColor: '#7c3aed' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#6d28d9';
                e.currentTarget.style.borderColor = '#6d28d9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#7c3aed';
                e.currentTarget.style.borderColor = '#7c3aed';
              }}
            >
              Browse Albums
            </button>
            <button 
              onClick={() => handleQuickAction('invoice')}
              className="btn-success btn-md w-full"
            >
              Create Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;