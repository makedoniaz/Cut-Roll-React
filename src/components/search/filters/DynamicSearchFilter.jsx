import { useState, useCallback, useEffect } from 'react';
import FlexibleSearchInput from '../../ui/common/FlexibleSearchInput';
import keywordService from '../../../services/keywordService';
import countryService from '../../../services/countryService';

const DynamicSearchFilter = ({ label, value, onChange, placeholder, type = 'keyword' }) => {
  const [selectedItems, setSelectedItems] = useState(value || []);
  const [inputValue, setInputValue] = useState('');

  // Update selectedItems when value prop changes
  useEffect(() => {
    console.log('DynamicSearchFilter: value prop changed:', value, 'type:', type);
    if (type === 'country') {
      // For countries, convert single value to array
      const countryArray = value ? [value] : [];
      console.log('DynamicSearchFilter: Setting selectedItems for country to:', countryArray);
      setSelectedItems(countryArray);
    } else {
      // For keywords, use value directly (should already be array)
      console.log('DynamicSearchFilter: Setting selectedItems for keyword to:', value || []);
      setSelectedItems(value || []);
    }
  }, [value, type]);

  // Update input value when selected items change
  useEffect(() => {
    if (selectedItems && selectedItems.length > 0) {
      const names = selectedItems.map(item => item.name).join(', ');
      setInputValue(names);
    } else {
      setInputValue('');
    }
  }, [selectedItems]);

  // Create a stable search function for keywords and countries
  const searchFunction = useCallback(async (query) => {
    if (type === 'keyword') {
      try {
        const searchResults = await keywordService.searchKeywords({
          name: query,
          pageNumber: 0,
          pageSize: 8
        });
        
        const responseData = await searchResults.json();
        
        if (responseData && responseData.data) {
          return responseData.data.map(keyword => ({
            id: keyword.id,
            name: keyword.name,
            description: `Keyword: ${keyword.name}`,
            image: null
          }));
        }
        
        return [];
      } catch (error) {
        console.error('Keyword search error:', error);
        return [];
      }
    } else if (type === 'country') {
      try {
        const searchResults = await countryService.searchCountries({
          name: query,
          pageNumber: 1,
          pageSize: 8
        });
        
        const responseData = await searchResults.json();
        
        if (responseData && responseData.data) {
          return responseData.data.map(country => ({
            id: country.iso3166_1,
            name: country.name,
            description: `Country: ${country.iso3166_1}`,
            image: null
          }));
        }
        
        return [];
      } catch (error) {
        console.error('Country search error:', error);
        return [];
      }
    }
    
    return [];
  }, [type]);

  const handleSelectedItemsChange = (newSelectedItems) => {
    console.log('DynamicSearchFilter: handleSelectedItemsChange called with:', newSelectedItems);
    console.log('DynamicSearchFilter: Current selectedItems before update:', selectedItems);
    
    setSelectedItems(newSelectedItems);
    
    // For countries (single selection), pass the first item or null
    if (type === 'country') {
      const countryValue = newSelectedItems && newSelectedItems.length > 0 ? newSelectedItems[0] : null;
      console.log('DynamicSearchFilter: Country filter changed:', countryValue);
      console.log('DynamicSearchFilter: Calling onChange with country value:', countryValue);
      onChange(countryValue);
    } else {
      // For keywords (multiple selection), pass the array as before
      console.log('DynamicSearchFilter: Keywords changed, calling onChange with:', newSelectedItems);
      onChange(newSelectedItems);
    }
  };

  const handleClear = () => {
    console.log('DynamicSearchFilter: handleClear called');
    console.log('DynamicSearchFilter: Clearing selectedItems and calling onChange');
    
    setSelectedItems([]);
    if (type === 'country') {
      onChange(null);
    } else {
      onChange([]);
    }
    setInputValue('');
  };

  const handleInputChange = (newInputValue) => {
    console.log('DynamicSearchFilter: handleInputChange called with:', newInputValue);
    console.log('DynamicSearchFilter: Current selectedItems:', selectedItems);
    
    setInputValue(newInputValue);
    
    // Only clear selected items if the user is typing something completely different
    // and there are no matching characters with the current selection
    if (selectedItems.length > 0) {
      const currentSelectionText = selectedItems.map(item => item.name).join(', ').toLowerCase();
      const newInputLower = newInputValue.toLowerCase();
      
      // Check if the new input is completely different from current selection
      const isCompletelyDifferent = !currentSelectionText.includes(newInputLower) && 
                                   !newInputLower.includes(currentSelectionText) &&
                                   newInputLower.length > 0;
      
      console.log('DynamicSearchFilter: Input comparison:', {
        currentSelectionText,
        newInputLower,
        isCompletelyDifferent
      });
      
      if (isCompletelyDifferent) {
        console.log('DynamicSearchFilter: Clearing selected items due to completely different input');
        setSelectedItems([]);
        if (type === 'country') {
          onChange(null);
        } else {
          onChange([]);
        }
      }
    }
  };

  return (
    <div className="flex flex-col space-y-1">
      <label className="text-sm font-medium text-gray-300">{label}</label>
      <FlexibleSearchInput
        placeholder={placeholder || `Search for ${label.toLowerCase()}...`}
        searchFunction={searchFunction}
        onSelectedItemsChange={handleSelectedItemsChange}
        selectedItems={selectedItems}
        value={inputValue}
        onChange={handleInputChange}
        maxResults={8}
        debounceMs={500}
        clearable={true}
        multiple={type === 'keyword'}
        autoOpen={false}
        showSelectedItemsAsTags={false}
        onClear={handleClear}
      />
    </div>
  );
};

export default DynamicSearchFilter;
