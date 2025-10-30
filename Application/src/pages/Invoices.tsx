import React, { useState, useEffect, useCallback } from 'react';
import { Search, Receipt, Plus, Eye, Calendar, DollarSign, User, ChevronLeft, ChevronRight, X, Trash2, ShoppingCart, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

interface Invoice {
  InvoiceId: number;
  CustomerId: number;
  InvoiceDate: string;
  BillingAddress?: string;
  BillingCity?: string;
  BillingState?: string;
  BillingCountry?: string;
  BillingPostalCode?: string;
  Total: number;
  CustomerName?: string;
}

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
  Email: string;
}

interface Track {
  TrackId: number;
  Name: string;
  UnitPrice: number;
  ArtistName?: string;
  AlbumTitle?: string;
}

interface InvoiceLineItem {
  TrackId: number;
  TrackName: string;
  UnitPrice: number;
  Quantity: number;
  ArtistName?: string;
  AlbumTitle?: string;
}

const Invoices: React.FC = () => {
  const { activeConnection, adminMode } = useApp();
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
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
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showNewInvoiceModal, setShowNewInvoiceModal] = useState(false);

  // Invoice creation state
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [popularTracks, setPopularTracks] = useState<Track[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [invoiceLineItems, setInvoiceLineItems] = useState<InvoiceLineItem[]>([]);
  const [trackSearch, setTrackSearch] = useState('');
  const [showTrackDropdown, setShowTrackDropdown] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowModal(true);
    document.body.style.overflow = 'hidden';
  };

  const handleNewInvoice = () => {
    fetchCustomers(); // Load customers when opening modal
    fetchPopularTracks(); // Load popular tracks for quick selection
    setShowNewInvoiceModal(true);
    document.body.style.overflow = 'hidden';
  };

  const handleViewReport = (invoice: Invoice) => {
    navigate(`/reports?invoiceId=${invoice.InvoiceId}`);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedInvoice(null);
    document.body.style.overflow = 'unset';
  };

  const closeNewInvoiceModal = () => {
    resetInvoiceForm();
    setShowNewInvoiceModal(false);
    document.body.style.overflow = 'unset';
  };

  const fetchInvoices = useCallback(async () => {
    if (!activeConnection?.name) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        conn: activeConnection.name,
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

      const response = await fetch(`http://localhost:3001/api/invoices?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch invoices`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      const invoicesData = data.rows || [];
      
      // The new /api/invoices endpoint already includes customer names and normalized data
      setInvoices(invoicesData);
      setTotalRows(data.totalRows || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load invoices');
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }, [activeConnection?.name, currentPage, limit, searchValue, searchColumn, exactMatch]);

  // Fetch customers for invoice creation
  const fetchCustomers = useCallback(async () => {
    if (!activeConnection?.name) return;

    try {
      const params = new URLSearchParams({
        conn: activeConnection.name,
        limit: '1000',
        offset: '0'
      });

      const response = await fetch(`http://localhost:3001/api/table/Customer?${params}`);
      if (response.ok) {
        const data = await response.json();
        if (data.rows) {
          const customersData = data.rows.map((customer: any) => ({
            CustomerId: customer.CustomerId || customer.customerid || customer.CUSTOMERID || customer.customer_id,
            FirstName: customer.FirstName || customer.firstname || customer.FIRSTNAME || customer.first_name || '',
            LastName: customer.LastName || customer.lastname || customer.LASTNAME || customer.last_name || '',
            Company: customer.Company || customer.company || customer.COMPANY || '',
            Address: customer.Address || customer.address || customer.ADDRESS || '',
            City: customer.City || customer.city || customer.CITY || '',
            State: customer.State || customer.state || customer.STATE || '',
            Country: customer.Country || customer.country || customer.COUNTRY || '',
            PostalCode: customer.PostalCode || customer.postalcode || customer.POSTALCODE || customer.postal_code || '',
            Phone: customer.Phone || customer.phone || customer.PHONE || '',
            Email: customer.Email || customer.email || customer.EMAIL || ''
          }));
          setCustomers(customersData);
        }
      }
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    }
  }, [activeConnection?.name]);

  // Search tracks for invoice line items
  const searchTracks = useCallback(async (searchTerm: string) => {
    if (!activeConnection?.name || !searchTerm.trim()) return;

    try {
      const params = new URLSearchParams({
        conn: activeConnection.name,
        searchValue: searchTerm,
        searchColumn: 'Name',
        limit: '20',
        offset: '0'
      });

      const response = await fetch(`http://localhost:3001/api/tracks?${params}`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          const tracksData = data.map((track: any) => ({
            TrackId: track.TrackId || track.trackid || track.TRACKID || track.track_id,
            Name: track.Name || track.name || track.NAME || track.track_name || '',
            UnitPrice: track.UnitPrice || track.unitprice || track.UNITPRICE || track.unit_price || 0,
            ArtistName: track.ArtistName || track.artistname || track.ARTISTNAME || track.artist_name || 'Unknown Artist',
            AlbumTitle: track.AlbumTitle || track.albumtitle || track.ALBUMTITLE || track.album_title || 'Unknown Album'
          }));
          setTracks(tracksData);
        }
      }
    } catch (error) {
      console.error('Failed to search tracks:', error);
    }
  }, [activeConnection?.name]);

  // Fetch popular tracks for quick selection
  const fetchPopularTracks = useCallback(async () => {
    if (!activeConnection?.name) return;

    try {
      const params = new URLSearchParams({
        conn: activeConnection.name,
        limit: '6',
        offset: '0'
      });

      const response = await fetch(`http://localhost:3001/api/tracks?${params}`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          const tracksData = data.map((track: any) => ({
            TrackId: track.TrackId || track.trackid || track.TRACKID || track.track_id,
            Name: track.Name || track.name || track.NAME || track.track_name || '',
            UnitPrice: track.UnitPrice || track.unitprice || track.UNITPRICE || track.unit_price || 0,
            ArtistName: track.ArtistName || track.artistname || track.ARTISTNAME || track.artist_name || 'Unknown Artist',
            AlbumTitle: track.AlbumTitle || track.albumtitle || track.ALBUMTITLE || track.album_title || 'Unknown Album'
          }));
          setPopularTracks(tracksData);
        }
      }
    } catch (error) {
      console.error('Failed to fetch popular tracks:', error);
    }
  }, [activeConnection?.name]);

  // Invoice creation functions
  const handleCustomerSelect = (customer: Customer | null) => {
    setSelectedCustomer(customer);
    if (customer) {
      setCustomerSearch(`${customer.FirstName} ${customer.LastName} ${customer.Company ? `(${customer.Company})` : ''}`);
    } else {
      setCustomerSearch('');
    }
    setShowCustomerDropdown(false);
  };

  const filterCustomers = (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setFilteredCustomers([]);
      return;
    }
    
    const filtered = customers.filter(customer => 
      `${customer.FirstName} ${customer.LastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.Company && customer.Company.toLowerCase().includes(searchTerm.toLowerCase())) ||
      customer.Email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCustomers(filtered.slice(0, 10)); // Limit to 10 results
  };

  const addTrackToInvoice = (track: Track) => {
    const existingItem = invoiceLineItems.find(item => item.TrackId === track.TrackId);
    if (existingItem) {
      setInvoiceLineItems(prev => 
        prev.map(item => 
          item.TrackId === track.TrackId 
            ? { ...item, Quantity: item.Quantity + 1 }
            : item
        )
      );
    } else {
      const newItem: InvoiceLineItem = {
        TrackId: track.TrackId,
        TrackName: track.Name,
        UnitPrice: track.UnitPrice,
        Quantity: 1,
        ArtistName: track.ArtistName,
        AlbumTitle: track.AlbumTitle
      };
      setInvoiceLineItems(prev => [...prev, newItem]);
    }
    setTrackSearch('');
    setShowTrackDropdown(false);
  };

  const removeTrackFromInvoice = (trackId: number) => {
    setInvoiceLineItems(prev => prev.filter(item => item.TrackId !== trackId));
  };

  const updateLineItemQuantity = (trackId: number, quantity: number) => {
    if (quantity <= 0) {
      removeTrackFromInvoice(trackId);
      return;
    }
    setInvoiceLineItems(prev => 
      prev.map(item => 
        item.TrackId === trackId 
          ? { ...item, Quantity: quantity }
          : item
      )
    );
  };

  const calculateInvoiceTotal = () => {
    return invoiceLineItems.reduce((total, item) => total + (item.UnitPrice * item.Quantity), 0);
  };

  const resetInvoiceForm = () => {
    setSelectedCustomer(null);
    setInvoiceLineItems([]);
    setTrackSearch('');
    setShowTrackDropdown(false);
    setCustomerSearch('');
    setShowCustomerDropdown(false);
    setFilteredCustomers([]);
  };

  const createInvoice = async () => {
    if (!selectedCustomer || invoiceLineItems.length === 0) {
      alert('Please select a customer and add at least one track.');
      return;
    }

    setIsCreatingInvoice(true);
    try {
      // Calculate invoice details
      const total = calculateInvoiceTotal();
      const invoiceDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      
      // Prepare invoice data for backend
      const invoiceData = {
        CustomerId: selectedCustomer.CustomerId,
        InvoiceDate: invoiceDate,
        BillingAddress: selectedCustomer.Address || '',
        BillingCity: selectedCustomer.City || '',
        BillingState: selectedCustomer.State || '',
        BillingCountry: selectedCustomer.Country || '',
        BillingPostalCode: selectedCustomer.PostalCode || '',
        Total: total,
        LineItems: invoiceLineItems.map(item => ({
          TrackId: item.TrackId,
          UnitPrice: item.UnitPrice,
          Quantity: item.Quantity
        }))
      };

      console.log('Creating invoice with data:', invoiceData);

      // Create the invoice via API call
      const response = await fetch(`http://localhost:3001/api/invoice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conn: activeConnection?.name,
          ...invoiceData
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Invoice created successfully:', result);
        
        // Show success message
        alert(`Invoice created successfully! Invoice ID: ${result.InvoiceId || 'Generated'}\nTotal: $${total.toFixed(2)}`);
        
        resetInvoiceForm();
        closeNewInvoiceModal();
        
        // Refresh the invoices list
        fetchInvoices();
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to create invoice`);
      }
    } catch (error) {
      console.error('Failed to create invoice:', error);
      alert(`Failed to create invoice: ${error instanceof Error ? error.message : 'Please try again.'}\n\nNote: This may be because the backend doesn't support invoice creation yet. The UI is ready when the backend is implemented.`);
    } finally {
      setIsCreatingInvoice(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  // Cleanup body overflow on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const totalPages = Math.ceil(totalRows / limit);
  const startRow = (currentPage - 1) * limit + 1;
  const endRow = Math.min(currentPage * limit, totalRows);

  // Get unique column names for filter dropdown
  const columns = invoices.length > 0 ? Object.keys(invoices[0]) : [];

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoice Management</h1>
          <p className="text-gray-600">Create and manage customer invoices</p>
        </div>
        
        <div className="card">
          <div className="card-body">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-800">
                <span className="font-semibold">Error loading invoices:</span>
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
          <Receipt className="w-8 h-8 text-green-600" />
          Invoice Management
        </h1>
        <p className="text-gray-600">Create and manage customer invoices</p>
      </div>

      {/* Admin Mode Banner */}
      {!adminMode && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-orange-800">
            <Receipt className="w-5 h-5" />
            <span className="font-semibold">Viewer Mode Active</span>
          </div>
          <p className="text-orange-700 text-sm mt-1">
            You are currently in read-only mode. Enable admin mode in Settings to create new invoices.
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
                  placeholder="Search invoices..."
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
                onClick={handleNewInvoice}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Invoice
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results Info */}
      {!loading && (
        <div className="text-sm text-gray-600">
          {totalRows > 0 ? (
            <>Showing <strong>{startRow}-{endRow}</strong> of <strong>{totalRows}</strong> invoices</>
          ) : (
            'No invoices found'
          )}
        </div>
      )}

      {/* Invoices Table */}
      <div className="card">
        <div className="card-body p-0">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading invoices...</p>
            </div>
          ) : invoices.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No invoices found
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
                      Invoice #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Billing City
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Country
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoices.map((invoice) => (
                    <tr key={invoice.InvoiceId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewInvoice(invoice)}
                            className="text-blue-600 hover:text-blue-900"
                            title="View invoice details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleViewReport(invoice)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="View detailed report"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Receipt className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">
                            #{invoice.InvoiceId}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <div>
                            <div className="text-sm text-gray-900">
                              {invoice.CustomerName || `Customer ${invoice.CustomerId}`}
                            </div>
                            <div className="text-sm text-gray-500">ID: {invoice.CustomerId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {formatDate(invoice.InvoiceDate)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-semibold text-green-700">
                            {formatCurrency(invoice.Total)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{invoice.BillingCity || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{invoice.BillingCountry || 'N/A'}</div>
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

      {/* Invoice Details Modal */}
      {showModal && selectedInvoice && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999] p-4"
          onClick={closeModal}
        >
          <div 
            className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Receipt className="w-8 h-8 text-blue-600" />
                Invoice Details
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="px-6 py-6 space-y-6">
              {/* Invoice Header */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Invoice #{selectedInvoice.InvoiceId}</h3>
                    <p className="text-gray-600 flex items-center gap-1 mt-1">
                      <User className="w-4 h-4" />
                      {selectedInvoice.CustomerName}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Date</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {new Date(selectedInvoice.InvoiceDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Billing Information */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Billing Address</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-1 text-sm">
                    {selectedInvoice.BillingAddress && (
                      <div>{selectedInvoice.BillingAddress}</div>
                    )}
                    <div>
                      {[selectedInvoice.BillingCity, selectedInvoice.BillingState, selectedInvoice.BillingPostalCode]
                        .filter(Boolean).join(', ')}
                    </div>
                    {selectedInvoice.BillingCountry && (
                      <div>{selectedInvoice.BillingCountry}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Total */}
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                  <span className="text-2xl font-bold text-green-700 flex items-center gap-1">
                    <DollarSign className="w-5 h-5" />
                    {selectedInvoice.Total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    // TODO: Add print/download functionality
                    console.log('Print invoice:', selectedInvoice);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Print Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Invoice Modal */}
      {showNewInvoiceModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999] p-4"
          onClick={closeNewInvoiceModal}
        >
          <div 
            className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Plus className="w-8 h-8 text-green-600" />
                Create New Invoice
              </h2>
              <button
                onClick={closeNewInvoiceModal}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="px-6 py-6">
              {/* Customer Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search and Select Customer *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search customers by name, company, or email..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={customerSearch}
                    onChange={(e) => {
                      setCustomerSearch(e.target.value);
                      filterCustomers(e.target.value);
                      if (e.target.value.trim()) {
                        setShowCustomerDropdown(true);
                      } else {
                        setShowCustomerDropdown(false);
                        setSelectedCustomer(null);
                      }
                    }}
                    onFocus={() => {
                      if (customerSearch.trim()) {
                        setShowCustomerDropdown(true);
                      }
                    }}
                  />
                  
                  {showCustomerDropdown && filteredCustomers.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                      {filteredCustomers.map(customer => (
                        <div
                          key={customer.CustomerId}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100"
                          onClick={() => handleCustomerSelect(customer)}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium text-gray-900">
                                {customer.FirstName} {customer.LastName}
                                {customer.Company && <span className="text-gray-600"> ({customer.Company})</span>}
                              </p>
                              <p className="text-sm text-gray-600">{customer.Email}</p>
                              {customer.City && customer.Country && (
                                <p className="text-xs text-gray-500">{customer.City}, {customer.Country}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {selectedCustomer && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <h4 className="font-medium text-blue-900">Selected Customer:</h4>
                    <p className="text-blue-800">
                      {selectedCustomer.FirstName} {selectedCustomer.LastName}
                      {selectedCustomer.Company && ` (${selectedCustomer.Company})`}
                    </p>
                    <p className="text-blue-700 text-sm">
                      {selectedCustomer.Address && `${selectedCustomer.Address}, `}
                      {selectedCustomer.City && `${selectedCustomer.City}, `}
                      {selectedCustomer.State && `${selectedCustomer.State} `}
                      {selectedCustomer.PostalCode && selectedCustomer.PostalCode}
                    </p>
                    <p className="text-blue-700 text-sm">{selectedCustomer.Email}</p>
                  </div>
                )}
              </div>

              {/* Track Search and Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add Tracks to Invoice
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search for tracks to add..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={trackSearch}
                    onChange={(e) => {
                      setTrackSearch(e.target.value);
                      if (e.target.value.trim()) {
                        searchTracks(e.target.value);
                        setShowTrackDropdown(true);
                      } else {
                        setShowTrackDropdown(false);
                      }
                    }}
                    onFocus={() => {
                      if (trackSearch.trim()) {
                        setShowTrackDropdown(true);
                      }
                    }}
                  />
                  
                  {showTrackDropdown && tracks.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                      {tracks.map(track => (
                        <div
                          key={track.TrackId}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100"
                          onClick={() => addTrackToInvoice(track)}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium text-gray-900">{track.Name}</p>
                              <p className="text-sm text-gray-600">
                                by {track.ArtistName} • {track.AlbumTitle}
                              </p>
                            </div>
                            <span className="font-medium text-green-600">
                              ${track.UnitPrice.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Popular Tracks Quick Selection */}
                {popularTracks.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Popular Tracks - Quick Add</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {popularTracks.slice(0, 6).map(track => (
                        <button
                          key={track.TrackId}
                          onClick={() => addTrackToInvoice(track)}
                          className="text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-colors"
                        >
                          <p className="font-medium text-gray-900 text-sm truncate">{track.Name}</p>
                          <p className="text-xs text-gray-600 truncate">by {track.ArtistName}</p>
                          <p className="text-sm font-medium text-green-600">${track.UnitPrice.toFixed(2)}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Invoice Line Items */}
              {invoiceLineItems.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Invoice Items</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    {invoiceLineItems.map(item => (
                      <div key={item.TrackId} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.TrackName}</p>
                          <p className="text-sm text-gray-600">
                            by {item.ArtistName} • {item.AlbumTitle}
                          </p>
                          <p className="text-sm text-gray-500">${item.UnitPrice.toFixed(2)} each</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-600">Qty:</label>
                            <input
                              type="number"
                              min="1"
                              value={item.Quantity}
                              onChange={(e) => updateLineItemQuantity(item.TrackId, parseInt(e.target.value) || 0)}
                              className="w-16 px-2 py-1 text-center border border-gray-300 rounded"
                            />
                          </div>
                          <span className="font-medium text-gray-900 w-20 text-right">
                            ${(item.UnitPrice * item.Quantity).toFixed(2)}
                          </span>
                          <button
                            onClick={() => removeTrackFromInvoice(item.TrackId)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    <div className="pt-3 mt-3 border-t border-gray-300">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-900">Total:</span>
                        <span className="text-xl font-bold text-green-600">
                          ${calculateInvoiceTotal().toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={closeNewInvoiceModal}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={createInvoice}
                  disabled={!selectedCustomer || invoiceLineItems.length === 0 || isCreatingInvoice}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isCreatingInvoice ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      Create Invoice
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;