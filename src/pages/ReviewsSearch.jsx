import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import PaginatedGridContainer from '../components/layout/PaginatedGridContainer';
import ReviewCard from '../components/ui/reviews/ReviewCard';
import { ReviewService } from '../services/reviewService';
import { REVIEW_SORT_BY } from '../constants/review';
import { Filter, X, Search as SearchIcon } from 'lucide-react';
import RangeFilter from '../components/search/filters/RangeFilter';
import SelectFilter from '../components/search/filters/SelectFilter';
import DateRangeFilter from '../components/search/filters/DateRangeFilter';
import FlexibleSearchInput from '../components/ui/common/FlexibleSearchInput';

const ReviewsSearch = () => {
  const location = useLocation();
  
  // State management
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [hasSearched, setHasSearched] = useState(false);
  const [isFiltersSidebarOpen, setIsFiltersSidebarOpen] = useState(false);
  const hasAutoSearched = useRef(false);

  // Search wrapper functions for FlexibleSearchInput
  const searchMoviesForReviews = useCallback(async (query) => {
    try {
      const response = await ReviewService.searchReviewMovies({
        title: query,
        pageSize: 10,
        page: 1,
      });
      
      // Transform to expected format for FlexibleSearchInput
      const movies = response.items || response.data || response.movies || [];
      return movies.map(movie => ({
        id: movie.movieId || movie.id,
        title: movie.title,
        name: movie.title, // FlexibleSearchInput uses 'name' for display
        description: `Movie`,
        image: movie.poster?.filePath ? `https://image.tmdb.org/t/p/w92${movie.poster.filePath}` : null,
        ...movie
      }));
    } catch (error) {
      console.error('Movie search error:', error);
      return [];
    }
  }, []);

  const searchUsersForReviews = useCallback(async (query) => {
    try {
      const response = await ReviewService.searchReviewUsers({
        searchTerm: query,
        pageSize: 10
      });
      
      // Transform to expected format for FlexibleSearchInput
      const users = response.items || response.data || response.users || [];
      return users.map(user => ({
        id: user.id || user.userId,
        name: user.username || user.name,
        title: user.username || user.name, // Fallback for display
        description: `${user.email ? user.email + ' - ' : ''}User`,
        ...user
      }));
    } catch (error) {
      console.error('User search error:', error);
      return [];
    }
  }, []);


  // Enhanced filters for reviews
  const reviewFilters = [
    {
      key: 'movie',
      label: 'Movie',
      type: 'flexiblesearch',
      placeholder: 'Search for movies...',
      searchFunction: searchMoviesForReviews,
      defaultValue: null
    },
    {
      key: 'sortBy',
      label: 'Sort By',
      type: 'select',
      placeholder: 'Sort by...',
      options: [
        { value: '', label: 'Sort By' },
        { value: '0', label: 'Created Date' },
        { value: '1', label: 'Rating' },
        { value: '2', label: 'Likes' }
      ],
      defaultValue: ''
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
    },
    {
      key: 'user',
      label: 'User',
      type: 'flexiblesearch',
      placeholder: 'Search for users...',
      searchFunction: searchUsersForReviews,
      defaultValue: null
    },
    {
      key: 'rating',
      label: 'Rating Range',
      type: 'range',
      min: 0,
      max: 5,
      step: 0.5,
      defaultValue: [0, 5]
    },
    {
      key: 'dateRange',
      label: 'Date Range',
      type: 'daterange',
      defaultValue: { from: null, to: null }
    }
  ];

  // Initialize filter values
  const getInitialFilterValues = () => {
    const initial = {};
    reviewFilters.forEach(filter => {
      initial[filter.key] = filter.defaultValue;
    });
    return initial;
  };

  const [filterValues, setFilterValues] = useState(getInitialFilterValues());

  // Check if there are any active filters
  const hasActiveFilters = useCallback(() => {
    return Object.entries(filterValues).some(([key, value]) => {
      const filter = reviewFilters.find(f => f.key === key);
      if (!filter) return false;
      
      if (filter.type === 'flexiblesearch') {
        return value !== null && value !== undefined;
      }
      if (filter.type === 'range') {
        return value[0] !== filter.defaultValue[0] || value[1] !== filter.defaultValue[1];
      }
      if (filter.type === 'daterange') {
        return value.from !== null || value.to !== null;
      }
      if (filter.type === 'select') {
        return value !== filter.defaultValue;
      }
      return false;
    });
  }, [filterValues]);

  // Search function
  const searchReviews = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);

    try {
      // Prepare search parameters
      const searchParams = {
        page: page,
        pageSize: 20, // Show 20 reviews per page
      };

      // Add filter parameters only if they're selected
      if (filterValues.user) {
        searchParams.userId = filterValues.user.id;
      }
      
      if (filterValues.movie) {
        searchParams.movieId = filterValues.movie.id;
      }
      
      // Handle rating range
      if (filterValues.rating[0] > 0) {
        searchParams.minRating = filterValues.rating[0];
      }
      if (filterValues.rating[1] < 5) {
        searchParams.maxRating = filterValues.rating[1];
      }
      
      // Handle date range filter
      if (filterValues.dateRange?.from) {
        searchParams.createdAfter = new Date(filterValues.dateRange.from).toISOString();
      }
      if (filterValues.dateRange?.to) {
        searchParams.createdBefore = new Date(filterValues.dateRange.to).toISOString();
      }
      
      // Handle sort parameters
      if (filterValues.sortBy !== '' && filterValues.sortBy !== null && filterValues.sortBy !== undefined) {
        searchParams.sortBy = parseInt(filterValues.sortBy);
        console.log('Sort by value:', filterValues.sortBy, 'Parsed:', parseInt(filterValues.sortBy));
      }
      if (filterValues.sortDescending !== true) {
        searchParams.sortDescending = filterValues.sortDescending;
      }

      const response = await ReviewService.searchReview(searchParams);
      
      if (response && (response.items || response.data || response.reviews)) {
        const reviewsData = response.items || response.data || response.reviews || [];
        setReviews(reviewsData);
        setTotalResults(response.totalCount || response.total || reviewsData.length);
        setTotalPages(response.totalPages || Math.ceil((response.totalCount || response.total || reviewsData.length) / 20));
        setCurrentPage(page);
        setHasSearched(true);
      } else {
        setReviews([]);
        setTotalResults(0);
        setTotalPages(1);
        setHasSearched(false);
      }
    } catch (err) {
      console.error('Review search error:', err);
      setError(err.message);
      setReviews([]);
      setTotalResults(0);
      setTotalPages(1);
      setHasSearched(false);
    } finally {
      setLoading(false);
    }
  }, [filterValues]);

  // Handle explicit search button press
  const handleSearchButtonPress = () => {
    setCurrentPage(1);
    searchReviews(1);
  };

  // Handle page changes
  const handlePageChange = (page) => {
    setCurrentPage(page);
    searchReviews(page);
  };

  // Handle location state for pre-filled filters
  useEffect(() => {
    if (location.state?.prefillFilters) {
      const prefillFilters = location.state.prefillFilters;
      setFilterValues(prev => ({
        ...prev,
        ...prefillFilters
      }));
      
      // Auto-search if requested
      if (location.state.autoSearch) {
        setHasSearched(true);
        hasAutoSearched.current = true;
      }
    }
  }, [location.state]);

  // Auto-search when filters are set from navigation
  useEffect(() => {
    if (hasSearched && hasAutoSearched.current && location.state?.autoSearch) {
      hasAutoSearched.current = false; // Prevent multiple searches
      // Call searchReviews directly without dependency
      const performSearch = async () => {
        setLoading(true);
        setError(null);

        try {
          // Prepare search parameters
          const searchParams = {
            page: 1,
            pageSize: 20,
          };

          // Add filter parameters only if they're selected
          if (filterValues.user) {
            searchParams.userId = filterValues.user.id;
          }
          
          if (filterValues.movie) {
            searchParams.movieId = filterValues.movie.id;
          }
          
          // Handle rating range
          if (filterValues.rating[0] > 0) {
            searchParams.minRating = filterValues.rating[0];
          }
          if (filterValues.rating[1] < 5) {
            searchParams.maxRating = filterValues.rating[1];
          }
          
          // Handle date range filter
          if (filterValues.dateRange?.from) {
            searchParams.createdAfter = new Date(filterValues.dateRange.from).toISOString();
          }
          if (filterValues.dateRange?.to) {
            searchParams.createdBefore = new Date(filterValues.dateRange.to).toISOString();
          }
          
          // Handle sort parameters
          if (filterValues.sortBy !== '' && filterValues.sortBy !== null && filterValues.sortBy !== undefined) {
            searchParams.sortBy = parseInt(filterValues.sortBy);
          }
          if (filterValues.sortDescending !== true) {
            searchParams.sortDescending = filterValues.sortDescending;
          }

          const response = await ReviewService.searchReview(searchParams);
          
          if (response && (response.items || response.data || response.reviews)) {
            const reviewsData = response.items || response.data || response.reviews || [];
            setReviews(reviewsData);
            setTotalResults(response.totalCount || response.total || reviewsData.length);
            setTotalPages(response.totalPages || Math.ceil((response.totalCount || response.total || reviewsData.length) / 20));
            setCurrentPage(1);
          } else {
            setReviews([]);
            setTotalResults(0);
            setTotalPages(1);
          }
        } catch (err) {
          console.error('Review search error:', err);
          setError(err.message);
          setReviews([]);
          setTotalResults(0);
          setTotalPages(1);
        } finally {
          setLoading(false);
        }
      };

      performSearch();
    }
  }, [filterValues, hasSearched, location.state?.autoSearch]);

  // Disable body scroll when sidebar is open
  useEffect(() => {
    if (isFiltersSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isFiltersSidebarOpen]);


  return (
    <div className="relative">
      <h1 className="text-3xl font-bold mb-8">Search Reviews</h1>
      
      {/* Main Content with Dimming Effect */}
      <div className={`transition-all duration-300 ${isFiltersSidebarOpen ? 'opacity-70' : 'opacity-100'}`}>
        {/* Search Bar and Filter Button Row */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1">
            <div className="relative flex">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search reviews..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-l-lg focus:outline-none focus:border-green-500 text-white placeholder-gray-400"
                />
              </div>
              <button
                onClick={handleSearchButtonPress}
                className="cursor-pointer px-4 py-3 bg-green-600 hover:bg-green-700 border border-green-600 rounded-r-lg transition-colors"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>
          <button
            onClick={() => setIsFiltersSidebarOpen(!isFiltersSidebarOpen)}
            className="cursor-pointer flex items-center space-x-2 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors text-white whitespace-nowrap"
          >
            <Filter className="w-4 h-4" />
            <span>{isFiltersSidebarOpen ? 'Hide' : 'Show'} Filters</span>
          </button>
        </div>


        {/* Loading State */}
        {loading && (
          <div className="mt-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
            <p className="mt-4 text-gray-400">Searching reviews...</p>
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
            {/* Results Count */}
            {hasSearched && (hasActiveFilters() || searchQuery.trim()) && (
              <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
                <div className="text-gray-300">
                  {reviews.length > 0 ? (
                    <>
                      <span className="font-semibold text-green-400">
                        Found {totalResults} review{totalResults !== 1 ? 's' : ''}
                      </span>
                      {searchQuery.trim() && (
                        <span className="text-gray-400 ml-2">
                          for "{searchQuery.trim()}"
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
                      No reviews found
                      {searchQuery.trim() && ` for "${searchQuery.trim()}"`}
                      {hasActiveFilters() && ' with current filters'}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* No Results Message */}
            {reviews.length === 0 && hasSearched && (
              <div className="mt-8 text-center text-gray-400">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-lg mb-2">No reviews found matching your criteria</p>
                <p className="text-sm text-gray-500">
                  Try adjusting your search terms or filters
                </p>
              </div>
            )}

            {/* Reviews Grid */}
            {reviews.length > 0 && (
              <div className="mt-8">
                <PaginatedGridContainer
                  items={reviews}
                  itemsPerRow={1}
                  rows={20}
                  renderItem={(review) => (
                    <ReviewCard review={review} />
                  )}
                  itemHeight="auto"
                  gap="gap-6"
                  itemWidth="w-full"
                  useExternalPagination={true}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}

            {/* Initial State - No Search Yet */}
            {reviews.length === 0 && !hasActiveFilters() && !hasSearched && (
              <div className="mt-8 text-center text-gray-400">
                <div className="text-6xl mb-4">⭐</div>
                <p className="text-lg mb-2">Ready to search for reviews?</p>
                <p className="text-sm text-gray-500">
                  Use filters to find reviews, then click Search
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
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setIsFiltersSidebarOpen(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Filters Content - Scrollable */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="space-y-6">
                {reviewFilters.map((filter) => {
                  // Skip sort order filter if sort by is not selected
                  if (filter.key === 'sortDescending' && (!filterValues.sortBy || filterValues.sortBy === '')) {
                    return null;
                  }

                  const value = filterValues[filter.key] || filter.defaultValue;

                  let filterComponent;
                  switch (filter.type) {
                    case 'flexiblesearch':
                      filterComponent = (
                        <div key={filter.key} className="space-y-2">
                          <label className="block text-sm font-medium text-gray-300">{filter.label}</label>
                          <FlexibleSearchInput
                            placeholder={filter.placeholder}
                            searchFunction={filter.searchFunction}
                            onSelectedItemsChange={(items) => {
                              const newFilterValues = { ...filterValues, [filter.key]: items[0] || null };
                              setFilterValues(newFilterValues);
                            }}
                            selectedItems={value ? [value] : []}
                            maxResults={10}
                            debounceMs={1000}
                            clearable={true}
                            multiple={false}
                            className="w-full"
                          />
                        </div>
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
                    case 'select':
                      filterComponent = (
                        <SelectFilter
                          key={filter.key}
                          label={filter.label}
                          value={value}
                          onChange={(newValue) => {
                            console.log('Filter changed:', filter.key, 'New value:', newValue);
                            const newFilterValues = { ...filterValues, [filter.key]: newValue };
                            setFilterValues(newFilterValues);
                          }}
                          options={filter.options}
                          placeholder={filter.placeholder}
                        />
                      );
                      break;
                    case 'daterange':
                      filterComponent = (
                        <DateRangeFilter
                          key={filter.key}
                          label={filter.label}
                          value={value}
                          onChange={(newValue) => {
                            const newFilterValues = { ...filterValues, [filter.key]: newValue };
                            setFilterValues(newFilterValues);
                          }}
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
            
            {/* Footer with Clear Button */}
            <div className="p-6 border-t border-gray-700">
              <button
                onClick={() => {
                  const clearedFilters = {};
                  reviewFilters.forEach(filter => {
                    clearedFilters[filter.key] = filter.defaultValue;
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

export default ReviewsSearch;
