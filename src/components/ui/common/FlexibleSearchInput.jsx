import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronDown, X, Search } from 'lucide-react';

const FlexibleSearchInput = ({
  placeholder = "Search...",
  searchFunction,
  onSelect,
  value = "",
  onChange,
  className = "",
  maxResults = 10,
  debounceMs = 3000,
  disabled = false,
  clearable = true,
  multiple = false,
  selectedItems = [],
  onSelectedItemsChange
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [searchResults, setSearchResults] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [localSelectedItems, setLocalSelectedItems] = useState(selectedItems);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [isFocused, setIsFocused] = useState(false);
  
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Update local selected items when prop changes
  useEffect(() => {
    setLocalSelectedItems(selectedItems);
  }, [selectedItems]);

  // Debounced search function
  const performSearch = useCallback(async (query) => {
    if (!query.trim() || !searchFunction) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const results = await searchFunction(query);
      setSearchResults(Array.isArray(results) ? results.slice(0, maxResults) : []);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchFunction, maxResults]);

  // Handle input change with debouncing
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange?.(newValue);

    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set new timeout for search
    const timeout = setTimeout(() => {
      performSearch(newValue);
    }, debounceMs);

    setSearchTimeout(timeout);
  };

  // Handle item selection
  const handleItemSelect = (item) => {
    if (multiple) {
      // For multiple selection, add to selected items
      const newSelectedItems = [...localSelectedItems];
      const existingIndex = newSelectedItems.findIndex(selected => selected.id === item.id);
      
      if (existingIndex === -1) {
        newSelectedItems.push(item);
      } else {
        // Remove if already selected (toggle behavior)
        newSelectedItems.splice(existingIndex, 1);
      }
      
      setLocalSelectedItems(newSelectedItems);
      onSelectedItemsChange?.(newSelectedItems);
      
      // Clear input and close dropdown
      setInputValue('');
      onChange?.('');
      setIsDropdownOpen(false);
      setSearchResults([]);
    } else {
      // For single selection, call onSelect
      if (onSelect) {
        onSelect(item);
      }
      
      setInputValue(item.name || item.title || item.label || '');
      setIsDropdownOpen(false);
      setSearchResults([]);
    }
  };

  // Remove selected item
  const removeSelectedItem = (itemToRemove) => {
    const newSelectedItems = localSelectedItems.filter(item => item.id !== itemToRemove.id);
    setLocalSelectedItems(newSelectedItems);
    onSelectedItemsChange?.(newSelectedItems);
  };

  // Clear all
  const clearAll = () => {
    setInputValue('');
    setLocalSelectedItems([]);
    onSelectedItemsChange?.([]);
    setSearchResults([]);
    setIsDropdownOpen(false);
    onChange?.('');
  };

  // Handle focus
  const handleFocus = () => {
    setIsFocused(true);
    if (inputValue.trim()) {
      setIsDropdownOpen(true);
    }
  };

  // Handle blur
  const handleBlur = () => {
    setIsFocused(false);
    // Delay closing dropdown to allow for item selection
    setTimeout(() => {
      setIsDropdownOpen(false);
    }, 200);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  // Update input value when external value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  return (
    <div className={`relative ${className}`}>
      {/* Selected Items Display */}
      {multiple && localSelectedItems.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {localSelectedItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded-full text-sm"
            >
              <span>{item.name || item.title || item.label}</span>
              <button
                type="button"
                onClick={() => removeSelectedItem(item)}
                className="hover:bg-green-700 rounded-full p-1 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Container */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={multiple ? `${placeholder} (select multiple)` : placeholder}
          disabled={disabled}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-green-500 text-white placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        
        {/* Search Icon */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <Search className="w-5 h-5" />
        </div>

        {/* Clear Button */}
        {clearable && (inputValue || (multiple && localSelectedItems.length > 0)) && (
          <button
            type="button"
            onClick={clearAll}
            className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Dropdown Toggle */}
        <button
          type="button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
        >
          <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Dropdown */}
      {isDropdownOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {isLoading ? (
            <div className="px-4 py-3 text-gray-400 text-center">
              Searching...
            </div>
          ) : searchResults.length > 0 ? (
            <div>
              {searchResults.map((item) => {
                const isSelected = localSelectedItems.find(selected => selected.id === item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleItemSelect(item)}
                    className={`w-full px-4 py-3 text-left transition-colors border-b border-gray-700 last:border-b-0 ${
                      isSelected 
                        ? 'bg-green-600 text-white' 
                        : 'text-white hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Item Icon/Image if available */}
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name || item.title}
                          className="w-8 h-8 rounded object-cover"
                        />
                      )}
                      
                      {/* Item Content */}
                      <div className="flex-1">
                        <div className="font-medium">
                          {item.name || item.title || item.label}
                        </div>
                        {item.description && (
                          <div className="text-sm text-gray-400">
                            {item.description}
                          </div>
                        )}
                      </div>
                      
                      {/* Selection indicator for multiple mode */}
                      {multiple && isSelected && (
                        <div className="text-green-300">
                          <X className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : inputValue.trim() && !isLoading ? (
            <div className="px-4 py-3 text-gray-400 text-center">
              No results found
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default FlexibleSearchInput;
