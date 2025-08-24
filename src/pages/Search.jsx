import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import SearchBar from '../components/search/SearchBar';
import PaginatedGridContainer from '../components/layout/PaginatedGridContainer';
import SmallMovieCard from '../components/ui/movies/SmallMovieCard';
import SearchTypesList from '../components/search/SearchTypesList';
import { MovieService } from '../services/movieService';

const Search = () => {
  const location = useLocation();
  
  // Enhanced filters that match movieService search parameters
  const movieFilters = [
    {
      key: 'genres',
      label: 'Genres',
      type: 'multiselect',
      options: [
        { value: 'War', label: 'War' },
        { value: 'Science Fiction', label: 'Science Fiction' },
        { value: 'Animation', label: 'Animation' },
        { value: 'Action', label: 'Action' },
        { value: 'Music', label: 'Music' },
        { value: 'Crime', label: 'Crime' },
        { value: 'Documentary', label: 'Documentary' },
        { value: 'Thriller', label: 'Thriller' },
        { value: 'Western', label: 'Western' },
        { value: 'Adventure', label: 'Adventure' },
        { value: 'Mystery', label: 'Mystery' },
        { value: 'Family', label: 'Family' },
        { value: 'TV Movie', label: 'TV Movie' },
        { value: 'Horror', label: 'Horror' },
        { value: 'Drama', label: 'Drama' },
        { value: 'Comedy', label: 'Comedy' },
        { value: 'History', label: 'History' },
        { value: 'Romance', label: 'Romance' },
        { value: 'Fantasy', label: 'Fantasy' }
      ],
      defaultValue: []
    },
    {
      key: 'year',
      label: 'Release Year',
      type: 'range',
      min: 1950,
      max: 2025,
      defaultValue: [1950, 2025]
    },
    {
      key: 'rating',
      label: 'Rating Range',
      type: 'range',
      min: 0,
      max: 10,
      step: 0.5,
      defaultValue: [0, 10]
    },
    {
      key: 'director',
      label: 'Director',
      type: 'text',
      placeholder: 'Enter director name...'
    },
    {
      key: 'actor',
      label: 'Actor',
      type: 'text',
      placeholder: 'Enter actor name...'
    },
    {
      key: 'keyword',
      label: 'Keyword',
      type: 'dynamicsearch',
      searchType: 'keyword',
      placeholder: 'Search for keywords',
      defaultValue: []
    },
    {
      key: 'country',
      label: 'Country',
      type: 'dynamicsearch',
      searchType: 'country',
      placeholder: 'Search for countries',
      defaultValue: null
    },
    {
      key: 'language',
      label: 'Language',
      type: 'text',
      placeholder: 'Enter language...'
    },
    {
      key: 'sortBy',
      label: 'Sort By',
      type: 'select',
      placeholder: 'Sort by...',
      options: [
        { value: 'title', label: 'Title' },
        { value: 'rating', label: 'Rating' },
        { value: 'releasedate', label: 'Release Date' },
        { value: 'revenue', label: 'Revenue' }
      ]
    },
    {
      key: 'sortDescending',
      label: 'Sort Order',
      type: 'select',
      placeholder: 'Sort order...',
      options: [
        { value: true, label: 'Descending (High to Low)' },
        { value: false, label: 'Ascending (Low to High)' }
      ],
      defaultValue: true
    }
  ];

  const [searchQuery, setSearchQuery] = useState('');
  const [filterValues, setFilterValues] = useState({
    genres: [],
    year: [1950, 2025],
    rating: [0, 10],
    director: '',
    actor: '',
    keyword: [],
    country: null,
    language: '',
    sortBy: '',
    sortDescending: true
  });

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isManualSearch, setIsManualSearch] = useState(false);
  const [lastSearchSource, setLastSearchSource] = useState(null); // 'manual', 'restore', 'prefill'

  // Handle pre-filled filters from navigation state
  useEffect(() => {
    if (location.state?.prefillFilters) {
      const prefillFilters = location.state.prefillFilters;
      console.log('Applying pre-filled filters:', prefillFilters);
      
      setIsRestoring(true);
      
      // Update filter values with pre-filled data
      const newFilterValues = { ...filterValues };
      
      if (prefillFilters.actor) {
        newFilterValues.actor = prefillFilters.actor;
      }
      if (prefillFilters.director) {
        newFilterValues.director = prefillFilters.director;
      }
      if (prefillFilters.keyword) {
        // Handle both string and array formats for backward compatibility
        if (Array.isArray(prefillFilters.keyword)) {
          newFilterValues.keyword = prefillFilters.keyword;
        } else {
          // Convert string to array format for the new dynamic search filter
          newFilterValues.keyword = [{ id: 'prefilled', name: prefillFilters.keyword, description: `Keyword: ${prefillFilters.keyword}` }];
        }
      }
      if (prefillFilters.country) {
        // Handle both string and array formats for backward compatibility
        if (Array.isArray(prefillFilters.country)) {
          // Take the first country if it's an array
          newFilterValues.country = prefillFilters.country[0] || null;
        } else {
          // Convert string to single country object format
          newFilterValues.country = { id: 'prefilled', name: prefillFilters.country, description: `Country: ${prefillFilters.country}` };
        }
      }
      if (prefillFilters.genres) {
        newFilterValues.genres = prefillFilters.genres;
      }
      if (prefillFilters.sortBy) {
        newFilterValues.sortBy = prefillFilters.sortBy;
      }
      if (prefillFilters.sortDescending !== undefined) {
        newFilterValues.sortDescending = prefillFilters.sortDescending;
      }
      if (prefillFilters.productionCompany) {
        // For production company, we'll use the search query since it's not a standard filter
        setSearchQuery(prefillFilters.productionCompany);
      }
      
      setFilterValues(newFilterValues);
      
      // Clear the navigation state to prevent re-applying on re-renders
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Check if there are any active filters
  const hasActiveFilters = useCallback(() => {
    return Object.entries(filterValues).some(([key, value]) => {
      if (key === 'sortDescending') {
        // sortDescending is considered active if it's different from default (true)
        // But we need to handle the case where it might be explicitly set to true
        const defaultValue = movieFilters.find(f => f.key === 'sortDescending')?.defaultValue;
        return value !== defaultValue;
      }
      
      if (key === 'sortBy') {
        // sortBy is considered active if it has a non-empty string value
        return value && value !== '';
      }
      
      if (Array.isArray(value)) {
        if (value.length === 2) {
          // For range filters, check if they're not at default values
          if (value[0] === 1950 && value[1] === 2025) return false; // year
          if (value[0] === 0 && value[1] === 10) return false; // rating
          return true;
        }
        return value.length > 0;
      }
      // Handle country as single object
      if (key === 'country') {
        console.log('Checking country filter:', value, 'Is active:', value !== null);
        return value !== null;
      }
      return value && value !== '';
    });
  }, [filterValues, movieFilters]);

  // Search movies using movieService
  const searchMovies = useCallback(async (page = 1, source = 'unknown') => {
    const hasActive = hasActiveFilters();
    console.log('🔍 Search triggered with:', { searchQuery, hasActiveFilters: hasActive, page, isManualSearch, source });
    console.log('Current filter values:', filterValues);
    
    if (!searchQuery.trim() && !hasActive) {
      console.log('No search query and no active filters, clearing results');
      setMovies([]);
      setTotalResults(0);
      setTotalPages(1);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Debug: Log the current filter values before preparing search params
      console.log('Current filter values before preparing search params:', filterValues);
      console.log('Country filter value specifically:', filterValues.country);
      
      // Prepare search parameters for movieService
      const searchParams = {
        page: page,
        pageSize: 20, // Show 20 movies per page
        title: searchQuery.trim() || null,
        genres: filterValues.genres.length > 0 ? filterValues.genres : null,
        actor: filterValues.actor || null,
        director: filterValues.director || null,
        keyword: filterValues.keyword && filterValues.keyword.length > 0 ? filterValues.keyword.map(k => k.name) : null,
        year: filterValues.year[1] !== 2025 ? filterValues.year[1] : null, // Use max year if not default
        minRating: filterValues.rating[0] !== 0 ? filterValues.rating[0] : null,
        maxRating: filterValues.rating[1] !== 10 ? filterValues.rating[1] : null,
        country: filterValues.country ? filterValues.country.name : null,
        language: filterValues.language || null,
        sortBy: filterValues.sortBy || null,
        sortDescending: filterValues.sortDescending
      };

      // Remove null values
      Object.keys(searchParams).forEach(key => {
        if (searchParams[key] === null || searchParams[key] === '') {
          delete searchParams[key];
        }
      });

      // Debug: Log the final search parameters being sent
      console.log('Final search parameters being sent:', searchParams);
      if (searchParams.hasOwnProperty('sortDescending')) {
        console.log('Sort descending being sent to API:', searchParams.sortDescending, 'Type:', typeof searchParams.sortDescending);
      }
      if (searchParams.hasOwnProperty('country')) {
        console.log('Country being sent to API:', searchParams.country, 'Type:', typeof searchParams.country);
        console.log('Original country filter value:', filterValues.country);
      }
      if (searchParams.hasOwnProperty('keyword')) {
        console.log('Keywords being sent to API:', searchParams.keyword, 'Type:', typeof searchParams.keyword);
        console.log('Original keyword filter value:', filterValues.keyword);
      }

      const response = await MovieService.searchMovies(searchParams);
      
      // Debug logging to see the actual response structure
      console.log('Search API Response:', response);
      console.log('Search Parameters:', searchParams);
      
      if (response && response.data) {
        setMovies(response.data);
        setTotalResults(response.totalCount || response.data.length);
        setTotalPages(response.totalPages || Math.ceil((response.totalCount || response.data.length) / 20));
        setCurrentPage(page);
        setHasSearched(true); // Set to true after successful search
      } else {
        console.log('No data in response or response is empty');
        setMovies([]);
        setTotalResults(0);
        setTotalPages(1);
        setHasSearched(false); // Reset to false if no data
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message);
      setMovies([]);
      setTotalResults(0);
      setTotalPages(1);
      setHasSearched(false); // Reset to false on error
    } finally {
      setLoading(false);
      // Reset manual search flag after search completes
      setIsManualSearch(false);
    }
  }, [searchQuery, filterValues]);

  // Handle restoring search state when coming back from movie details
  useEffect(() => {
    if (location.state?.restoreSearch) {
      const restoreData = location.state.restoreSearch;
      console.log('Restoring search state:', restoreData);
      
      setIsRestoring(true);
      
      // Restore all search state
      setSearchQuery(restoreData.searchQuery || '');
      setFilterValues(restoreData.filterValues || filterValues);
      setCurrentPage(restoreData.currentPage || 1);
      setTotalPages(restoreData.totalPages || 1);
      setTotalResults(restoreData.totalResults || 0);
      setHasSearched(restoreData.hasSearched || false);
      
      console.log('State restored, will trigger auto-restore effect');
      
      // Clear the navigation state to prevent re-applying on re-renders
      window.history.replaceState({}, document.title);
      
      // Clean up stored search context from sessionStorage
      sessionStorage.removeItem('lastSearchContext');
      
      // Reset the flag after a short delay to allow state updates to complete
      setTimeout(() => {
        setIsRestoring(false);
      }, 200);
    }
  }, [location.state]);

  // Auto-restore search results when state is restored
  useEffect(() => {
    // Don't run if we're in the process of restoring from pre-filled filters
    if (isRestoring) {
      console.log('⏭️ Skipping auto-restore - currently restoring from pre-filled filters');
      return;
    }
    
    // Don't run if this was a manual search (to prevent duplicate API calls)
    if (isManualSearch) {
      console.log('⏭️ Skipping auto-restore - this was a manual search');
      return;
    }
    
    // Don't run if the last search was manual or prefill (to prevent duplicate API calls)
    if (lastSearchSource === 'manual' || lastSearchSource === 'prefill') {
      console.log('⏭️ Skipping auto-restore - last search was:', lastSearchSource);
      return;
    }
    
    console.log('🔄 Auto-restore effect triggered:', { hasSearched, searchQuery, hasActiveFilters: hasActiveFilters() });
    if (hasSearched && (searchQuery.trim() || hasActiveFilters())) {
      console.log('🔄 Restoring search results for page:', currentPage);
      // Small delay to ensure all state is updated
      const timer = setTimeout(() => {
        setLastSearchSource('restore');
        searchMovies(currentPage, 'restore');
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [hasSearched, searchQuery, currentPage, isRestoring, isManualSearch, lastSearchSource, searchMovies]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      // If user navigates back and there's no state, clear search results
      if (!location.state) {
        setMovies([]);
        setTotalResults(0);
        setTotalPages(1);
        setHasSearched(false);
        setCurrentPage(1);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [location.state]);

  // Debug: Log initial filter values
  useEffect(() => {
    console.log('Search component mounted with filter values:', filterValues);
  }, []);

  // Auto-trigger search when filters are pre-filled
  useEffect(() => {
    if (location.state?.prefillFilters) {
      // Small delay to ensure state is updated
      const timer = setTimeout(async () => {
        setIsManualSearch(true); // Set flag to prevent auto-restore from running
        setLastSearchSource('prefill');
        await searchMovies(1, 'prefill');
        setIsRestoring(false); // Reset the flag after search is complete
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [location.state?.prefillFilters, searchMovies]);

  // Handle search query changes (just update state, don't search yet)
  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page
    setHasSearched(false); // Reset search flag when search query changes
    setIsManualSearch(false); // Reset manual search flag when search query changes
    setLastSearchSource(null); // Reset search source when search query changes
  };

  // Handle filter changes (just update state, don't search yet)
  const handleFiltersChange = (filters) => {
    console.log('Filter values changed:', filters);
    if (filters.hasOwnProperty('sortDescending')) {
      console.log('Sort descending changed to:', filters.sortDescending, 'Type:', typeof filters.sortDescending);
    }
    if (filters.hasOwnProperty('country')) {
      console.log('Country changed to:', filters.country, 'Type:', typeof filters.country);
      if (filters.country) {
        console.log('Country details:', { id: filters.country.id, name: filters.country.name });
      } else {
        console.log('Country is null/undefined');
      }
    }
    if (filters.hasOwnProperty('keyword')) {
      console.log('Keywords changed to:', filters.keyword, 'Type:', typeof filters.keyword);
    }
    setFilterValues(filters);
    setCurrentPage(1); // Reset to first page
    setHasSearched(false); // Reset search flag when filters change
    setIsManualSearch(false); // Reset manual search flag when filters change
    setLastSearchSource(null); // Reset search source when filters change
  };

  // Handle explicit search button press
  const handleSearchButtonPress = () => {
    setIsManualSearch(true);
    setLastSearchSource('manual');
    searchMovies(1, 'manual');
  };

  // Handle page changes
  const handlePageChange = (page) => {
    setCurrentPage(page);
    setIsManualSearch(true);
    setLastSearchSource('manual');
    searchMovies(page, 'manual');
  };

  // Handle item selection (navigation to movie details)
  const onItemSelect = (movie) => {
    console.log("Selected movie:", movie);
    // Navigation is handled by SmallMovieCard component
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Search Movies</h1>
      <div className="flex gap-8">
        {/* Left column - Search and Results */}
        <div className="flex-1">
          <SearchBar
            filters={movieFilters}
            filterValues={filterValues}
            handleSearch={handleSearch}
            handleFiltersChange={handleFiltersChange}
            onSearchButtonPress={handleSearchButtonPress}
            searchValue={searchQuery}
          />

          {/* Loading State */}
          {loading && (
            <div className="mt-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
              <p className="mt-4 text-gray-400">Searching movies...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="mt-8 p-4 bg-red-900 border border-red-700 rounded-lg">
              <p className="text-red-200">Error: {error}</p>
            </div>
          )}

          {/* Results Container */}
          {!loading && !error && (
            <>
              {/* Results Count - Show when there's a search query or active filters */}
              {hasSearched && (searchQuery.trim() || hasActiveFilters()) && (
                <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
                  <div className="text-gray-300">
                    {movies.length > 0 ? (
                      <>
                        <span className="font-semibold text-green-400">
                          Found {totalResults} movie{totalResults !== 1 ? 's' : ''}
                        </span>
                        {searchQuery.trim() && (
                          <span className="text-gray-400 ml-2">
                            for "{searchQuery.trim()}""
                          </span>
                        )}
                        {hasActiveFilters() && (
                          <span className="text-gray-400 ml-2">
                            with applied filters
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-gray-400">
                        No movies found
                        {searchQuery.trim() && ` for "${searchQuery.trim()}"`}
                        {hasActiveFilters() && ' with current filters'}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* No Results Message */}
              {movies.length === 0 && hasSearched && (
                <div className="mt-8 text-center text-gray-400">
                  <div className="text-6xl mb-4">🔍</div>
                  <p className="text-lg mb-2">No movies found matching your criteria</p>
                  <p className="text-sm text-gray-500">
                    Try adjusting your search terms or filters
                  </p>
                </div>
              )}

              {/* Movies Grid */}
              {movies.length > 0 && (
                <div className="mt-8">
                  <PaginatedGridContainer
                    items={movies}
                    itemsPerRow={5}
                    rows={4}
                    renderItem={(movie) => (
                      <SmallMovieCard 
                        movie={movie} 
                        searchContext={{
                          searchQuery,
                          filterValues,
                          currentPage,
                          totalPages,
                          totalResults,
                          hasSearched
                        }}
                      />
                    )}
                    itemHeight="h-64"
                    gap="gap-6"
                    itemWidth="w-40"
                    useExternalPagination={true}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}

              {/* Initial State - No Search Yet */}
              {movies.length === 0 && !searchQuery.trim() && !hasActiveFilters() && !hasSearched && (
                <div className="mt-8 text-center text-gray-400">
                  <div className="text-6xl mb-4">🎬</div>
                  <p className="text-lg mb-2">Ready to search for movies?</p>
                  <p className="text-sm text-gray-500">
                    Enter a search term or use filters, then click Search to find movies
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Right column - Search Types */}
        <div className="w-1/4">
          <SearchTypesList onItemSelect={onItemSelect} />
        </div>
      </div>
    </div>
  );
};

export default Search;