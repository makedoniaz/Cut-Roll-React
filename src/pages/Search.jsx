import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import SearchBar from '../components/search/SearchBar';
import PaginatedGridContainer from '../components/layout/PaginatedGridContainer';
import SmallMovieCard from '../components/ui/movies/SmallMovieCard';
import { MovieService } from '../services/movieService';
import { Filter, X } from 'lucide-react';
import RangeFilter from '../components/search/filters/RangeFilter';
import MultiSelectFilter from '../components/search/filters/MultiSelectFilter';
import SelectFilter from '../components/search/filters/SelectFilter';
import DynamicSearchFilter from '../components/search/filters/DynamicSearchFilter';

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
      key: 'director',
      label: 'Crew member',
      type: 'dynamicsearch',
      searchType: 'director',
      placeholder: 'Search for crew members',
      defaultValue: null
    },
    {
      key: 'actor',
      label: 'Actor',
      type: 'dynamicsearch',
      searchType: 'actor',
      placeholder: 'Search for actors',
      defaultValue: null
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
      type: 'dynamicsearch',
      searchType: 'language',
      placeholder: 'Search for languages',
      defaultValue: null
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
    actor: null,
    keyword: [],
    country: null,
    language: null,
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
  const [isFiltersSidebarOpen, setIsFiltersSidebarOpen] = useState(false);

  // Handle pre-filled filters from navigation state
  useEffect(() => {
    if (location.state?.prefillFilters) {
      const prefillFilters = location.state.prefillFilters;
      console.log('Applying pre-filled filters:', prefillFilters);
      
      setIsRestoring(true);
      
      // Update filter values with pre-filled data
      const newFilterValues = { ...filterValues };
      
      if (prefillFilters.actor) {
        // Handle both string and array formats for backward compatibility
        if (Array.isArray(prefillFilters.actor)) {
          // Take the first actor if it's an array
          newFilterValues.actor = prefillFilters.actor[0] || null;
        } else {
          // Convert string to single actor object format
          newFilterValues.actor = { id: 'prefilled', name: prefillFilters.actor, description: `Actor: ${prefillFilters.actor}` };
        }
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
      if (prefillFilters.language) {
        // Handle both string and array formats for backward compatibility
        if (Array.isArray(prefillFilters.language)) {
          // Take the first language if it's an array
          newFilterValues.language = prefillFilters.language[0] || null;
        } else {
          // Convert string to single language object format
          newFilterValues.language = { id: 'prefilled', name: prefillFilters.language, description: `Language: ${prefillFilters.language}` };
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
      // Handle country, language, and actor as single objects
      if (key === 'country' || key === 'language' || key === 'actor') {
        console.log(`Checking ${key} filter:`, value, 'Is active:', value !== null);
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
        pageSize: 28, // Show 28 movies per page
        title: searchQuery.trim() || null,
        genres: filterValues.genres.length > 0 ? filterValues.genres : null,
        actor: filterValues.actor ? filterValues.actor.name : null,
        director: filterValues.director ? filterValues.director.name : null,
        keyword: filterValues.keyword && filterValues.keyword.length > 0 ? filterValues.keyword.map(k => k.name) : null,
        year: filterValues.year[1] !== 2025 ? filterValues.year[1] : null, // Use max year if not default
        minRating: filterValues.rating[0] !== 0 ? filterValues.rating[0] : null,
        maxRating: filterValues.rating[1] !== 10 ? filterValues.rating[1] : null,
        country: filterValues.country ? filterValues.country.name : null,
        language: filterValues.language ? (filterValues.language.englishName || filterValues.language.name) : null,
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
      if (searchParams.hasOwnProperty('language')) {
        console.log('Language being sent to API:', searchParams.language, 'Type:', typeof searchParams.language);
        console.log('Original language filter value:', filterValues.language);
      }
      if (searchParams.hasOwnProperty('actor')) {
        console.log('Actor being sent to API:', searchParams.actor, 'Type:', typeof searchParams.actor);
        console.log('Original actor filter value:', filterValues.actor);
      }
      if (searchParams.hasOwnProperty('keyword')) {
        console.log('Keywords being sent to API:', searchParams.keyword, 'Type:', typeof searchParams.keyword);
        console.log('Original keyword filter value:', filterValues.keyword);
      }
      if (searchParams.hasOwnProperty('director')) {
        console.log('Director being sent to API:', searchParams.director, 'Type:', typeof searchParams.director);
        console.log('Original director filter value:', filterValues.director);
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
    if (filters.hasOwnProperty('language')) {
      console.log('Language changed to:', filters.language, 'Type:', typeof filters.language);
      if (filters.language) {
        console.log('Language details:', { id: filters.language.id, name: filters.language.englishName || filters.language.name });
      } else {
        console.log('Language is null/undefined');
      }
    }
    if (filters.hasOwnProperty('actor')) {
      console.log('Actor changed to:', filters.actor, 'Type:', typeof filters.actor);
      if (filters.actor) {
        console.log('Actor details:', { id: filters.actor.id, name: filters.actor.name });
      } else {
        console.log('Actor is null/undefined');
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

  // Disable body scroll when sidebar is open
  useEffect(() => {
    if (isFiltersSidebarOpen) {
      // Disable scrolling on the main page
      document.body.style.overflow = 'hidden';
    } else {
      // Re-enable scrolling on the main page
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to restore scrolling when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isFiltersSidebarOpen]);

  return (
    <div className="relative">
      <h1 className="text-3xl font-bold mb-8">Search Movies</h1>
      
      {/* Main Content with Dimming Effect */}
      <div className={`transition-all duration-300 ${isFiltersSidebarOpen ? 'opacity-70' : 'opacity-100'}`}>
        {/* Search Bar and Filter Button Row */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1">
            <SearchBar
              filters={[]}
              filterValues={filterValues}
              handleSearch={handleSearch}
              handleFiltersChange={handleFiltersChange}
              onSearchButtonPress={handleSearchButtonPress}
              searchValue={searchQuery}
              showFilters={false}
            />
          </div>
          <button
            onClick={() => setIsFiltersSidebarOpen(!isFiltersSidebarOpen)}
            className="cursor-pointer flex items-center space-x-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors text-white whitespace-nowrap"
          >
            <Filter className="w-4 h-4" />
            <span>{isFiltersSidebarOpen ? 'Hide' : 'Show'} Filters</span>
          </button>
        </div>

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
                  itemsPerRow={7}
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

      {/* Overlay Sidebar */}
      <>
        {/* Backdrop */}
        <div 
          className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${
            isFiltersSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setIsFiltersSidebarOpen(false)}
        />
        
        {/* Sidebar */}
        <div className={`fixed top-0 right-0 h-full w-[500px] bg-gray-900 border-l border-gray-700 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isFiltersSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Filters</h3>
                <button
                  onClick={() => setIsFiltersSidebarOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Filters Content - Scrollable */}
            <div className="flex-1 p-6 overflow-y-auto">
              {/* Individual Filters */}
              <div className="space-y-6">
                {movieFilters.map((filter) => {
                  let value;
                  if (filter.type === 'select' && filter.defaultValue !== undefined) {
                    value = filterValues.hasOwnProperty(filter.key) ? filterValues[filter.key] : filter.defaultValue;
                  } else if (filter.type === 'dynamicsearch') {
                    if (filter.searchType === 'country' || filter.searchType === 'language' || filter.searchType === 'actor') {
                      value = filterValues[filter.key] || filter.defaultValue || null;
                    } else {
                      value = filterValues[filter.key] || filter.defaultValue || [];
                    }
                  } else {
                    value = filterValues[filter.key] || filter.defaultValue || (filter.type === 'multiselect' ? [] : filter.type === 'range' ? [filter.min || 0, filter.max || 100] : '');
                  }

                  const commonProps = {
                    label: filter.label,
                    value: value,
                    onChange: (value) => {
                      const newFilterValues = { ...filterValues, [filter.key]: value };
                      setFilterValues(newFilterValues);
                    }
                  };

                  let filterComponent;
                  switch (filter.type) {
                    case 'text':
                      filterComponent = (
                        <div key={filter.key} className="space-y-2">
                          <label className="block text-sm font-medium text-gray-300">{filter.label}</label>
                          <input
                            type="text"
                            placeholder={filter.placeholder}
                            value={value}
                            onChange={(e) => {
                              const newFilterValues = { ...filterValues, [filter.key]: e.target.value };
                              setFilterValues(newFilterValues);
                            }}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-green-500 text-white placeholder-gray-400"
                          />
                        </div>
                      );
                      break;
                    case 'select':
                      filterComponent = (
                        <SelectFilter
                          key={filter.key}
                          label={filter.label}
                          value={value}
                          onChange={(newValue) => {
                            const newFilterValues = { ...filterValues, [filter.key]: newValue };
                            setFilterValues(newFilterValues);
                          }}
                          options={filter.options}
                          placeholder={filter.placeholder}
                        />
                      );
                      break;
                    case 'range':
                      filterComponent = (
                        <RangeFilter
                          key={filter.key}
                          label={filter.label}
                          value={value}
                          onChange={(newValue) => {
                            const newFilterValues = { ...filterValues, [filter.key]: newValue };
                            setFilterValues(newFilterValues);
                          }}
                          min={filter.min}
                          max={filter.max}
                          step={filter.step}
                        />
                      );
                      break;
                    case 'multiselect':
                      filterComponent = (
                        <MultiSelectFilter
                          key={filter.key}
                          label={filter.label}
                          value={value}
                          onChange={(newValue) => {
                            const newFilterValues = { ...filterValues, [filter.key]: newValue };
                            setFilterValues(newFilterValues);
                          }}
                          options={filter.options}
                        />
                      );
                      break;
                    case 'dynamicsearch':
                      filterComponent = (
                        <DynamicSearchFilter
                          key={filter.key}
                          label={filter.label}
                          value={value}
                          onChange={(newValue) => {
                            const newFilterValues = { ...filterValues, [filter.key]: newValue };
                            setFilterValues(newFilterValues);
                          }}
                          placeholder={filter.placeholder}
                          type={filter.searchType}
                        />
                      );
                      break;
                    default:
                      filterComponent = null;
                  }
                  return filterComponent;
                })}
              </div>
            </div>
            
            {/* Footer with Clear Button - Static Position */}
            <div className="p-6 border-t border-gray-700">
              <button
                onClick={() => {
                  const clearedFilters = {};
                  movieFilters.forEach(filter => {
                    switch (filter.type) {
                      case 'multiselect':
                        clearedFilters[filter.key] = filter.defaultValue || [];
                        break;
                      case 'dynamicsearch':
                        if (filter.searchType === 'country' || filter.searchType === 'language' || filter.searchType === 'actor') {
                          clearedFilters[filter.key] = filter.defaultValue || null;
                        } else {
                          clearedFilters[filter.key] = filter.defaultValue || [];
                        }
                        break;
                      case 'range':
                        clearedFilters[filter.key] = filter.defaultValue || [filter.min || 0, filter.max || 100];
                        break;
                      case 'select':
                        if (filter.defaultValue !== undefined) {
                          clearedFilters[filter.key] = filter.defaultValue;
                        } else {
                          clearedFilters[filter.key] = '';
                        }
                        break;
                      default:
                        clearedFilters[filter.key] = filter.defaultValue || '';
                    }
                  });
                  setFilterValues(clearedFilters);
                }}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-gray-300 hover:text-white transition-colors border border-gray-600 rounded-lg hover:border-gray-500 bg-gray-800 hover:bg-gray-700"
              >
                <X className="w-4 h-4" />
                <span>Clear All Filters</span>
              </button>
            </div>
          </div>
        </div>
      </>
    </div>
  );
};

export default Search;