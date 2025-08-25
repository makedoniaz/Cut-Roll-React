import TextFilter from "./filters/TextFilter"
import SelectFilter from "./filters/SelectFilter"
import RangeFilter from "./filters/RangeFilter"
import MultiSelectFilter from "./filters/MultiSelectFilter"
import DynamicSearchFilter from "./filters/DynamicSearchFilter"
import { Search, Filter, X, ChevronDown } from 'lucide-react';

import { useState, useEffect } from 'react';

const FlexibleSearch = ({
  placeholder = "Search...",
  filters = [],
  onSearch,
  onFiltersChange,
  onSearchButtonPress,
  searchValue = "",
  filterValues = {},
  showFilters = true
}) => {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [localSearchValue, setLocalSearchValue] = useState(searchValue);
  const [localFilterValues, setLocalFilterValues] = useState(filterValues);

  // Sync local state with prop changes
  useEffect(() => {
    console.log('FlexibleSearch: filterValues prop changed:', filterValues);
    console.log('FlexibleSearch: Setting localFilterValues to:', filterValues);
    setLocalFilterValues(filterValues);
  }, [filterValues]);

  useEffect(() => {
    setLocalSearchValue(searchValue);
  }, [searchValue]);

  const handleSearchChange = (value) => {
    setLocalSearchValue(value);
    onSearch?.(value);
  };

  const handleFilterChange = (filterKey, value) => {
    console.log(`FlexibleSearch: Filter ${filterKey} changed to:`, value);
    console.log(`FlexibleSearch: Current localFilterValues:`, localFilterValues);
    
    const newFilterValues = { ...localFilterValues, [filterKey]: value };
    setLocalFilterValues(newFilterValues);
    
    console.log(`FlexibleSearch: Calling onFiltersChange with:`, newFilterValues);
    onFiltersChange?.(newFilterValues);
  };

  const handleSearchButtonClick = () => {
    onSearchButtonPress?.();
  };

  const clearFilters = () => {
    const clearedFilters = {};
    filters.forEach(filter => {
      switch (filter.type) {
        case 'multiselect':
          clearedFilters[filter.key] = filter.defaultValue || [];
          break;
        case 'dynamicsearch':
          // For dynamicsearch, check if it's a country (single object) or keyword (array)
          if (filter.searchType === 'country') {
            clearedFilters[filter.key] = filter.defaultValue || null;
          } else {
            clearedFilters[filter.key] = filter.defaultValue || [];
          }
          break;
        case 'range':
          clearedFilters[filter.key] = filter.defaultValue || [filter.min || 0, filter.max || 100];
          break;
        case 'select':
          // Handle boolean values properly for select filters
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
    setLocalFilterValues(clearedFilters);
    onFiltersChange?.(clearedFilters);
  };

  const hasActiveFilters = filters.some(filter => {
    const currentValue = localFilterValues[filter.key];
    const defaultValue = filter.defaultValue || (filter.type === 'multiselect' ? [] : filter.type === 'range' ? [filter.min || 0, filter.max || 100] : '');
    
    if (filter.type === 'multiselect') {
      return currentValue && currentValue.length > 0;
    } else if (filter.type === 'dynamicsearch') {
      // For dynamicsearch, check if it's a country (single object) or keyword (array)
      if (filter.searchType === 'country') {
        return currentValue !== null && currentValue !== undefined;
      } else {
        // For keywords, check if array has items
        return currentValue && currentValue.length > 0;
      }
    } else if (filter.type === 'range') {
      const current = currentValue || defaultValue;
      return current[0] !== defaultValue[0] || current[1] !== defaultValue[1];
    } else if (filter.type === 'select' && filter.defaultValue !== undefined) {
      // Handle boolean values properly for select filters with default values
      return currentValue !== defaultValue;
    } else {
      return currentValue && currentValue !== defaultValue && currentValue !== '';
    }
  });

  const renderFilter = (filter) => {
    let value;
    if (filter.type === 'select' && filter.defaultValue !== undefined) {
      // For select filters with default values, check if the value exists in localFilterValues
      // Use the local value if it exists, otherwise fall back to default
      value = localFilterValues.hasOwnProperty(filter.key) ? localFilterValues[filter.key] : filter.defaultValue;
    } else if (filter.type === 'dynamicsearch') {
      // For dynamicsearch, check if it's a country (single object) or keyword (array)
      if (filter.searchType === 'country') {
        value = localFilterValues[filter.key] || filter.defaultValue || null;
      } else {
        // For keywords, use array logic
        value = localFilterValues[filter.key] || filter.defaultValue || [];
      }
    } else {
      // For other filter types, use the existing logic
      value = localFilterValues[filter.key] || filter.defaultValue || (filter.type === 'multiselect' ? [] : filter.type === 'range' ? [filter.min || 0, filter.max || 100] : '');
    }

    const commonProps = {
      label: filter.label,
      value: value,
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
      case 'dynamicsearch':
        return <DynamicSearchFilter key={filter.key} {...commonProps} type={filter.searchType} />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-4xl">
      {/* Search Input and Search Button */}
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
          onClick={handleSearchButtonClick}
          className="cursor-pointer px-4 py-3 bg-green-600 hover:bg-green-700 border border-green-600 rounded-r-lg transition-colors"
        >
          <Search className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Show Filters Button */}
      {showFilters && filters.length > 0 && (
        <div className="mb-4">
          <button
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className="cursor-pointer flex items-center space-x-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors text-white"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isFiltersOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      )}

      {/* Clear Filters Button */}
      {showFilters && filters.length > 0 && hasActiveFilters && (
        <div className="mb-4">
          <button
            onClick={clearFilters}
            className="flex items-center space-x-2 px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
            <span>Clear Filters</span>
          </button>
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && filters.length > 0 && (
        <div className={`bg-gray-900 border border-gray-700 rounded-lg transition-all duration-300 ease-in-out transform relative ${
            isFiltersOpen 
            ? 'opacity-100 max-h-96 translate-y-0 z-50 p-6 mb-4' 
            : 'opacity-0 max-h-0 -translate-y-2 overflow-hidden p-0'
        }`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filters.map(renderFilter)}
          </div>
        </div>
      )}
    </div>
  );
};

export default FlexibleSearch;