import React, { useState, useCallback, useEffect } from 'react';
import { Search, FileText, User, MapPin, CreditCard, Music, Calendar, DollarSign } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';

interface BackendInvoiceReport {
  invoice: any;
  customer: any;
  tracks: any[];
  timeMs?: number;
  executionMethod?: string;
  executionDetails?: string;
}

interface InvoiceReport {
  // Invoice details
  InvoiceId: number;
  InvoiceDate: string;
  Total: number;
  BillingAddress?: string;
  BillingCity?: string;
  BillingState?: string;
  BillingCountry?: string;
  BillingPostalCode?: string;
  
  // Customer details
  CustomerId: number;
  CustomerFirstName: string;
  CustomerLastName: string;
  CustomerEmail: string;
  CustomerCompany?: string;
  CustomerAddress?: string;
  CustomerCity?: string;
  CustomerState?: string;
  CustomerCountry?: string;
  CustomerPostalCode?: string;
  CustomerPhone?: string;
  CustomerFax?: string;
  
  // Invoice items with track details
  Items: InvoiceItem[];
}

interface InvoiceItem {
  InvoiceLineId: number;
  TrackId: number;
  TrackName: string;
  AlbumTitle?: string;
  ArtistName?: string;
  GenreName?: string;
  MediaTypeName?: string;
  Composer?: string;
  Milliseconds?: number;
  Bytes?: number;
  UnitPrice: number;
  Quantity: number;
  LineTotal: number;
}

