import React, { useState, useEffect, useCallback } from 'react';
import { Search, Music, Clock, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface Track {
  TrackId: number;
  Name: string;
  AlbumId?: number;
  MediaTypeId?: number;
  GenreId?: number;
  Composer?: string;
  Milliseconds?: number;
  Bytes?: number;
  UnitPrice: number;
  AlbumTitle?: string;
  ArtistName?: string;
  GenreName?: string;
}

const Tracks: React.FC = () => {
  const { activeConnection } = useApp();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search and filter state
  const [searchValue, setSearchValue] = useState('');
  const [searchColumn, setSearchColumn] = useState('');
  const [exactMatch, setExactMatch] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [limit] = useState(100); // Match the API call limit

  const fetchTracks = useCallback(async () => {
    if (!activeConnection?.name) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        conn: activeConnection.name,
        limit: limit.toString(), // Use the same limit as pagination
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

      const response = await fetch(`http://localhost:3001/api/tracks?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch tracks`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Handle both API response formats
      let tracksData = [];
      let total = 0;
      
      if (data.tracks && Array.isArray(data.tracks)) {
        // New format with pagination info from /api/tracks
        tracksData = data.tracks;
        total = data.totalCount || data.tracks.length;
      } else if (Array.isArray(data)) {
        // Direct array from /api/tracks (legacy format)
        tracksData = data;
        total = data.length; // Note: this is only the current page count, not total
      } else if (data.rows) {
        // Object format from /api/table/Track
        tracksData = data.rows;
        total = data.totalRows || data.rows.length;
      }

      // Normalize track data to handle different database schemas
      const normalizedTracks = tracksData.map((track: any) => ({
        TrackId: track.TrackId || track.trackid || track.TRACKID || track.track_id,
        Name: track.Name || track.name || track.NAME,
        AlbumId: track.AlbumId || track.albumid || track.ALBUMID || track.album_id,
        ArtistId: track.ArtistId || track.artistid || track.ARTISTID || track.artist_id,
        GenreId: track.GenreId || track.genreid || track.GENREID || track.genre_id,
        Milliseconds: track.Milliseconds || track.milliseconds || track.MILLISECONDS,
        UnitPrice: track.UnitPrice || track.unitprice || track.UNITPRICE || 0,
        // From joined data if available (server provides this)
        ArtistName: track.ArtistName || track.artistname || track.ARTISTNAME || null,
        AlbumTitle: track.AlbumTitle || track.albumtitle || track.ALBUMTITLE || null,
        GenreName: track.GenreName || track.genrename || track.GENRENAME || null
      }));

      setTracks(normalizedTracks);
      setTotalRows(total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tracks');
      setTracks([]);
    } finally {
      setLoading(false);
    }
  }, [activeConnection?.name, currentPage, limit, searchValue, searchColumn, exactMatch]);

  useEffect(() => {
    fetchTracks();
  }, [fetchTracks]);

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

  const formatDuration = (milliseconds?: number) => {
    if (!milliseconds) return 'N/A';
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const totalPages = Math.ceil(totalRows / limit);
  const startRow = (currentPage - 1) * limit + 1;
  const endRow = Math.min(currentPage * limit, totalRows);

  // Get unique column names for filter dropdown
  const columns = tracks.length > 0 ? Object.keys(tracks[0]) : [];

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tracks</h1>
          <p className="text-gray-600">Browse your music track library</p>
        </div>
        
        <div className="card">
          <div className="card-body">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-800">
                <span className="font-semibold">Error loading tracks:</span>
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
          <Music className="w-8 h-8 text-blue-600" />
          Tracks
        </h1>
        <p className="text-gray-600">Browse your music track library</p>
      </div>

      {/* Search and Controls */}
      <div className="card">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex items-center gap-2 flex-1">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search tracks..."
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
            <>Showing <strong>{startRow}-{endRow}</strong> of <strong>{totalRows}</strong> tracks</>
          ) : (
            'No tracks found'
          )}
        </div>
      )}

      {/* Tracks Table */}
      <div className="card">
        <div className="card-body p-0">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading tracks...</p>
            </div>
          ) : tracks.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No tracks found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/5">
                      Track
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                      Artist
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                      Duration
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                      Price
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                      Play
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tracks.map((track) => (
                    <tr key={track.TrackId} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                            <Music className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium text-gray-900 truncate" title={track.Name}>
                              {track.Name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {track.AlbumTitle ? track.AlbumTitle : `ID #${track.TrackId}`}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900 truncate" title={track.ArtistName || 'Unknown Artist'}>
                          {track.ArtistName || 'Unknown Artist'}
                        </div>
                        {track.GenreName && track.GenreName !== 'Unknown' && (
                          <div className="text-xs text-gray-500">{track.GenreName}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {formatDuration(track.Milliseconds)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-semibold text-green-700">
                          {formatCurrency(track.UnitPrice)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50"
                          title="Play preview"
                        >
                          <Play className="w-4 h-4" />
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
    </div>
  );
};

export default Tracks;