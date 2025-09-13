import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import PaginatedGridContainer from '../components/layout/PaginatedGridContainer';
import NewsCard from '../components/news/NewsCard';
import { NewsService } from '../services/newsService';
import { Filter, X, Search as SearchIcon } from 'lucide-react';
import RangeFilter from '../components/search/filters/RangeFilter';
import MultiSelectFilter from '../components/search/filters/MultiSelectFilter';
import SelectFilter from '../components/search/filters/SelectFilter';
import DynamicSearchFilter from '../components/search/filters/DynamicSearchFilter';
import DateRangeFilter from '../components/search/filters/DateRangeFilter';
import ReferenceTypeFilter from '../components/search/filters/ReferenceTypeFilter';

const NewsSearch = () => {
  const location = useLocation();
  
  // News-specific filters that match newsService filterNews parameters
  const newsFilters = [
    {
      key: 'authorId',
      label: 'Author',
      type: 'dynamicsearch',
      searchType: 'people',
      placeholder: 'Search for authors',
      defaultValue: null
    },
    {
      key: 'dateRange',
      label: 'Date Range',
      type: 'daterangefilter',
      placeholder: 'Select date range...',
      defaultValue: { from: null, to: null }
    },
    {
      key: 'referenceToSearch',
      label: 'References',
      type: 'referencetypefilter',
      placeholder: 'Select reference type and search...',
      defaultValue: []
    }
  ];

  const [searchQuery, setSearchQuery] = useState('');
  const [filterValues, setFilterValues] = useState({
    authorId: null,
    dateRange: { from: null, to: null },
    referenceToSearch: []
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
  const [filterResetKey, setFilterResetKey] = useState(0);

  // Handle pre-filled filters from navigation state
  useEffect(() => {
    if (location.state?.prefillFilters) {
      const prefillFilters = location.state.prefillFilters;
      console.log('Applying pre-filled filters:', prefillFilters);
      
      setIsRestoring(true);
      
      // Update filter values with pre-filled data
      const newFilterValues = { ...filterValues };
      
      if (prefillFilters.authorId) {
        if (Array.isArray(prefillFilters.authorId)) {
          newFilterValues.authorId = prefillFilters.authorId[0] || null;
        } else {
          newFilterValues.authorId = { id: 'prefilled', name: prefillFilters.authorId, description: `Author: ${prefillFilters.authorId}` };
        }
      }
      if (prefillFilters.dateRange) {
        newFilterValues.dateRange = prefillFilters.dateRange;
      }
      if (prefillFilters.referenceToSearch) {
        if (Array.isArray(prefillFilters.referenceToSearch)) {
          newFilterValues.referenceToSearch = prefillFilters.referenceToSearch;
        } else {
          newFilterValues.referenceToSearch = [{ id: 'prefilled', name: prefillFilters.referenceToSearch, description: `Reference: ${prefillFilters.referenceToSearch}` }];
        }
      }
      
      setFilterValues(newFilterValues);
      
      // Clear the navigation state to prevent re-applying on re-renders
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Check if there are any active filters
  const hasActiveFilters = useCallback(() => {
    return Object.entries(filterValues).some(([key, value]) => {
      if (key === 'dateRange') {
        return value.from !== null || value.to !== null;
      }
      
      if (key === 'query') {
        return value && value.trim() !== '';
      }
      
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      
      if (key === 'authorId') {
        return value !== null;
      }
      
      return value && value !== '';
    }) || searchQuery.trim() !== '';
  }, [filterValues, searchQuery]);

  // Search news using newsService filterNews method
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

    // Validate date range before sending request
    if (filterValues.dateRange.from && filterValues.dateRange.to) {
      const fromDate = new Date(filterValues.dateRange.from);
      const toDate = new Date(filterValues.dateRange.to);
      if (fromDate >= toDate) {
        setError('From date must be before to date');
        setLoading(false);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      // Helper function to format dates for API
      const formatDateForAPI = (dateString) => {
        if (!dateString) return null;
        try {
          // Create a date object and ensure it's in UTC
          const date = new Date(dateString + 'T00:00:00.000Z');
          if (isNaN(date.getTime())) {
            throw new Error('Invalid date format');
          }
          return date.toISOString();
        } catch (error) {
          console.error('Date formatting error:', error);
          return null;
        }
      };

      // Prepare filter parameters for newsService filterNews method
      const filterParams = {
        page: page - 1, // Convert to 0-based indexing for filter API
        pageSize: 20, // Show 20 news articles per page
        query: searchQuery.trim() || null,
        authorId: filterValues.authorId ? filterValues.authorId.id : null,
        from: formatDateForAPI(filterValues.dateRange.from),
        to: filterValues.dateRange.to ? formatDateForAPI(filterValues.dateRange.to).replace('T00:00:00.000Z', 'T23:59:59.999Z') : null,
        referenceToSearch: filterValues.referenceToSearch && filterValues.referenceToSearch.length > 0 
          ? filterValues.referenceToSearch.map(ref => ({
            referenceType: ref.referenceType || 0, // Default to 0 if not specified
            referencedId: ref.id
          }))
          : null
      };

      // Remove null values
      Object.keys(filterParams).forEach(key => {
        if (filterParams[key] === null || filterParams[key] === '') {
          delete filterParams[key];
        }
      });

      console.log('Final news filter parameters being sent:', filterParams);
      console.log('Date formatting details:', {
        originalFrom: filterValues.dateRange.from,
        originalTo: filterValues.dateRange.to,
        formattedFrom: filterParams.from,
        formattedTo: filterParams.to
      });

      const response = await NewsService.filterNews(filterParams);
      
      console.log('News filter API Response:', response);
      
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
      console.error('News filter error:', err);
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
      setFilterValues(restoreData.filterValues || {
        authorId: null,
        dateRange: { from: null, to: null },
        referenceToSearch: []
      });
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
            <div className="relative flex">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search for news articles..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
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
                  renderItem={(article) => {
                    // Transform the API response to match NewsCard expectations
                    const transformedArticle = {
                      id: article.id,
                      title: article.title || 'Untitled Article',
                      content: article.content || '',
                      excerpt: article.content 
                        ? (() => {
                            // Create a simple excerpt from content (first 200 characters)
                            const plainText = article.content.replace(/<[^>]*>/g, ''); // Remove HTML tags
                            return plainText.length > 200 
                              ? plainText.substring(0, 200).trim() + '...' 
                              : plainText.trim();
                          })()
                        : 'No content available',
                      likes: article.likesCount || 0,
                      likesCount: article.likesCount || 0,
                      comments: 0, // Not provided by API yet
                      category: 'News',
                      imageUrl: article.photoPath || '/news-placeholder.jpg',
                      readTime: '5 min read', // Default read time
                      publishedAt: article.createdAt || new Date().toISOString(),
                      createdAt: article.createdAt || new Date().toISOString(),
                      updatedAt: article.updatedAt,
                      authorId: article.authorId || 'unknown',
                      author: {
                        id: article.author?.id || article.authorId || 'unknown',
                        name: article.author?.userName || article.author?.name || 'Anonymous User',
                        avatar: article.author?.avatarPath || null
                      },
                      references: article.newsReferences || []
                    };

                    return (
                      <NewsCard 
                        key={article.id}
                        article={transformedArticle}
                        showAuthor={true}
                        showActions={false}
                      />
                    );
                  }}
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
                  if (filter.type === 'daterangefilter') {
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
                    case 'daterangefilter':
                      filterComponent = (
                        <DateRangeFilter
                          key={filter.key}
                          label={filter.label}
                          value={value}
                          onChange={(newValue) => {
                            const newFilterValues = { ...filterValues, [filter.key]: newValue };
                            setFilterValues(newFilterValues);
                          }}
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
                    case 'referencetypefilter':
                      filterComponent = (
                        <ReferenceTypeFilter
                          key={`${filter.key}-${filterResetKey}`}
                          label={filter.label}
                          value={value}
                          onChange={(newValue) => {
                            const newFilterValues = { ...filterValues, [filter.key]: newValue };
                            setFilterValues(newFilterValues);
                          }}
                          placeholder={filter.placeholder}
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
                      case 'daterangefilter':
                        clearedFilters[filter.key] = filter.defaultValue || { from: null, to: null };
                        break;
                      case 'referencetypefilter':
                        clearedFilters[filter.key] = filter.defaultValue || [];
                        break;
                      default:
                        clearedFilters[filter.key] = filter.defaultValue || '';
                    }
                  });
                  setFilterValues(clearedFilters);
                  setFilterResetKey(prev => prev + 1);
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
