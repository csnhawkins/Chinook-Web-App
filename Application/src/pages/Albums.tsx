import React, { useState, useEffect, useCallback } from 'react';
import { Search, Disc3, User, ChevronLeft, ChevronRight, X, Music, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useSearchParams } from 'react-router-dom';

interface Album {
  AlbumId: number;
  Title: string;
  ArtistId: number;
  ArtistName?: string;
}

const Albums: React.FC = () => {
  const { activeConnection } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [albums, setAlbums] = useState<Album[]>([]);
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
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [albumTracks, setAlbumTracks] = useState<any[]>([]);

  const handleViewDetails = async (album: Album) => {
    setSelectedAlbum(album);
    setShowModal(true);
    
    // Prevent background scrolling
    document.body.style.overflow = 'hidden';
    
    // Fetch tracks for this album
    try {
      const params = new URLSearchParams({
        conn: activeConnection?.name || '',
        limit: '100',
        offset: '0',
        searchColumn: 'AlbumId',
        search: album.AlbumId.toString(),
        exactMatch: '1'
      });
      
      const response = await fetch(`http://localhost:3001/api/table/Track?${params}`);
      if (response.ok) {
        const data = await response.json();
        setAlbumTracks(data.rows || []);
      }
    } catch (error) {
      console.warn('Failed to fetch album tracks:', error);
      setAlbumTracks([]);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedAlbum(null);
    setAlbumTracks([]);
    
    // Restore background scrolling
    document.body.style.overflow = 'unset';
  };

  const formatDuration = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const fetchAlbums = useCallback(async () => {
    if (!activeConnection?.name) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        conn: activeConnection.name,
        limit: limit.toString(),
        offset: ((currentPage - 1) * limit).toString()
      });

      // Only add search params if not filtering by artist from URL
      const artistParam = searchParams.get('artist');
      const isArtistFilter = artistParam && searchValue === artistParam;
      
      if (searchValue && !isArtistFilter) {
        params.append('search', searchValue);
      }
      if (searchColumn && !isArtistFilter) {
        params.append('searchColumn', searchColumn);
      }
      if (exactMatch && !isArtistFilter) {
        params.append('exactMatch', '1');
      }

      // For artist filtering, get more albums to filter on client side
      if (isArtistFilter) {
        params.set('limit', '1000'); // Get more albums for client-side filtering
        params.set('offset', '0');
      }

      const response = await fetch(`http://localhost:3001/api/albums?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch albums`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      const albumsData = data.rows || [];
      
      // Normalize album data to handle different database schemas
      const normalizedAlbums = albumsData.map((album: any) => ({
        AlbumId: album.AlbumId || album.albumid || album.ALBUMID || album.album_id,
        Title: album.Title || album.title || album.TITLE,
        ArtistId: album.ArtistId || album.artistid || album.ARTISTID || album.artist_id,
        ArtistName: album.ArtistName || album.artistname || album.ARTISTNAME || 'Unknown Artist'
      }));
      
      // If we have albums, apply any client-side filtering if needed
      if (normalizedAlbums.length > 0) {
        let enrichedAlbums = normalizedAlbums;
        
        // Filter by artist name if searching for an artist
        if (searchValue && !searchColumn) {
          // If no specific column is selected, check if this looks like an artist search
          const artistParam = searchParams.get('artist');
          if (artistParam) {
            // This is an artist filter from URL, filter albums by artist name
            enrichedAlbums = enrichedAlbums.filter((album: any) => 
              album.ArtistName?.toLowerCase().includes(searchValue.toLowerCase())
            );
            // Update total rows to reflect filtered count
            setTotalRows(enrichedAlbums.length);
          } else {
            // Regular search, use server-side filtering
            setTotalRows(data.totalRows || 0);
          }
        } else {
          setTotalRows(data.totalRows || 0);
        }
        
        setAlbums(enrichedAlbums);
      } else {
        setAlbums([]);
        setTotalRows(0);
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load albums');
      setAlbums([]);
    } finally {
      setLoading(false);
    }
  }, [activeConnection?.name, currentPage, limit, searchValue, searchColumn, exactMatch]);

  useEffect(() => {
    fetchAlbums();
  }, [fetchAlbums]);

  // Handle URL parameters for artist filtering
  useEffect(() => {
    const artistParam = searchParams.get('artist');
    if (artistParam) {
      setSearchValue(artistParam);
      setSearchColumn(''); // Search all columns initially
      setCurrentPage(1);
    }
  }, [searchParams]);

  // Trigger search when URL parameters change
  useEffect(() => {
    if (searchParams.get('artist')) {
      // Small delay to ensure state is updated
      setTimeout(() => {
        fetchAlbums();
      }, 100);
    }
  }, [searchParams, fetchAlbums]);

  // Cleanup body overflow on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleSearch = (value: string) => {
    setSearchValue(value);
    setCurrentPage(1); // Reset to first page when searching
    // Clear URL params when manually searching
    if (searchParams.get('artist')) {
      setSearchParams({});
    }
  };

  const clearArtistFilter = () => {
    setSearchValue('');
    setSearchColumn('');
    setSearchParams({});
    setCurrentPage(1);
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
  const columns = albums.length > 0 ? Object.keys(albums[0]) : [];

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Albums</h1>
          <p className="text-gray-600">Browse your music album collection</p>
        </div>
        
        <div className="card">
          <div className="card-body">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-800">
                <span className="font-semibold">Error loading albums:</span>
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
          <Disc3 className="w-8 h-8 text-purple-600" />
          Albums
          {searchParams.get('artist') && (
            <span className="text-lg text-gray-600">by {searchParams.get('artist')}</span>
          )}
        </h1>
        <p className="text-gray-600">Browse your music album collection</p>
        {searchParams.get('artist') && (
          <button
            onClick={clearArtistFilter}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Clear artist filter
          </button>
        )}
      </div>

      {/* Search and Controls */}
      <div className="card">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex items-center gap-2 flex-1">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search albums..."
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
            <>Showing <strong>{startRow}-{endRow}</strong> of <strong>{totalRows}</strong> albums</>
          ) : (
            'No albums found'
          )}
        </div>
      )}

      {/* Albums Table */}
      <div className="card">
        <div className="card-body p-0">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading albums...</p>
            </div>
          ) : albums.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No albums found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Album
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Artist
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {albums.map((album) => (
                    <tr 
                      key={album.AlbumId} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleViewDetails(album)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center">
                              <Disc3 className="w-5 h-5 text-purple-400" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900" title={album.Title}>
                              {album.Title}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="w-4 h-4 text-gray-400 mr-2" />
                          <div className="text-sm text-gray-900" title={album.ArtistName}>
                            {album.ArtistName || `Artist ${album.ArtistId}`}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">#{album.AlbumId}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(album);
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

      {/* Album Details Modal */}
      {showModal && selectedAlbum && (
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
                <Disc3 className="w-8 h-8 text-purple-600" />
                Album Details
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="px-6 py-6 space-y-6">
              {/* Album Header */}
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center">
                  <Disc3 className="w-8 h-8 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{selectedAlbum.Title}</h3>
                  <p className="text-gray-600 flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {selectedAlbum.ArtistName || `Artist ${selectedAlbum.ArtistId}`}
                  </p>
                  <p className="text-sm text-gray-500">Album #{selectedAlbum.AlbumId}</p>
                </div>
              </div>

              {/* Track List */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Music className="w-5 h-5" />
                  Tracks ({albumTracks.length})
                </h4>
                
                {albumTracks.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Track Name</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {albumTracks.map((track, index) => (
                          <tr key={track.TrackId || track.trackid || index} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-sm text-gray-500">{index + 1}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">
                              {track.Name || track.name || track.NAME || 'Unknown Track'}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {track.Milliseconds || track.milliseconds ? 
                                  formatDuration(track.Milliseconds || track.milliseconds) : 
                                  '-'
                                }
                              </div>
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-600">
                              ${Number(track.UnitPrice || track.unitprice || track.UNITPRICE || 0).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No tracks found for this album
                  </div>
                )}
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
                    // TODO: Add album to playlist or other actions
                    console.log('Add to playlist:', selectedAlbum);
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  Add to Playlist
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Albums;