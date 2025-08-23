import { useState, useCallback, useEffect } from 'react';
import FlexibleSearchInput from '../../ui/common/FlexibleSearchInput';
import keywordService from '../../../services/keywordService';

const DynamicSearchFilter = ({ label, value, onChange, placeholder, type = 'keyword' }) => {
  const [selectedItems, setSelectedItems] = useState(value || []);
  const [inputValue, setInputValue] = useState('');

  // Update input value when selected items change
  useEffect(() => {
    if (selectedItems && selectedItems.length > 0) {
      const keywordNames = selectedItems.map(item => item.name).join(', ');
      setInputValue(keywordNames);
    } else {
      setInputValue('');
    }
  }, [selectedItems]);

  // Create a stable search function for keywords
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
    }
    
    return [];
  }, [type]);

  const handleSelectedItemsChange = (newSelectedItems) => {
    setSelectedItems(newSelectedItems);
    onChange(newSelectedItems);
  };

  const handleClear = () => {
    setSelectedItems([]);
    onChange([]);
    setInputValue('');
  };

  const handleInputChange = (newInputValue) => {
    setInputValue(newInputValue);
    
    // If user is typing and there are selected items, clear them
    // This allows users to start a new search
    if (selectedItems.length > 0 && newInputValue !== selectedItems.map(item => item.name).join(', ')) {
      setSelectedItems([]);
      onChange([]);
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
        multiple={true}
        autoOpen={false}
        showSelectedItemsAsTags={false}
        onClear={handleClear}
      />
    </div>
  );
};

export default DynamicSearchFilter;
