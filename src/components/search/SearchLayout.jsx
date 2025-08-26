import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, X } from 'lucide-react';
import SearchBar from './SearchBar';
import PaginatedGridContainer from '../layout/PaginatedGridContainer';
import RangeFilter from './filters/RangeFilter';
import MultiSelectFilter from './filters/MultiSelectFilter';
import SelectFilter from './filters/SelectFilter';
import TextFilter from './filters/TextFilter';
import DateFilter from './filters/DateFilter';

const SearchLayout = ({ 
  title, 
  description, 
  filters, 
  searchFunction, 
  resultComponent: ResultComponent,
  searchTypes = [],
  defaultSearchType = 'all'
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [activeFilters, setActiveFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  // Initialize filters from URL params and navigation state
  useEffect(() => {
    const params = Object.fromEntries(searchParams.entries());
    const location = window.location;
    const initialFilters = {};
    
    // Check for prefillFilters in navigation state
    let prefillFilters = {};
    try {
      const state = history.state;
      if (state && state.prefillFilters) {
        prefillFilters = state.prefillFilters;
      }
    } catch (e) {
      // Ignore errors accessing history state
    }
    
    filters.forEach(filter => {
      // Priority: URL params > prefillFilters > default values
      if (params[filter.key]) {
        if (filter.type === 'multiselect') {
          initialFilters[filter.key] = params[filter.key].split(',');
        } else if (filter.type === 'range') {
          initialFilters[filter.key] = params[filter.key].split(',').map(Number);
        } else {
          initialFilters[filter.key] = params[filter.key];
        }
      } else if (prefillFilters[filter.key] !== undefined) {
        initialFilters[filter.key] = prefillFilters[filter.key];
      } else if (filter.defaultValue !== undefined) {
        initialFilters[filter.key] = filter.defaultValue;
      }
    });

    setActiveFilters(initialFilters);
    
    if (params.query || Object.keys(initialFilters).some(key => initialFilters[key])) {
      performSearch(params.query || '', initialFilters, 0);
    }
  }, [filters]);

  const performSearch = async (query, filters, page) => {
    setLoading(true);
    try {
      const searchParams = {
        query,
        page,
        pageSize: 20,
        ...filters
      };

      const response = await searchFunction(searchParams);
      setResults(response.items || response.results || response);
      setTotalResults(response.totalCount || response.total || response.length || 0);
      setCurrentPage(page);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    const newParams = new URLSearchParams();
    if (query) newParams.set('query', query);
    
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (value && value.length > 0) {
        if (Array.isArray(value)) {
          newParams.set(key, value.join(','));
        } else {
          newParams.set(key, value);
        }
      }
    });
    
    setSearchParams(newParams);
    performSearch(query, activeFilters, 0);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...activeFilters, [key]: value };
    setActiveFilters(newFilters);
    
    const newParams = new URLSearchParams();
    if (searchParams.get('query')) newParams.set('query', searchParams.get('query'));
    
    Object.entries(newFilters).forEach(([filterKey, filterValue]) => {
      if (filterValue && filterValue.length > 0) {
        if (Array.isArray(filterValue)) {
          newParams.set(filterKey, filterValue.join(','));
        } else {
          newParams.set(filterKey, filterValue);
        }
      }
    });
    
    setSearchParams(newParams);
    performSearch(searchParams.get('query') || '', newFilters, 0);
  };

  const clearFilters = () => {
    setActiveFilters({});
    setSearchParams(new URLSearchParams());
    setResults([]);
    setTotalResults(0);
  };

  const handlePageChange = (page) => {
    performSearch(searchParams.get('query') || '', activeFilters, page);
  };

  const hasActiveFilters = Object.values(activeFilters).some(value => 
    value && (Array.isArray(value) ? value.length > 0 : true)
  );

  return (
    <div className="min-h-screen bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
          <p className="text-gray-300">{description}</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <SearchBar 
            onSearch={handleSearch}
            placeholder={`Search ${title.toLowerCase()}...`}
            searchTypes={searchTypes}
            defaultSearchType={defaultSearchType}
          />
        </div>

        {/* Filters Toggle */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 transition-colors text-white"
          >
            <Filter className="w-4 h-4" />
            {showFilters ? 'Hide' : 'Show'} Filters
          </button>
          
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
              Clear All
            </button>
          )}
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mb-6 p-6 bg-gray-700 rounded-lg border border-gray-600">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filters.map((filter) => (
                <div key={filter.key} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">
                    {filter.label}
                  </label>
                  {/* Filter components will be rendered here based on type */}
                  {filter.type === 'range' && (
                    <RangeFilter
                      min={filter.min}
                      max={filter.max}
                      value={activeFilters[filter.key] || filter.defaultValue}
                      onChange={(value) => handleFilterChange(filter.key, value)}
                    />
                  )}
                  {filter.type === 'multiselect' && (
                    <MultiSelectFilter
                      options={filter.options}
                      value={activeFilters[filter.key] || filter.defaultValue}
                      onChange={(value) => handleFilterChange(filter.key, value)}
                    />
                  )}
                  {filter.type === 'select' && (
                    <SelectFilter
                      options={filter.options}
                      value={activeFilters[filter.key] || filter.defaultValue}
                      onChange={(value) => handleFilterChange(filter.key, value)}
                    />
                  )}
                  {filter.type === 'text' && (
                    <TextFilter
                      placeholder={filter.placeholder}
                      value={activeFilters[filter.key] || filter.defaultValue}
                      onChange={(value) => handleFilterChange(filter.key, value)}
                    />
                  )}
                  {filter.type === 'date' && (
                    <DateFilter
                      value={activeFilters[filter.key] || filter.defaultValue}
                      onChange={(value) => handleFilterChange(filter.key, value)}
                      placeholder={filter.placeholder}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        <div className="bg-gray-700 rounded-lg border border-gray-600">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
              <p className="mt-4 text-gray-300">Searching...</p>
            </div>
          ) : results.length > 0 ? (
            <PaginatedGridContainer
              items={results}
              totalItems={totalResults}
              currentPage={currentPage}
              pageSize={20}
              onPageChange={handlePageChange}
              renderItem={(item) => <ResultComponent key={item.id} item={item} />}
            />
          ) : (
            <div className="p-8 text-center">
              <p className="text-gray-300">No results found. Try adjusting your search criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchLayout;
