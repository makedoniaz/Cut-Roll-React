import TextFilter from "./filters/TextFilter"
import SelectFilter from "./filters/SelectFilter"
import RangeFilter from "./filters/RangeFilter"
import MultiSelectFilter from "./filters/MultiSelectFilter"
import { Search, Filter, X, ChevronDown } from 'lucide-react';

import { useState } from 'react';

const FlexibleSearch = ({
  placeholder = "Search...",
  filters = [],
  onSearch,
  onFiltersChange,
  searchValue = "",
  filterValues = {},
  showFilters = true
}) => {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [localSearchValue, setLocalSearchValue] = useState(searchValue);
  const [localFilterValues, setLocalFilterValues] = useState(filterValues);

  const handleSearchChange = (value) => {
    setLocalSearchValue(value);
    onSearch?.(value);
  };

  const handleFilterChange = (filterKey, value) => {
    const newFilterValues = { ...localFilterValues, [filterKey]: value };
    setLocalFilterValues(newFilterValues);
    onFiltersChange?.(newFilterValues);
  };

  const clearFilters = () => {
    const clearedFilters = {};
    filters.forEach(filter => {
      switch (filter.type) {
        case 'multiselect':
          clearedFilters[filter.key] = filter.defaultValue || [];
          break;
        case 'range':
          clearedFilters[filter.key] = filter.defaultValue || [filter.min || 0, filter.max || 100];
          break;
        default:
          clearedFilters[filter.key] = filter.defaultValue || '';
      }
    });
    setLocalFilterValues(clearedFilters);
    onFiltersChange?.(clearedFilters);
  };

  const hasActiveFilters = filters.some(filter => {
    const currentValue = localFilterValues[filter.key];
    const defaultValue = filter.defaultValue || (filter.type === 'multiselect' ? [] : filter.type === 'range' ? [filter.min || 0, filter.max || 100] : '');
    
    if (filter.type === 'multiselect') {
      return currentValue && currentValue.length > 0;
    } else if (filter.type === 'range') {
      const current = currentValue || defaultValue;
      return current[0] !== defaultValue[0] || current[1] !== defaultValue[1];
    } else {
      return currentValue && currentValue !== defaultValue && currentValue !== '';
    }
  });

  const renderFilter = (filter) => {
    const commonProps = {
      label: filter.label,
      value: localFilterValues[filter.key] || filter.defaultValue || (filter.type === 'multiselect' ? [] : filter.type === 'range' ? [filter.min || 0, filter.max || 100] : ''),
      onChange: (value) => handleFilterChange(filter.key, value)
    };

    switch (filter.type) {
      case 'text':
        return <TextFilter key={filter.key} {...commonProps} placeholder={filter.placeholder} />;
      case 'select':
        return <SelectFilter key={filter.key} {...commonProps} options={filter.options} placeholder={filter.placeholder} />;
      case 'range':
        return <RangeFilter key={filter.key} {...commonProps} min={filter.min} max={filter.max} step={filter.step} />;
      case 'multiselect':
        return <MultiSelectFilter key={filter.key} {...commonProps} options={filter.options} />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-4xl">
      {/* Search Input */}
      <div className="relative mb-4 flex">
        <input
          type="text"
          placeholder={placeholder}
          value={localSearchValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-l-lg focus:outline-none focus:border-green-500 text-white placeholder-gray-400"
        />
        <button
          type="button"
          className="cursor-pointer px-4 py-3 bg-green-600 hover:bg-green-700 border border-green-600 rounded-r-lg transition-colors"
        >
          <Search className="w-5 h-5 text-white" />
        </button>
      </div>


      {/* Filter Toggle and Clear */}
      {showFilters && filters.length > 0 && (
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className="cursor-pointer flex items-center space-x-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors text-white"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isFiltersOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center space-x-2 px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Clear Filters</span>
            </button>
          )}
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && filters.length > 0 && (
        <div className={`bg-gray-900 border border-gray-700 rounded-lg transition-all duration-300 ease-in-out transform relative ${
            isFiltersOpen 
            ? 'opacity-100 max-h-96 translate-y-0 z-50 p-6 mb-4' 
            : 'opacity-0 max-h-0 -translate-y-2 overflow-hidden p-0'
        }`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filters.map(renderFilter)}
          </div>
        </div>
      )}
    </div>
  );
};

export default FlexibleSearch;