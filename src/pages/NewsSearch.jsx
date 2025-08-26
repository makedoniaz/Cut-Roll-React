import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import PaginatedGridContainer from '../components/layout/PaginatedGridContainer';
import NewsCard from '../components/ui/news/NewsCard';
import { NewsService } from '../services/newsService';
import { Filter, X, Search as SearchIcon, Newspaper } from 'lucide-react';
import RangeFilter from '../components/search/filters/RangeFilter';
import MultiSelectFilter from '../components/search/filters/MultiSelectFilter';
import SelectFilter from '../components/search/filters/SelectFilter';
import DynamicSearchFilter from '../components/search/filters/DynamicSearchFilter';

const NewsSearch = () => {
  const location = useLocation();
  
  // News-specific filters that match newsService search parameters
  const newsFilters = [
    {
      key: 'keyword',
      label: 'Keyword',
      type: 'dynamicsearch',
      searchType: 'keyword',
      placeholder: 'Search for keywords',
      defaultValue: []
    },
    {
      key: 'authorId',
      label: 'Author',
      type: 'dynamicsearch',
      searchType: 'people',
      placeholder: 'Search for authors',
      defaultValue: null
    },
    {
      key: 'sortBy',
      label: 'Sort By',
      type: 'select',
      placeholder: 'Sort by...',
      options: [
        { value: 'title', label: 'Title' },
        { value: 'createdAt', label: 'Created Date' },
        { value: 'updatedAt', label: 'Updated Date' }
      ]
    },
    {
      key: 'sortDescending',
      label: 'Sort Order',
      type: 'select',
      placeholder: 'Sort order...',
      options: [
        { value: true, label: 'Descending (Newest First)' },
        { value: false, label: 'Ascending (Oldest First)' }
      ],
      defaultValue: true
    }
  ];

  const [searchQuery, setSearchQuery] = useState('');
  const [filterValues, setFilterValues] = useState({
    keyword: [],
    authorId: null,
    sortBy: '',
    sortDescending: true
  });

  const [newsArticles, setNewsArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isManualSearch, setIsManualSearch] = useState(false);
  const [lastSearchSource, setLastSearchSource] = useState(null);
  const [isFiltersSidebarOpen, setIsFiltersSidebarOpen] = useState(false);

  // Handle pre-filled filters from navigation state
  useEffect(() => {
    if (location.state?.prefillFilters) {
      const prefillFilters = location.state.prefillFilters;
      console.log('Applying pre-filled filters:', prefillFilters);
      
      setIsRestoring(true);
      
      // Update filter values with pre-filled data
      const newFilterValues = { ...filterValues };
      
      if (prefillFilters.keyword) {
        if (Array.isArray(prefillFilters.keyword)) {
          newFilterValues.keyword = prefillFilters.keyword;
        } else {
          newFilterValues.keyword = [{ id: 'prefilled', name: prefillFilters.keyword, description: `Keyword: ${prefillFilters.keyword}` }];
        }
      }
      if (prefillFilters.authorId) {
        if (Array.isArray(prefillFilters.authorId)) {
          newFilterValues.authorId = prefillFilters.authorId[0] || null;
        } else {
          newFilterValues.authorId = { id: 'prefilled', name: prefillFilters.authorId, description: `Author: ${prefillFilters.authorId}` };
        }
      }
      if (prefillFilters.sortBy) {
        newFilterValues.sortBy = prefillFilters.sortBy;
      }
      if (prefillFilters.sortDescending !== undefined) {
        newFilterValues.sortDescending = prefillFilters.sortDescending;
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
        const defaultValue = newsFilters.find(f => f.key === 'sortDescending')?.defaultValue;
        return value !== defaultValue;
      }
      
      if (key === 'sortBy') {
        return value && value !== '';
      }
      
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      
      if (key === 'authorId') {
        return value !== null;
      }
      
      return value && value !== '';
    });
  }, [filterValues, newsFilters]);

  // Search news using newsService
  const searchNews = useCallback(async (page = 1, source = 'unknown') => {
    const hasActive = hasActiveFilters();
    console.log('🔍 News search triggered with:', { searchQuery, hasActiveFilters: hasActive, page, isManualSearch, source });
    console.log('Current filter values:', filterValues);
    
    if (!searchQuery.trim() && !hasActive) {
      console.log('No search query and no active filters, clearing results');
      setNewsArticles([]);
      setTotalResults(0);
      setTotalPages(1);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Prepare search parameters for newsService
      const searchParams = {
        page: page,
        pageSize: 20, // Show 20 news articles per page
        title: searchQuery.trim() || null,
        keyword: filterValues.keyword && filterValues.keyword.length > 0 ? filterValues.keyword.map(k => k.name) : null,
        authorId: filterValues.authorId ? filterValues.authorId.id : null,
        sortBy: filterValues.sortBy || null,
        sortDescending: filterValues.sortDescending
      };

      // Remove null values
      Object.keys(searchParams).forEach(key => {
        if (searchParams[key] === null || searchParams[key] === '') {
          delete searchParams[key];
        }
      });

      console.log('Final news search parameters being sent:', searchParams);

      const response = await NewsService.searchNews(searchParams);
      
      console.log('News search API Response:', response);
      
      if (response && response.data) {
        setNewsArticles(response.data);
        setTotalResults(response.totalCount || response.data.length);
        setTotalPages(response.totalPages || Math.ceil((response.totalCount || response.data.length) / 20));
        setCurrentPage(page);
        setHasSearched(true);
      } else {
        console.log('No data in response or response is empty');
        setNewsArticles([]);
        setTotalResults(0);
        setTotalPages(1);
        setHasSearched(false);
      }
    } catch (err) {
      console.error('News search error:', err);
      setError(err.message);
      setNewsArticles([]);
      setTotalResults(0);
      setTotalPages(1);
      setHasSearched(false);
    } finally {
      setLoading(false);
      setIsManualSearch(false);
    }
  }, [searchQuery, filterValues]);

  // Handle restoring search state when coming back from article details
  useEffect(() => {
    if (location.state?.restoreSearch) {
      const restoreData = location.state.restoreSearch;
      console.log('Restoring news search state:', restoreData);
      
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
      sessionStorage.removeItem('lastNewsSearchContext');
      
      // Reset the flag after a short delay to allow state updates to complete
      setTimeout(() => {
        setIsRestoring(false);
      }, 200);
    }
  }, [location.state]);

  // Auto-restore search results when state is restored
  useEffect(() => {
    if (isRestoring) {
      console.log('⏭️ Skipping auto-restore - currently restoring from pre-filled filters');
      return;
    }
    
    if (isManualSearch) {
      console.log('⏭️ Skipping auto-restore - this was a manual search');
      return;
    }
    
    if (lastSearchSource === 'manual' || lastSearchSource === 'prefill') {
      console.log('⏭️ Skipping auto-restore - last search was:', lastSearchSource);
      return;
    }
    
    console.log('🔄 Auto-restore effect triggered:', { hasSearched, searchQuery, hasActiveFilters: hasActiveFilters() });
    if (hasSearched && (searchQuery.trim() || hasActiveFilters())) {
      console.log('🔄 Restoring news search results for page:', currentPage);
      const timer = setTimeout(() => {
        setLastSearchSource('restore');
        searchNews(currentPage, 'restore');
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [hasSearched, searchQuery, currentPage, isRestoring, isManualSearch, lastSearchSource, searchNews]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      if (!location.state) {
        setNewsArticles([]);
        setTotalResults(0);
        setTotalPages(1);
        setHasSearched(false);
        setCurrentPage(1);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [location.state]);

  // Auto-trigger search when filters are pre-filled
  useEffect(() => {
    if (location.state?.prefillFilters) {
      const timer = setTimeout(async () => {
        setIsManualSearch(true);
        setLastSearchSource('prefill');
        await searchNews(1, 'prefill');
        setIsRestoring(false);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [location.state?.prefillFilters, searchNews]);

  // Handle search query changes
  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
    setHasSearched(false);
    setIsManualSearch(false);
    setLastSearchSource(null);
  };

  // Handle filter changes
  const handleFiltersChange = (filters) => {
    console.log('News filter values changed:', filters);
    setFilterValues(filters);
    setCurrentPage(1);
    setHasSearched(false);
    setIsManualSearch(false);
    setLastSearchSource(null);
  };

  // Handle explicit search button press
  const handleSearchButtonPress = () => {
    setIsManualSearch(true);
    setLastSearchSource('manual');
    searchNews(1, 'manual');
  };

  // Handle page changes
  const handlePageChange = (page) => {
    setCurrentPage(page);
    setIsManualSearch(true);
    setLastSearchSource('manual');
    searchNews(page, 'manual');
  };

  // Handle item selection (navigation to article details)
  const onItemSelect = (article) => {
    console.log("Selected news article:", article);
    // Navigation is handled by NewsCard component
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
      <h1 className="text-3xl font-bold mb-8">Search News</h1>
      
      {/* Main Content with Dimming Effect */}
      <div className={`transition-all duration-300 ${isFiltersSidebarOpen ? 'opacity-70' : 'opacity-100'}`}>
        {/* Search Bar and Filter Button Row */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for news articles..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full px-4 py-3 pl-12 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-green-500 text-white placeholder-gray-400"
              />
              <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <button
                onClick={handleSearchButtonPress}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
              >
                Search
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
            <p className="mt-4 text-gray-400">Searching news articles...</p>
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
                  {newsArticles.length > 0 ? (
                    <>
                      <span className="font-semibold text-green-400">
                        Found {totalResults} article{totalResults !== 1 ? 's' : ''}
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
                      No articles found
                      {searchQuery.trim() && ` for "${searchQuery.trim()}"`}
                      {hasActiveFilters() && ' with current filters'}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* No Results Message */}
            {newsArticles.length === 0 && hasSearched && (
              <div className="mt-8 text-center text-gray-400">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-lg mb-2">No news articles found matching your criteria</p>
                <p className="text-sm text-gray-500">
                  Try adjusting your search terms or filters
                </p>
              </div>
            )}

            {/* News Articles Grid */}
            {newsArticles.length > 0 && (
              <div className="mt-8">
                <PaginatedGridContainer
                  items={newsArticles}
                  itemsPerRow={4}
                  rows={5}
                  renderItem={(article) => (
                    <NewsCard 
                      key={article.id}
                      image={article.photoUrl || '/news-placeholder.jpg'}
                      category="News"
                      categoryIcon={<Newspaper className="w-4 h-4" />}
                      title={article.title}
                      description={article.content}
                      hasVideo={false}
                      onReadMore={() => {
                        // Navigate to article details
                        window.location.href = `/news/${article.id}`;
                      }}
                    />
                  )}
                  itemHeight="h-80"
                  gap="gap-6"
                  itemWidth="w-80"
                  useExternalPagination={true}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}

            {/* Initial State - No Search Yet */}
            {newsArticles.length === 0 && !searchQuery.trim() && !hasActiveFilters() && !hasSearched && (
              <div className="mt-8 text-center text-gray-400">
                <div className="text-6xl mb-4">📰</div>
                <p className="text-lg mb-2">Ready to search for news articles?</p>
                <p className="text-sm text-gray-500">
                  Enter a search term or use filters, then click Search to find articles
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
                <h3 className="text-lg font-semibold text-white">News Filters</h3>
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
                {newsFilters.map((filter) => {
                  let value;
                  if (filter.type === 'select' && filter.defaultValue !== undefined) {
                    value = filterValues.hasOwnProperty(filter.key) ? filterValues[filter.key] : filter.defaultValue;
                  } else if (filter.type === 'dynamicsearch') {
                    if (filter.searchType === 'people') {
                      value = filterValues[filter.key] || filter.defaultValue || null;
                    } else {
                      value = filterValues[filter.key] || filter.defaultValue || [];
                    }
                  } else {
                    value = filterValues[filter.key] || filter.defaultValue || (filter.type === 'multiselect' ? [] : filter.type === 'range' ? [filter.min || 0, filter.max || 100] : '');
                  }

                  let filterComponent;
                  switch (filter.type) {
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
            
            {/* Footer with Clear Button */}
            <div className="p-6 border-t border-gray-700">
              <button
                onClick={() => {
                  const clearedFilters = {};
                  newsFilters.forEach(filter => {
                    switch (filter.type) {
                      case 'dynamicsearch':
                        if (filter.searchType === 'people') {
                          clearedFilters[filter.key] = filter.defaultValue || null;
                        } else {
                          clearedFilters[filter.key] = filter.defaultValue || [];
                        }
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

export default NewsSearch;
