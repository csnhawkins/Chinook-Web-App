import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Edit, Eye, Trash2, User, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface Customer {
  CustomerId: number;
  FirstName: string;
  LastName: string;
  Company?: string;
  Address?: string;
  City?: string;
  State?: string;
  Country?: string;
  PostalCode?: string;
  Phone?: string;
  Fax?: string;
  Email: string;
  SupportRepId?: number;
}

interface CustomerModalProps {
  customer?: Customer;
  isOpen: boolean;
  mode: 'view' | 'edit' | 'add';
  onClose: () => void;
  onSave?: (customer: Partial<Customer>) => void;
  onDelete?: (customerId: number) => void;
  onModeChange?: (mode: 'view' | 'edit' | 'add') => void;
  adminMode: boolean;
}

const CustomerModal: React.FC<CustomerModalProps> = ({ 
  customer, 
  isOpen, 
  mode, 
  onClose, 
  onSave, 
  onDelete,
  onModeChange,
  adminMode 
}) => {
  const [formData, setFormData] = useState<Partial<Customer>>({});
  const [originalData, setOriginalData] = useState<Partial<Customer>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (customer) {
      setFormData(customer);
      setOriginalData(customer);
    } else {
      // For new customers, set default values
      const defaultData = {
        FirstName: '',
        LastName: '',
        Email: '',
        Company: '',
        Phone: '',
        Address: '',
        City: '',
        State: '',
        Country: '',
        PostalCode: '',
        Fax: ''
      };
      setFormData(defaultData);
      setOriginalData(defaultData);
    }
  }, [customer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSave) return;

    setIsLoading(true);
    try {
      // For edit mode, only send changed fields (plus required fields)
      if (mode === 'edit' && customer) {
        const changedData: Partial<Customer> = {};
        
        // Always include the ID for updates
        changedData.CustomerId = customer.CustomerId;
        
        // Compare each field and only include changed ones
        Object.keys(formData).forEach(key => {
          const formValue = formData[key as keyof Customer];
          const originalValue = originalData[key as keyof Customer];
          
          // Convert empty strings back to undefined for optional fields
          const normalizedFormValue = formValue === '' ? undefined : formValue;
          const normalizedOriginalValue = originalValue === '' ? undefined : originalValue;
          
          if (normalizedFormValue !== normalizedOriginalValue) {
            changedData[key as keyof Customer] = normalizedFormValue as any;
          }
        });
        
        // Always include required fields even if unchanged
        changedData.FirstName = formData.FirstName;
        changedData.LastName = formData.LastName;
        changedData.Email = formData.Email;
        
        console.log('Sending customer update data:', changedData);
        await onSave(changedData);
      } else {
        // For add mode, send all data
        await onSave(formData);
      }
      // Don't call onClose() here - let the parent handle it after refresh
    } catch (error) {
      console.error('Error saving customer:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete || !customer?.CustomerId) return;

    setIsLoading(true);
    try {
      await onDelete(customer.CustomerId);
      onClose();
    } catch (error) {
      console.error('Error deleting customer:', error);
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  if (!isOpen) return null;

  const isViewMode = mode === 'view';
  const isEditMode = mode === 'edit';
  const isAddMode = mode === 'add';

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              {isAddMode ? 'Add New Customer' : isEditMode ? 'Edit Customer' : 'Customer Details'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {showDeleteConfirm ? (
          <div className="p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <h3 className="text-lg font-semibold text-red-800 mb-2">Confirm Delete</h3>
              <p className="text-red-700 mb-4">
                Are you sure you want to delete <strong>{customer?.FirstName} {customer?.LastName}</strong>? 
                This action cannot be undone and will also delete any associated records.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
                >
                  {isLoading ? 'Deleting...' : 'Delete Customer'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="overflow-y-auto max-h-[70vh]">
            {isViewMode ? (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="card">
                    <div className="card-body">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-blue-600" />
                        Personal Information
                      </h3>
                      <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-2">
                          <span className="font-medium text-gray-600">Customer ID:</span>
                          <span className="col-span-2">{customer?.CustomerId}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <span className="font-medium text-gray-600">First Name:</span>
                          <span className="col-span-2">{customer?.FirstName}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <span className="font-medium text-gray-600">Last Name:</span>
                          <span className="col-span-2">{customer?.LastName}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <span className="font-medium text-gray-600">Email:</span>
                          <span className="col-span-2">
                            <a href={`mailto:${customer?.Email}`} className="text-blue-600 hover:underline">
                              {customer?.Email}
                            </a>
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <span className="font-medium text-gray-600">Company:</span>
                          <span className="col-span-2">{customer?.Company || 'N/A'}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <span className="font-medium text-gray-600">Phone:</span>
                          <span className="col-span-2">
                            {customer?.Phone ? (
                              <a href={`tel:${customer.Phone}`} className="text-blue-600 hover:underline">
                                {customer.Phone}
                              </a>
                            ) : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="card">
                    <div className="card-body">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-green-600" />
                        Address Information
                      </h3>
                      <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-2">
                          <span className="font-medium text-gray-600">Address:</span>
                          <span className="col-span-2">{customer?.Address || 'N/A'}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <span className="font-medium text-gray-600">City:</span>
                          <span className="col-span-2">{customer?.City || 'N/A'}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <span className="font-medium text-gray-600">State:</span>
                          <span className="col-span-2">{customer?.State || 'N/A'}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <span className="font-medium text-gray-600">Country:</span>
                          <span className="col-span-2">{customer?.Country || 'N/A'}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <span className="font-medium text-gray-600">Postal Code:</span>
                          <span className="col-span-2">{customer?.PostalCode || 'N/A'}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <span className="font-medium text-gray-600">Support Rep:</span>
                          <span className="col-span-2">{customer?.SupportRepId || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 justify-center mt-6">
                  {adminMode && (
                    <>
                      <button
                        onClick={() => onModeChange && onModeChange('edit')}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Edit Customer
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Customer
                      </button>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={formData.FirstName || ''}
                      onChange={(e) => setFormData({ ...formData, FirstName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={formData.LastName || ''}
                      onChange={(e) => setFormData({ ...formData, LastName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.Email || ''}
                      onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company
                    </label>
                    <input
                      type="text"
                      value={formData.Company || ''}
                      onChange={(e) => setFormData({ ...formData, Company: e.target.value || undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.Phone || ''}
                      onChange={(e) => setFormData({ ...formData, Phone: e.target.value || undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <textarea
                      value={formData.Address || ''}
                      onChange={(e) => setFormData({ ...formData, Address: e.target.value || undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={formData.City || ''}
                      onChange={(e) => setFormData({ ...formData, City: e.target.value || undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      value={formData.State || ''}
                      onChange={(e) => setFormData({ ...formData, State: e.target.value || undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      value={formData.Country || ''}
                      onChange={(e) => setFormData({ ...formData, Country: e.target.value || undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      value={formData.PostalCode || ''}
                      onChange={(e) => setFormData({ ...formData, PostalCode: e.target.value || undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fax
                    </label>
                    <input
                      type="text"
                      value={formData.Fax || ''}
                      onChange={(e) => setFormData({ ...formData, Fax: e.target.value || undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      if (mode === 'edit' && customer) {
                        // If editing an existing customer, go back to view mode
                        onModeChange && onModeChange('view');
                      } else {
                        // If adding a new customer, close the modal
                        onClose();
                      }
                    }}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                  >
                    {mode === 'edit' && customer ? 'Back to View' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isLoading ? 'Saving...' : isAddMode ? 'Add Customer' : 'Update Customer'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const Customers: React.FC = () => {
  const { activeConnection, adminMode } = useApp();
  const currentConnection = activeConnection?.name;
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search and filter state
  const [searchValue, setSearchValue] = useState('');
  const [searchColumn, setSearchColumn] = useState('');
  const [exactMatch, setExactMatch] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [limit] = useState(50);
  
  // Modal state
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: 'view' | 'edit' | 'add';
    customer?: Customer;
  }>({
    isOpen: false,
    mode: 'view'
  });

  const fetchCustomers = useCallback(async () => {
    if (!currentConnection) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        conn: currentConnection,
        limit: limit.toString(),
        offset: ((currentPage - 1) * limit).toString()
      });

      if (searchValue) {
        params.append('search', searchValue);
      }
      if (searchColumn) {
        params.append('searchColumn', searchColumn);
      }
      if (exactMatch) {
        params.append('exactMatch', '1');
      }

      const response = await fetch(`http://localhost:3001/api/table/Customer?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch customers`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setCustomers(data.rows || []);
      setTotalRows(data.totalRows || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load customers');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, [currentConnection, currentPage, limit, searchValue, searchColumn, exactMatch]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleSearch = (value: string) => {
    setSearchValue(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleColumnChange = (column: string) => {
    setSearchColumn(column);
    setCurrentPage(1);
  };

  const handleExactMatchChange = (exact: boolean) => {
    setExactMatch(exact);
    setCurrentPage(1);
  };

  const openModal = (mode: 'view' | 'edit' | 'add', customer?: Customer) => {
    setModalState({ isOpen: true, mode, customer });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, mode: 'view' });
  };

  const handleModeChange = (mode: 'view' | 'edit' | 'add') => {
    setModalState(prev => ({ ...prev, mode }));
  };

  const handleSaveCustomer = async (customerData: Partial<Customer>) => {
    if (!currentConnection) return;

    try {
      const isUpdate = modalState.mode === 'edit' && modalState.customer?.CustomerId;
      const url = isUpdate 
        ? `http://localhost:3001/api/customers/${modalState.customer!.CustomerId}?conn=${currentConnection}`
        : `http://localhost:3001/api/customers?conn=${currentConnection}`;
      
      const response = await fetch(url, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(customerData)
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to save customer');
      }

      // Refresh the customer list and wait for it to complete
      await fetchCustomers();
      
      // Close the modal after successful save and refresh
      setModalState({ isOpen: false, mode: 'view' });
      
      // Show success message (you might want to add a toast notification system)
      alert(`Customer ${isUpdate ? 'updated' : 'added'} successfully!`);
    } catch (err) {
      alert(`Failed to save customer: ${err instanceof Error ? err.message : 'Unknown error'}`);
      throw err;
    }
  };

  const handleDeleteCustomer = async (customerId: number) => {
    if (!currentConnection) return;

    try {
      const response = await fetch(
        `http://localhost:3001/api/customers/${customerId}?conn=${currentConnection}&cascade=true`, 
        { method: 'DELETE' }
      );

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete customer');
      }

      // Refresh the customer list
      await fetchCustomers();
      
      alert('Customer deleted successfully!');
    } catch (err) {
      alert(`Failed to delete customer: ${err instanceof Error ? err.message : 'Unknown error'}`);
      throw err;
    }
  };

  const totalPages = Math.ceil(totalRows / limit);
  const startRow = (currentPage - 1) * limit + 1;
  const endRow = Math.min(currentPage * limit, totalRows);

  // Get unique column names for filter dropdown
  const columns = customers.length > 0 ? Object.keys(customers[0]) : [];

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
          <p className="text-gray-600">Manage your customer database</p>
        </div>
        
        <div className="card">
          <div className="card-body">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-800">
                <span className="font-semibold">Error loading customers:</span>
                <span>{error}</span>
              </div>
              <p className="text-red-600 text-sm mt-2">
                Please check your database connection and try again.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <User className="w-8 h-8 text-blue-600" />
          Customer Management
        </h1>
        <p className="text-gray-600">Manage your customer database</p>
      </div>

      {/* Admin Mode Banner */}
      {!adminMode && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-orange-800">
            <User className="w-5 h-5" />
            <span className="font-semibold">Viewer Mode Active</span>
          </div>
          <p className="text-orange-700 text-sm mt-1">
            You are currently in read-only mode. Enable admin mode in Settings to add, edit, or delete customers.
          </p>
        </div>
      )}

      {/* Search and Controls */}
      <div className="card">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 items-center flex-1">
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={searchValue}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <select
                value={searchColumn}
                onChange={(e) => handleColumnChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Columns</option>
                {columns.map(column => (
                  <option key={column} value={column}>{column}</option>
                ))}
              </select>
              
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={exactMatch}
                  onChange={(e) => handleExactMatchChange(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Exact match</span>
              </label>
            </div>
            
            {adminMode && (
              <button
                onClick={() => openModal('add')}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Customer
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results Info */}
      {!loading && (
        <div className="text-sm text-gray-600">
          {totalRows > 0 ? (
            <>Showing <strong>{startRow}-{endRow}</strong> of <strong>{totalRows}</strong> customers</>
          ) : (
            'No customers found'
          )}
        </div>
      )}

      {/* Customer Table */}
      <div className="card">
        <div className="card-body p-0">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading customers...</p>
            </div>
          ) : customers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No customers found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      City
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Country
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {customers.map((customer) => (
                    <tr key={customer.CustomerId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openModal('view', customer)}
                            className="text-blue-600 hover:text-blue-900"
                            title="View customer details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {adminMode && (
                            <button
                              onClick={() => openModal('edit', customer)}
                              className="text-green-600 hover:text-green-900"
                              title="Edit customer"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {customer.FirstName} {customer.LastName}
                        </div>
                        <div className="text-sm text-gray-500">ID: {customer.CustomerId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{customer.Email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{customer.Company || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{customer.City || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{customer.Country || 'N/A'}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Customer Modal */}
      <CustomerModal
        customer={modalState.customer}
        isOpen={modalState.isOpen}
        mode={modalState.mode}
        onClose={closeModal}
        onSave={handleSaveCustomer}
        onDelete={handleDeleteCustomer}
        onModeChange={handleModeChange}
        adminMode={adminMode}
      />
    </div>
  );
};

export default Customers;