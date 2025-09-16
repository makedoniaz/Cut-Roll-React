import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import PaginatedGridContainer from '../components/layout/PaginatedGridContainer';
import MovieListCard from '../components/ui/movie-lists/MovieListCard';
import { ListsService } from '../services/listsService';
import { Filter, X, Search } from 'lucide-react';
import DateRangeFilter from '../components/search/filters/DateRangeFilter';
import FlexibleSearchInput from '../components/ui/common/FlexibleSearchInput';
import { useAuthStore } from '../stores/authStore';

const ListsSearch = () => {
  const location = useLocation();
  const { user } = useAuthStore();
  
  // Get search parameters from navigation state
  const searchParamsFromState = location.state?.searchParams || {};
  
  // Filters based on the searchLists method parameters
  const listsFilters = [
    {
      key: 'dateRange',
      label: 'Date Range',
      type: 'daterange',
      defaultValue: { from: null, to: null }
    },
    {
      key: 'author',
      label: 'Author',
      type: 'flexiblesearch',
      defaultValue: null
    },
    {
      key: 'sortByLikesAscending',
      label: 'Sort by Likes',
      type: 'checkbox',
      defaultValue: false
    }
  ];

  const [searchQuery, setSearchQuery] = useState('');
  const [filterValues, setFilterValues] = useState({
    dateRange: { from: null, to: null },
    author: null,
    sortByLikesAscending: searchParamsFromState.sortByLikesAscending || false
  });

  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);
  const [isFiltersSidebarOpen, setIsFiltersSidebarOpen] = useState(false);

  // Search function for authors
  const searchAuthors = useCallback(async (searchTerm) => {
    try {
      const response = await ListsService.searchListAuthors({
        searchTerm,
        pageNumber: 1,
        pageSize: 10
      });
      
      // Transform the response to match FlexibleSearchInput expected format
      const authors = response.data || response.items || [];
      return authors.map(author => ({
        id: author.id,
        name: author.username, // API returns 'username' not 'userName'
        description: author.username,
        image: author.avatarPath || null
      }));
    } catch (error) {
      console.error('Error searching authors:', error);
      return [];
    }
  }, []);

  // Check if there are any active filters
  const hasActiveFilters = useCallback(() => {
    return Object.entries(filterValues).some(([key, value]) => {
      if (key === 'dateRange') {
        return value.from !== null || value.to !== null;
      }
      if (key === 'author') {
        return value !== null;
      }
      if (key === 'sortByLikesAscending') {
        return value === true; // Only consider it active if explicitly set to true
      }
      return value && value !== '';
    });
  }, [filterValues]);

  // Search lists using listsService
  const searchLists = useCallback(async (page = 1) => {
    const hasActive = hasActiveFilters();
    console.log('🔍 List search triggered with:', { searchQuery, hasActiveFilters: hasActive, page });
    console.log('Current filter values:', filterValues);
    
    // Allow search even without filters - this will show all lists
    // if (!searchQuery.trim() && !hasActive) {
    //   console.log('No search query and no active filters, clearing results');
    //   setLists([]);
    //   setTotalResults(0);
    //   setTotalPages(1);
    //   return;
    // }

    setLoading(true);
    setError(null);

    try {
      // Prepare search parameters for listsService
      const searchParams = {
        userId: filterValues.author?.id || null, // Only use selected author ID, or null to search all lists
        title: searchQuery.trim() || null,
        fromDate: filterValues.dateRange.from || null,
        toDate: filterValues.dateRange.to || null,
        page: page - 1, // API uses 0-based pages
        pageSize: 20,
        sortByLikesAscending: filterValues.sortByLikesAscending || false
      };

      console.log('Final search parameters being sent:', searchParams);

      const response = await ListsService.searchLists(searchParams);
      
      console.log('Search API Response:', response);
      
      if (response && (response.data || response.items)) {
        const listsData = response.data || response.items || [];
        
        // Transform API data to match MovieListCard expected structure
        const transformedLists = listsData.map(list => {
          // Process preview images - construct full URLs for TMDB images
          const coverImages = (list.preview || []).map(imagePath => {
            // If the path already starts with http, use it as is
            if (imagePath.startsWith('http')) {
              return imagePath;
            }
            // Otherwise, construct TMDB URL
            return `https://image.tmdb.org/t/p/w185${imagePath}`;
          });

          return {
            id: list.id,
            title: list.title,
            description: list.description,
            coverImages: coverImages, // Use preview images from API
            author: {
              name: list.userSimplified?.userName || 'Unknown',
              avatar: list.userSimplified?.avatarPath || '👤'
            },
            stats: {
              films: list.moviesCount || 0,
              likes: list.likesCount || 0,
              comments: 0
            }
          };
        });
        
        setLists(transformedLists);
        setTotalResults(response.totalCount || transformedLists.length);
        setTotalPages(Math.ceil((response.totalCount || transformedLists.length) / 20));
        setCurrentPage(page);
        setHasSearched(true);
      } else {
        console.log('No data in response or response is empty');
        setLists([]);
        setTotalResults(0);
        setTotalPages(1);
        setHasSearched(false);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message);
      setLists([]);
      setTotalResults(0);
      setTotalPages(1);
      setHasSearched(false);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filterValues, user?.id]);

  // Auto-trigger search if we have parameters from navigation
  useEffect(() => {
    if (searchParamsFromState.sortByLikesAscending !== undefined) {
      // Auto-search with the passed parameters - this will search for popular lists
      console.log('Auto-triggering search with pre-filters:', searchParamsFromState);
      searchLists(1);
    }
  }, [searchParamsFromState, searchLists]);

  // Handle search query changes
  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
    setHasSearched(false);
  };

  // Handle filter changes
  const handleFiltersChange = (filters) => {
    console.log('Filter values changed:', filters);
    setFilterValues(filters);
    setCurrentPage(1);
    setHasSearched(false);
  };

  // Handle explicit search button press
  const handleSearchButtonPress = () => {
    searchLists(1);
  };

  // Handle page changes
  const handlePageChange = (page) => {
    setCurrentPage(page);
    searchLists(page);
  };

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
      <h1 className="text-3xl font-bold mb-8">
        Search Movie Lists
      </h1>
      
      {/* Main Content */}
      <div className={`transition-all duration-300 ${isFiltersSidebarOpen ? 'opacity-70' : 'opacity-100'}`}>
        {/* Search Bar and Filter Button Row */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1">
            <div className="relative flex">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search for movie lists..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearchButtonPress();
                    }
                  }}
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
            <p className="mt-4 text-gray-400">Searching lists...</p>
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
            {hasSearched && (
              <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
                <div className="text-gray-300">
                  {lists.length > 0 ? (
                    <>
                      <span className="font-semibold text-green-400">
                        Found {totalResults} list{totalResults !== 1 ? 's' : ''}
                      </span>
                      {searchQuery.trim() && (
                        <span className="text-gray-400 ml-2">
                          for "{searchQuery.trim()}"
                        </span>
                      )}
                      <span className="text-gray-400 ml-2">
                        with applied filters
                      </span>
                    </>
                  ) : (
                    <span className="text-gray-400">
                      No lists found
                      {searchQuery.trim() && ` for "${searchQuery.trim()}"`}
                      {hasActiveFilters() && ' with current filters'}
                      {!searchQuery.trim() && !hasActiveFilters() && ' in the system'}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* No Results Message */}
            {lists.length === 0 && hasSearched && (
              <div className="mt-8 text-center text-gray-400">
                <div className="text-6xl mb-4">📝</div>
                <p className="text-lg mb-2">No lists found matching your criteria</p>
                <p className="text-sm text-gray-500">
                  Try adjusting your search terms or filters
                </p>
              </div>
            )}

            {/* Lists Grid */}
            {lists.length > 0 && (
              <div className="mt-8">
                <PaginatedGridContainer
                  items={lists}
                  itemsPerRow={4}
                  rows={5}
                  renderItem={(list) => (
                    <MovieListCard list={list} />
                  )}
                  itemHeight="h-60"
                  gap="gap-6"
                  itemWidth="w-58"
                  useExternalPagination={true}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}

            {/* Initial State */}
            {lists.length === 0 && !searchQuery.trim() && !hasActiveFilters() && !hasSearched && (
              <div className="mt-8 text-center text-gray-400">
                <div className="text-6xl mb-4">📋</div>
                <p className="text-lg mb-2">Ready to search for movie lists?</p>
                <p className="text-sm text-gray-500">
                  Click Search to see all lists, or enter a search term and use filters to find specific lists
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Filters Sidebar */}
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
            
            {/* Filters Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="space-y-6">
                {listsFilters.map((filter) => {
                  const value = filterValues[filter.key] || filter.defaultValue;

                  if (filter.type === 'daterange') {
                    return (
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
                  }

                  if (filter.type === 'flexiblesearch') {
                    return (
                      <div key={filter.key} className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">{filter.label}</label>
                        <FlexibleSearchInput
                          placeholder={`Search for ${filter.label.toLowerCase()}...`}
                          searchFunction={searchAuthors}
                          selectedItems={value ? [value] : []}
                          onSelectedItemsChange={(items) => {
                            const newFilterValues = { ...filterValues, [filter.key]: items.length > 0 ? items[0] : null };
                            setFilterValues(newFilterValues);
                          }}
                          multiple={false}
                          clearable={true}
                          debounceMs={500}
                          maxResults={10}
                        />
                      </div>
                    );
                  }

                  if (filter.type === 'checkbox') {
                    return (
                      <div key={filter.key} className="space-y-2">
                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={value || false}
                            onChange={(e) => {
                              const newFilterValues = { ...filterValues, [filter.key]: e.target.checked };
                              setFilterValues(newFilterValues);
                            }}
                            className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                          />
                          <span className="text-sm font-medium text-gray-300">
                            {filter.key === 'sortByLikesAscending' ? 'Sort by likes ascending (lowest first)' : filter.label}
                          </span>
                        </label>
                        {filter.key === 'sortByLikesAscending' && (
                          <p className="text-xs text-gray-400 ml-7">
                            When unchecked, lists are sorted by likes descending (most popular first)
                          </p>
                        )}
                      </div>
                    );
                  }

                  return null;
                })}
              </div>
            </div>
            
            {/* Footer with Clear Button */}
            <div className="p-6 border-t border-gray-700">
              <button
                onClick={() => {
                  const clearedFilters = {};
                  listsFilters.forEach(filter => {
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

export default ListsSearch;
