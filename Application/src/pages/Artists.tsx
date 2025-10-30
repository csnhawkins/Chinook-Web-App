import React, { useState, useEffect, useCallback } from 'react';
import { Search, User, Disc3, Music, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

interface Artist {
  ArtistId: number;
  Name: string;
  AlbumCount?: number;
  TrackCount?: number;
}

const Artists: React.FC = () => {
  const { activeConnection } = useApp();
  const navigate = useNavigate();
  const [artists, setArtists] = useState<Artist[]>([]);
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
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleViewDetails = (artist: Artist) => {
    setSelectedArtist(artist);
    setShowModal(true);
    
    // Prevent background scrolling
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedArtist(null);
    
    // Restore background scrolling
    document.body.style.overflow = 'unset';
  };

  const fetchArtists = useCallback(async () => {
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

      const response = await fetch(`http://localhost:3001/api/artists?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch artists`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      const artistsData = data.rows || [];
      
      // The new /api/artists endpoint already includes album counts and normalized data
      setArtists(artistsData);
      setTotalRows(data.totalRows || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load artists');
      setArtists([]);
    } finally {
      setLoading(false);
    }
  }, [activeConnection?.name, currentPage, limit, searchValue, searchColumn, exactMatch]);

  useEffect(() => {
    fetchArtists();
  }, [fetchArtists]);

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

  const totalPages = Math.ceil(totalRows / limit);
  const startRow = (currentPage - 1) * limit + 1;
  const endRow = Math.min(currentPage * limit, totalRows);

  // Get unique column names for filter dropdown
  const columns = artists.length > 0 ? Object.keys(artists[0]) : [];

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Artists</h1>
          <p className="text-gray-600">Explore your artist database</p>
        </div>
        
        <div className="card">
          <div className="card-body">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-800">
                <span className="font-semibold">Error loading artists:</span>
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
          <User className="w-8 h-8 text-orange-600" />
          Artists
        </h1>
        <p className="text-gray-600">Explore your artist database</p>
      </div>

      {/* Search and Controls */}
      <div className="card">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex items-center gap-2 flex-1">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search artists..."
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
        </div>
      </div>

      {/* Results Info */}
      {!loading && (
        <div className="text-sm text-gray-600">
          {totalRows > 0 ? (
            <>Showing <strong>{startRow}-{endRow}</strong> of <strong>{totalRows}</strong> artists</>
          ) : (
            'No artists found'
          )}
        </div>
      )}

      {/* Artists Table */}
      <div className="card">
        <div className="card-body p-0">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading artists...</p>
            </div>
          ) : artists.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No artists found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Artist
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Albums
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tracks
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {artists.map((artist) => (
                    <tr 
                      key={artist.ArtistId} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleViewDetails(artist)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-orange-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900" title={artist.Name}>
                              {artist.Name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">#{artist.ArtistId}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-600">
                          <Disc3 className="w-4 h-4 mr-1" />
                          {artist.AlbumCount !== undefined ? artist.AlbumCount : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-600">
                          <Music className="w-4 h-4 mr-1" />
                          {artist.TrackCount !== undefined ? artist.TrackCount : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(artist);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View Details
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

      {/* Artist Details Modal */}
      {showModal && selectedArtist && (
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
                <User className="w-8 h-8 text-orange-600" />
                Artist Details
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="px-6 py-6 space-y-6">
              {/* Artist Header */}
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{selectedArtist.Name}</h3>
                  <p className="text-gray-600">Artist #{selectedArtist.ArtistId}</p>
                </div>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Disc3 className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-gray-900">Albums</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">
                    {selectedArtist.AlbumCount || 0}
                  </p>
                  <p className="text-sm text-gray-600">Total albums in catalog</p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Music className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-gray-900">Tracks</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {selectedArtist.TrackCount || 0}
                  </p>
                  <p className="text-sm text-gray-600">Total tracks available</p>
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
                    // Navigate to Albums page with artist filter
                    closeModal();
                    navigate(`/albums?artist=${encodeURIComponent(selectedArtist.Name)}`);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  View Albums
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Artists;