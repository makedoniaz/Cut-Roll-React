import { useState, useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';

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
  onSelectedItemsChange,
  autoOpen = false,
  onClear,
  showSelectedItemsAsTags = true
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
  const previousValueRef = useRef(value);
  const previousSelectedItemsRef = useRef(selectedItems);

  // Update local selected items when prop changes
  useEffect(() => {
    // Always update if selectedItems prop changes (including when it becomes null/empty)
    const currentSelectedItems = selectedItems || [];
    const previousSelectedItems = previousSelectedItemsRef.current || [];
    
    if (JSON.stringify(currentSelectedItems) !== JSON.stringify(previousSelectedItems)) {
      console.log('🔄 FlexibleSearchInput selectedItems changed:', {
        from: previousSelectedItems,
        to: currentSelectedItems
      });
      setLocalSelectedItems(currentSelectedItems);
      previousSelectedItemsRef.current = currentSelectedItems;
      
      // Also clear the input value when selectedItems is cleared externally
      if (currentSelectedItems.length === 0 && previousSelectedItems.length > 0) {
        console.log('🧹 Clearing input value due to external selectedItems clear');
        setInputValue('');
      }
    }
  }, [selectedItems]);

  // Debounced search function
  // Note: searchFunction dependency removed to prevent infinite loops
  // The searchFunction should be stable (memoized in parent component)
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
  }, [maxResults]); // Removed searchFunction dependency to prevent recreation

  // Handle input change with debouncing
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange?.(newValue);

    // Open dropdown when user starts typing
    if (newValue.trim()) {
      setIsDropdownOpen(true);
    }

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
      
      // Don't clear input for multiple selection - keep it for better UX
      // setInputValue('');
      // if (onChange) onChange('');
      setIsDropdownOpen(false);
      setSearchResults([]);
    } else {
      // For single selection, update selected items and call onSelectedItemsChange
      const newSelectedItems = [item];
      setLocalSelectedItems(newSelectedItems);
      onSelectedItemsChange?.(newSelectedItems);
      
      // For single selection, set the input to show the selected item name
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
    console.log('🧹 FlexibleSearchInput clearAll called');
    console.log('🧹 Current localSelectedItems:', localSelectedItems);
    console.log('🧹 Current inputValue:', inputValue);
    
    // Only clear the input value and search results, NOT the selected items
    setInputValue('');
    setSearchResults([]);
    
    // Don't clear selected items - this allows multiple references to be maintained
    // setLocalSelectedItems([]);
    // onSelectedItemsChange?.([]);
    
    // Don't close dropdown when clearing - keep it open for new input
    if (onChange) onChange('');
    
    // Call parent's onClear function if provided
    if (onClear) {
      console.log('🧹 Calling parent onClear function');
      onClear();
    }
  };

  // Handle focus
  const handleFocus = () => {
    setIsFocused(true);
    // Only open dropdown if there are search results (user is actively searching)
    // Don't open on focus if input has value but no search results (selected item)
    if (searchResults.length > 0) {
      setIsDropdownOpen(true);
    }
  };

  // Handle blur
  const handleBlur = () => {
    setIsFocused(false);
    // Delay closing dropdown to allow for item selection
    setTimeout(() => {
      // Only close if we're not clicking on the dropdown itself or the toggle button
      if (!dropdownRef.current?.contains(document.activeElement) && 
          !inputRef.current?.contains(document.activeElement)) {
        setIsDropdownOpen(false);
      }
    }, 200);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && 
          inputRef.current && !inputRef.current.contains(event.target)) {
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

  // Update input value when external value changes (only if value prop is provided)
  useEffect(() => {
    if (value !== undefined && value !== previousValueRef.current) {
      setInputValue(value);
      previousValueRef.current = value;
    }
  }, [value]);

  return (
    <div className={`relative ${className}`}>
      {/* Selected Items Display */}
      {multiple && showSelectedItemsAsTags && localSelectedItems.length > 0 && (
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
          placeholder={placeholder}
          disabled={disabled}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-green-500 text-white placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        
        {/* Clear Button */}
        {clearable && inputValue && (
          <button
            type="button"
            onClick={clearAll}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}


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
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleItemSelect(item)}
                    className="w-full px-4 py-3 text-left transition-colors border-b border-gray-700 last:border-b-0 text-white hover:bg-gray-700"
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
                      

                    </div>
                  </button>
                );
              })}
            </div>
          ) : inputValue.trim() ? (
            <div className="px-4 py-3 text-gray-400 text-center">
              No results found
            </div>
          ) : (
            <div className="px-4 py-3 text-gray-400 text-center">
              No results yet
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FlexibleSearchInput;
