import React, { useState, useEffect, useCallback } from 'react';
import { Package, Eye, ChevronLeft, ChevronRight, X, Tag, DollarSign } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface Offer {
  OfferId: number;
  Title: string;
  Description?: string;
  DiscountPercentage?: number;
  StartDate?: string;
  EndDate?: string;
  IsActive?: boolean;
  CreatedDate?: string;
  [key: string]: any; // For dynamic properties from different database schemas
}

const Offers: React.FC = () => {
  const { activeConnection } = useApp();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tableExists, setTableExists] = useState<boolean | null>(null);
  
  // Search and filter state
  const [searchValue, setSearchValue] = useState('');
  const [searchColumn, setSearchColumn] = useState('');
  const [exactMatch, setExactMatch] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [limit] = useState(50);

  // Modal state
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleViewDetails = (offer: Offer) => {
    setSelectedOffer(offer);
    setShowModal(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setSelectedOffer(null);
    setShowModal(false);
    document.body.style.overflow = 'unset';
  };

  const fetchOffers = useCallback(async () => {
    if (!activeConnection?.name) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        environment: activeConnection.name,
        limit: limit.toString(),
        offset: ((currentPage - 1) * limit).toString()
      });

      if (searchValue && searchColumn) {
        params.append('searchValue', searchValue);
        params.append('searchColumn', searchColumn);
      }

      if (exactMatch) {
        params.append('exactMatch', '1');
      }

      const response = await fetch(`http://localhost:3001/api/table/Offer?${params}`);
      
      if (!response.ok) {
        // Try to get the response body to check for table not found errors
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          // If we can't parse JSON, use status code approach
          if (response.status === 404 || response.status === 500) {
            setTableExists(false);
            setOffers([]);
            setTotalRows(0);
            return;
          }
          throw new Error(`HTTP ${response.status}: Failed to fetch offers`);
        }

        // Check if this is a table not found error in the response body
        if (errorData?.error) {
          const errorMsg = errorData.error.toLowerCase();
          if (errorMsg.includes('does not exist') || 
              errorMsg.includes('not found') || 
              errorMsg.includes('invalid object name') ||
              (errorMsg.includes('table') && errorMsg.includes('offer')) ||
              errorMsg.includes('no such table') ||
              errorMsg.includes('table') && errorMsg.includes('does not exist')) {
            setTableExists(false);
            setOffers([]);
            setTotalRows(0);
            return;
          }
        }

        // If it's a 404 or 500 without specific error message, assume table doesn't exist
        if (response.status === 404 || response.status === 500) {
          setTableExists(false);
          setOffers([]);
          setTotalRows(0);
          return;
        }
        
        throw new Error(`HTTP ${response.status}: Failed to fetch offers`);
      }

      const data = await response.json();
      
      if (data.error) {
        // Check for various table not found error messages
        const errorMsg = data.error.toLowerCase();
        if (errorMsg.includes('does not exist') || 
            errorMsg.includes('not found') || 
            errorMsg.includes('invalid object name') ||
            errorMsg.includes('table') && errorMsg.includes('offer') ||
            errorMsg.includes('no such table')) {
          setTableExists(false);
          setOffers([]);
          setTotalRows(0);
          return;
        }
        throw new Error(data.error);
      }

      setTableExists(true);
      const offersData = data.rows || [];
      
      // Normalize offer data to handle different database schemas
      const normalizedOffers = offersData.map((offer: any) => ({
        OfferId: offer.OfferId || offer.offerid || offer.OFFERID || offer.offer_id || offer.id,
        Title: offer.Title || offer.title || offer.TITLE || offer.name || offer.Name || offer.NAME || 'Untitled Offer',
        Description: offer.Description || offer.description || offer.DESCRIPTION || offer.details || offer.Details,
        DiscountPercentage: offer.DiscountPercentage || offer.discountpercentage || offer.DISCOUNTPERCENTAGE || offer.discount_percentage || offer.discount,
        StartDate: offer.StartDate || offer.startdate || offer.STARTDATE || offer.start_date || offer.validFrom,
        EndDate: offer.EndDate || offer.enddate || offer.ENDDATE || offer.end_date || offer.validTo,
        IsActive: offer.IsActive || offer.isactive || offer.ISACTIVE || offer.is_active || offer.active || true,
        CreatedDate: offer.CreatedDate || offer.createddate || offer.CREATEDDATE || offer.created_date || offer.created_at,
        // Include all original properties for display flexibility
        ...offer
      }));

      setOffers(normalizedOffers);
      setTotalRows(data.totalRows || normalizedOffers.length);
    } catch (err) {
      console.error('Error fetching offers:', err);
      // Check if this is a table not found error
      if (err instanceof Error) {
        const errorMsg = err.message.toLowerCase();
        if (errorMsg.includes('does not exist') || 
            errorMsg.includes('not found') || 
            errorMsg.includes('invalid object name') ||
            (errorMsg.includes('table') && errorMsg.includes('offer')) ||
            errorMsg.includes('no such table') ||
            errorMsg.includes('500') || // Handle HTTP 500 as potential table not found
            errorMsg.includes('internal server error')) {
          setTableExists(false);
          setOffers([]);
          setTotalRows(0);
        } else {
          setError(err.message);
          setOffers([]);
        }
      } else {
        // For any other type of error, assume table doesn't exist
        setTableExists(false);
        setOffers([]);
        setTotalRows(0);
      }
    } finally {
      setLoading(false);
    }
  }, [activeConnection?.name, currentPage, limit, searchValue, searchColumn, exactMatch]);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

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

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const formatPercentage = (percentage: number | undefined | null) => {
    if (percentage === null || percentage === undefined) return 'N/A';
    return `${percentage}%`;
  };

  const totalPages = Math.ceil(totalRows / limit);
  const startRow = (currentPage - 1) * limit + 1;
  const endRow = Math.min(currentPage * limit, totalRows);

  // Get unique column names for filter dropdown
  const columns = offers.length > 0 ? Object.keys(offers[0]).filter(key => 
    !key.startsWith('_') && typeof offers[0][key] !== 'object'
  ) : [];

  // If there's an error that might be table-related, treat as table not found
  if (error && (
    error.toLowerCase().includes('offer') || 
    error.toLowerCase().includes('table') || 
    error.toLowerCase().includes('500') ||
    error.toLowerCase().includes('internal server error')
  )) {
    // Reset error and set table as not existing
    setError(null);
    setTableExists(false);
  }

  // Handle table not existing
  if (tableExists === false) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="w-8 h-8 text-purple-600" />
            Special Offers
          </h1>
          <p className="text-gray-600">Manage promotional offers and discounts</p>
        </div>
        
        <div className="card">
          <div className="card-body">
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Offers Table Not Found</h3>
              <p className="text-gray-600 mb-4 max-w-md mx-auto">
                The "Offers" table doesn't exist in the current database schema. This table is expected to contain promotional offers and discount information.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-lg mx-auto">
                <h4 className="text-blue-900 font-medium mb-2">Expected Table Structure:</h4>
                <ul className="text-blue-800 text-sm text-left space-y-1">
                  <li>• <strong>OfferId</strong> - Unique identifier</li>
                  <li>• <strong>Title</strong> - Offer name/title</li>
                  <li>• <strong>Description</strong> - Offer details</li>
                  <li>• <strong>DiscountPercentage</strong> - Discount amount</li>
                  <li>• <strong>StartDate</strong> - When offer begins</li>
                  <li>• <strong>EndDate</strong> - When offer expires</li>
                  <li>• <strong>IsActive</strong> - Whether offer is active</li>
                </ul>
              </div>
              <p className="text-gray-500 text-sm mt-4">
                Once the table is created with data, refresh this page to view the offers.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="w-8 h-8 text-purple-600" />
            Special Offers
          </h1>
          <p className="text-gray-600">Manage promotional offers and discounts</p>
        </div>
        
        <div className="card">
          <div className="card-body">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-800">
                <span className="font-semibold">Error loading offers:</span>
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
          <Package className="w-8 h-8 text-purple-600" />
          Special Offers
        </h1>
        <p className="text-gray-600">Manage promotional offers and discounts</p>
      </div>

      {/* Search and Controls */}
      <div className="card">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search offers
              </label>
              <input
                type="text"
                placeholder="Enter search term..."
                className="input w-full"
                value={searchValue}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            
            <div className="w-full sm:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search in column
              </label>
              <select
                className="input w-full"
                value={searchColumn}
                onChange={(e) => handleColumnChange(e.target.value)}
              >
                <option value="">All columns</option>
                {columns.map((column) => (
                  <option key={column} value={column}>
                    {column}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={exactMatch}
                  onChange={(e) => handleExactMatchChange(e.target.checked)}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                Exact match
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Offers {totalRows > 0 && `(${totalRows.toLocaleString()} total)`}
            </h2>
            {totalRows > 0 && (
              <div className="text-sm text-gray-500">
                Showing {startRow} to {endRow} of {totalRows.toLocaleString()} offers
              </div>
            )}
          </div>
        </div>
        
        <div className="card-body">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <span className="ml-3 text-gray-600">Loading offers...</span>
            </div>
          ) : offers.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No offers found</h3>
              <p className="text-gray-600">
                {searchValue ? 'Try adjusting your search criteria.' : 'No offers are currently available in the database.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Discount</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {offers.map((offer, index) => (
                    <tr key={offer.OfferId || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Tag className="w-4 h-4 text-purple-600 mr-2" />
                          <div className="text-sm font-medium text-gray-900">{offer.Title}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {offer.Description || 'No description'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm">
                          <DollarSign className="w-4 h-4 text-green-600 mr-1" />
                          <span className="font-medium text-green-600">
                            {formatPercentage(offer.DiscountPercentage)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(offer.StartDate)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(offer.EndDate)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          offer.IsActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {offer.IsActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleViewDetails(offer)}
                          className="text-purple-600 hover:text-purple-900 flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
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

      {/* Offer Details Modal */}
      {showModal && selectedOffer && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999] p-4"
          onClick={closeModal}
        >
          <div 
            className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Package className="w-8 h-8 text-purple-600" />
                Offer Details
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="px-6 py-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{selectedOffer.Title}</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Offer ID</label>
                      <p className="text-gray-900">{selectedOffer.OfferId}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Discount</label>
                      <p className="text-green-600 font-medium">{formatPercentage(selectedOffer.DiscountPercentage)}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Start Date</label>
                      <p className="text-gray-900">{formatDate(selectedOffer.StartDate)}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">End Date</label>
                      <p className="text-gray-900">{formatDate(selectedOffer.EndDate)}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedOffer.IsActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedOffer.IsActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    {selectedOffer.CreatedDate && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Created Date</label>
                        <p className="text-gray-900">{formatDate(selectedOffer.CreatedDate)}</p>
                      </div>
                    )}
                  </div>
                  
                  {selectedOffer.Description && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{selectedOffer.Description}</p>
                    </div>
                  )}
                </div>

                {/* Show additional fields if they exist */}
                {Object.keys(selectedOffer).filter(key => 
                  !['OfferId', 'Title', 'Description', 'DiscountPercentage', 'StartDate', 'EndDate', 'IsActive', 'CreatedDate'].includes(key) &&
                  !key.startsWith('_') &&
                  selectedOffer[key] !== null &&
                  selectedOffer[key] !== undefined &&
                  selectedOffer[key] !== ''
                ).length > 0 && (
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-3">Additional Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(selectedOffer)
                        .filter(([key, value]) => 
                          !['OfferId', 'Title', 'Description', 'DiscountPercentage', 'StartDate', 'EndDate', 'IsActive', 'CreatedDate'].includes(key) &&
                          !key.startsWith('_') &&
                          value !== null &&
                          value !== undefined &&
                          value !== ''
                        )
                        .map(([key, value]) => (
                          <div key={key}>
                            <label className="block text-sm font-medium text-gray-700">{key}</label>
                            <p className="text-gray-900">{String(value)}</p>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Offers;