const Reports: React.FC = () => {
  const { activeConnection, adminMode } = useApp();
  const [searchParams] = useSearchParams();
  const currentConnection = activeConnection?.name;

  const [invoiceNumber, setInvoiceNumber] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<InvoiceReport | null>(null);
  const [performanceInfo, setPerformanceInfo] = useState<{
    timeMs?: number;
    executionMethod?: string;
    executionDetails?: string;
  } | null>(null);

  const fetchInvoiceReport = useCallback(async (invoiceId: string) => {
    if (!currentConnection || !invoiceId.trim()) return;

    setLoading(true);
    setError(null);
    setPerformanceInfo(null);

    try {
      // Check if slow performance mode is enabled
      const slowPerformanceMode = localStorage.getItem('slowPerformanceMode') === 'true';
      
      // Build URL with slow performance mode parameter if enabled
      const baseUrl = `http://localhost:3001/api/report/invoice/${encodeURIComponent(invoiceId)}?conn=${currentConnection}`;
      const url = slowPerformanceMode ? `${baseUrl}&demo=slow` : baseUrl;
      
      const response = await fetch(url);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Invoice #${invoiceId} not found`);
        }
        throw new Error(`Failed to fetch invoice report: ${response.status}`);
      }

      const data: BackendInvoiceReport = await response.json();
      
      // Transform backend response to frontend interface
      const transformedReport: InvoiceReport = {
        // Invoice details from backend
        InvoiceId: data.invoice.InvoiceId || data.invoice.invoiceId,
        InvoiceDate: data.invoice.InvoiceDate || data.invoice.invoiceDate,
        Total: data.invoice.Total || data.invoice.total,
        BillingAddress: data.invoice.BillingAddress || data.invoice.billingAddress,
        BillingCity: data.invoice.BillingCity || data.invoice.billingCity,
        BillingState: data.invoice.BillingState || data.invoice.billingState,
        BillingCountry: data.invoice.BillingCountry || data.invoice.billingCountry,
        BillingPostalCode: data.invoice.BillingPostalCode || data.invoice.billingPostalCode,
        
        // Customer details from backend
        CustomerId: data.customer.CustomerId || data.customer.customerId,
        CustomerFirstName: data.customer.FirstName || data.customer.firstName,
        CustomerLastName: data.customer.LastName || data.customer.lastName,
        CustomerEmail: data.customer.Email || data.customer.email,
        CustomerCompany: data.customer.Company || data.customer.company,
        CustomerAddress: data.customer.Address || data.customer.address,
        CustomerCity: data.customer.City || data.customer.city,
        CustomerState: data.customer.State || data.customer.state,
        CustomerCountry: data.customer.Country || data.customer.country,
        CustomerPostalCode: data.customer.PostalCode || data.customer.postalCode,
        CustomerPhone: data.customer.Phone || data.customer.phone,
        CustomerFax: data.customer.Fax || data.customer.fax,
        
        // Transform tracks to items
        Items: data.tracks.map((track: any) => ({
          InvoiceLineId: track.InvoiceLineId || track.invoiceLineId || 0,
          TrackId: track.TrackId || track.trackId,
          TrackName: track.TrackName || track.Name || track.name,
          AlbumTitle: track.AlbumTitle || track.albumTitle,
          ArtistName: track.ArtistName || track.artistName,
          GenreName: track.GenreName || track.genreName,
          MediaTypeName: track.MediaTypeName || track.mediaTypeName,
          Composer: track.Composer || track.composer,
          Milliseconds: track.Milliseconds || track.milliseconds,
          Bytes: track.Bytes || track.bytes,
          UnitPrice: track.UnitPrice || track.unitPrice,
          Quantity: track.Quantity || track.quantity || 1,
          LineTotal: (track.UnitPrice || track.unitPrice || 0) * (track.Quantity || track.quantity || 1)
        }))
      };
      
      setReportData(transformedReport);
      
      // Capture performance information if available
      setPerformanceInfo({
        timeMs: data.timeMs,
        executionMethod: data.executionMethod,
        executionDetails: data.executionDetails
      });
    } catch (err) {
      console.error('Error fetching invoice report:', err);
      setError(err instanceof Error ? err.message : 'Failed to load invoice report');
      setReportData(null);
      setPerformanceInfo(null);
    } finally {
      setLoading(false);
    }
  }, [currentConnection]);

  // Auto-load invoice if provided in URL parameters
  useEffect(() => {
    const invoiceId = searchParams.get('invoiceId');
    if (invoiceId) {
      setInvoiceNumber(invoiceId);
      fetchInvoiceReport(invoiceId);
    }
  }, [searchParams, fetchInvoiceReport]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (invoiceNumber.trim()) {
      fetchInvoiceReport(invoiceNumber.trim());
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDuration = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="w-8 h-8 text-indigo-600" />
          Invoice Reports
        </h1>
        <p className="text-gray-600">Generate detailed reports with cross-table data joins</p>
      </div>

      {/* Admin Mode Banner */}
      {!adminMode && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-orange-800">
            <FileText className="w-5 h-5" />
            <span className="font-semibold">Viewer Mode Active</span>
          </div>
          <p className="text-orange-700 text-sm mt-1">
            You are currently in read-only mode. Reports are available for viewing only.
          </p>
        </div>
      )}

      {/* Search Form */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">Invoice Lookup</h2>
          <p className="text-gray-600 text-sm mt-1">
            Enter an invoice number to generate a comprehensive report
          </p>
        </div>
        <div className="card-body">
          <form onSubmit={handleSearch} className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invoice Number
              </label>
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  placeholder="Enter invoice ID (e.g., 1, 25, 100)"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || !invoiceNumber.trim()}
              className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  Generate Report
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="card">
          <div className="card-body">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-800">
                <span className="font-semibold">Error:</span>
                <span>{error}</span>
              </div>
              <p className="text-red-600 text-sm mt-2">
                Please check the invoice number and try again.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Performance Information */}
      {performanceInfo && (performanceInfo.timeMs || performanceInfo.executionMethod) && (
        <div className="card">
          <div className="card-body">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-800 mb-2">
                <span className="font-semibold">Performance Information:</span>
              </div>
              <div className="text-sm text-blue-700">
                <div className="flex items-center gap-4 flex-wrap">
                  {performanceInfo.timeMs && (
                    <div className="flex items-center gap-2">
                      <span>Execution time: <span className="font-mono">{performanceInfo.timeMs}ms</span></span>
                      {performanceInfo.timeMs <= 100 ? (
                        <span className="text-green-600 text-xs bg-green-100 px-2 py-1 rounded">⚡ Fast</span>
                      ) : performanceInfo.timeMs <= 500 ? (
                        <span className="text-yellow-600 text-xs bg-yellow-100 px-2 py-1 rounded">⚠️ Moderate</span>
                      ) : (
                        <span className="text-red-600 text-xs bg-red-100 px-2 py-1 rounded">🐌 Slow - Needs optimization</span>
                      )}
                    </div>
                  )}
                  {performanceInfo.executionMethod && (
                    <>
                      <span className="text-gray-400">•</span>
                      <span>Method: <span className="font-mono">{performanceInfo.executionMethod}</span></span>
                    </>
                  )}
                  {performanceInfo.executionDetails && (
                    <>
                      <span className="text-gray-400">•</span>
                      <span>Details: <span className="font-mono">{performanceInfo.executionDetails}</span></span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Display */}
      {reportData && (
        <div className="space-y-6">
          {/* Invoice Header */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-600" />
                Invoice #{reportData.InvoiceId}
              </h2>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-600" />
                    Invoice Details
                  </h3>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Date</dt>
                      <dd className="text-sm text-gray-900">{formatDate(reportData.InvoiceDate)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Total Amount</dt>
                      <dd className="text-lg font-semibold text-green-600">{formatCurrency(reportData.Total)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Items Count</dt>
                      <dd className="text-sm text-gray-900">{reportData.Items.length} track(s)</dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-600" />
                    Billing Address
                  </h3>
                  <div className="text-sm text-gray-900 space-y-1">
                    {reportData.BillingAddress && <div>{reportData.BillingAddress}</div>}
                    <div>
                      {[reportData.BillingCity, reportData.BillingState, reportData.BillingPostalCode]
                        .filter(Boolean)
                        .join(', ')}
                    </div>
                    {reportData.BillingCountry && <div>{reportData.BillingCountry}</div>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Customer Information
              </h2>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-3">Contact Details</h3>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Name</dt>
                      <dd className="text-sm text-gray-900">
                        {reportData.CustomerFirstName} {reportData.CustomerLastName}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Email</dt>
                      <dd className="text-sm text-gray-900">{reportData.CustomerEmail}</dd>
                    </div>
                    {reportData.CustomerCompany && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Company</dt>
                        <dd className="text-sm text-gray-900">{reportData.CustomerCompany}</dd>
                      </div>
                    )}
                    {reportData.CustomerPhone && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Phone</dt>
                        <dd className="text-sm text-gray-900">{reportData.CustomerPhone}</dd>
                      </div>
                    )}
                  </dl>
                </div>

                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-3">Address</h3>
                  <div className="text-sm text-gray-900 space-y-1">
                    {reportData.CustomerAddress && <div>{reportData.CustomerAddress}</div>}
                    <div>
                      {[reportData.CustomerCity, reportData.CustomerState, reportData.CustomerPostalCode]
                        .filter(Boolean)
                        .join(', ')}
                    </div>
                    {reportData.CustomerCountry && <div>{reportData.CustomerCountry}</div>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Purchased Tracks */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Music className="w-5 h-5 text-purple-600" />
                Purchased Tracks
              </h2>
            </div>
            <div className="card-body">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Track Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Album & Artist
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.Items.map((item) => (
                      <tr key={item.InvoiceLineId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{item.TrackName}</div>
                            <div className="text-sm text-gray-500">
                              {item.GenreName && <span>{item.GenreName}</span>}
                              {item.MediaTypeName && item.GenreName && <span> • </span>}
                              {item.MediaTypeName && <span>{item.MediaTypeName}</span>}
                            </div>
                            {item.Composer && (
                              <div className="text-xs text-gray-400">Composer: {item.Composer}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            {item.AlbumTitle && (
                              <div className="text-sm text-gray-900">{item.AlbumTitle}</div>
                            )}
                            {item.ArtistName && (
                              <div className="text-sm text-gray-500">{item.ArtistName}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.Milliseconds ? formatDuration(item.Milliseconds) : 'N/A'}
                          {item.Bytes && (
                            <div className="text-xs text-gray-500">{formatFileSize(item.Bytes)}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatCurrency(item.UnitPrice)}</div>
                          <div className="text-xs text-gray-500">Qty: {item.Quantity}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(item.LineTotal)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan={4} className="px-6 py-3 text-right text-sm font-medium text-gray-900">
                        Total Invoice Amount:
                      </td>
                      <td className="px-6 py-3 text-sm font-bold text-green-600">
                        {formatCurrency(reportData.Total)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                Purchase Summary
              </h2>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{reportData.Items.length}</div>
                  <div className="text-sm text-blue-800">Tracks Purchased</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {new Set(reportData.Items.map(item => item.ArtistName)).size}
                  </div>
                  <div className="text-sm text-purple-800">Unique Artists</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {new Set(reportData.Items.map(item => item.AlbumTitle)).size}
                  </div>
                  <div className="text-sm text-green-800">Unique Albums</div>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-indigo-600">
                    {formatCurrency(reportData.Total)}
                  </div>
                  <div className="text-sm text-indigo-800">Total Amount</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sample Invoice Numbers */}
      {!reportData && !loading && !error && (
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Quick Start</h2>
          </div>
          <div className="card-body">
            <p className="text-gray-600 mb-4">
              Try these sample invoice numbers to see the cross-table join functionality:
            </p>
            <div className="flex flex-wrap gap-2">
              {[1, 5, 10, 25, 50, 100].map((invoiceId) => (
                <button
                  key={invoiceId}
                  onClick={() => {
                    setInvoiceNumber(invoiceId.toString());
                    fetchInvoiceReport(invoiceId.toString());
                  }}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
                >
                  Invoice #{invoiceId}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;