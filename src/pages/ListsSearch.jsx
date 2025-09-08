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
  
  // Filters based on the searchLists method parameters
  const listsFilters = [
    {
      key: 'dateRange',
      label: 'Date Range',
      type: 'daterange',
      defaultValue: { fromDate: null, toDate: null }
    },
    {
      key: 'author',
      label: 'Author',
      type: 'flexiblesearch',
      defaultValue: null
    }
  ];

  const [searchQuery, setSearchQuery] = useState('');
  const [filterValues, setFilterValues] = useState({
    dateRange: { fromDate: null, toDate: null },
    author: null
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
        description: `User: ${author.username}`,
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
        return value.fromDate !== null || value.toDate !== null;
      }
      if (key === 'author') {
        return value !== null;
      }
      return value && value !== '';
    });
  }, [filterValues]);

  // Search lists using listsService
  const searchLists = useCallback(async (page = 1) => {
    const hasActive = hasActiveFilters();
    console.log('🔍 List search triggered with:', { searchQuery, hasActiveFilters: hasActive, page });
    console.log('Current filter values:', filterValues);
    
    if (!searchQuery.trim() && !hasActive) {
      console.log('No search query and no active filters, clearing results');
      setLists([]);
      setTotalResults(0);
      setTotalPages(1);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Prepare search parameters for listsService
      // Note: We use user ID if available, otherwise a dummy ID to search across all lists
      const searchParams = {
        userId: filterValues.author?.id || user?.id || 'public-search', // Use selected author ID, current user ID, or dummy for public search
        title: searchQuery.trim() || null,
        fromDate: filterValues.dateRange.fromDate,
        toDate: filterValues.dateRange.toDate,
        page: page - 1, // API uses 0-based pages
        pageSize: 20
      };

      console.log('Final search parameters being sent:', searchParams);

      const response = await ListsService.searchLists(searchParams);
      
      console.log('Search API Response:', response);
      
      if (response && (response.data || response.items)) {
        const listsData = response.data || response.items || [];
        
        // Transform API data to match MovieListCard expected structure
        const transformedLists = listsData.map(list => ({
          id: list.id,
          title: list.title,
          description: list.description,
          coverImages: [], // MovieListPoster will handle showing 4 posters
          author: {
            name: list.userSimplified?.userName || 'Unknown',
            avatar: list.userSimplified?.avatarPath || '👤'
          },
          stats: {
            films: list.moviesCount || 0,
            likes: list.likesCount || 0,
            comments: 0
          }
        }));
        
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
      <h1 className="text-3xl font-bold mb-8">Search Movie Lists</h1>
      
      {/* Main Content */}
      <div className={`transition-all duration-300 ${isFiltersSidebarOpen ? 'opacity-70' : 'opacity-100'}`}>
        {/* Search Bar and Filter Button Row */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 flex items-center gap-2">
            <div className="relative flex-1">
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
                className="w-full px-4 py-3 pl-12 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-800 text-white placeholder-gray-400"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            <button
              onClick={handleSearchButtonPress}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium whitespace-nowrap"
            >
              Search
            </button>
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
            {hasSearched && (searchQuery.trim() || hasActiveFilters()) && (
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
                      {hasActiveFilters() && (
                        <span className="text-gray-400 ml-2">
                          with applied filters
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-gray-400">
                      No lists found
                      {searchQuery.trim() && ` for "${searchQuery.trim()}"`}
                      {hasActiveFilters() && ' with current filters'}
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
                  Enter a search term or use filters, then click Search to find lists
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
