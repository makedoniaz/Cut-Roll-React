import { useState, useCallback, useEffect } from 'react';
import FlexibleSearchInput from '../../ui/common/FlexibleSearchInput';
import keywordService from '../../../services/keywordService';
import countryService from '../../../services/countryService';
import languageService from '../../../services/languageService';
import personService from '../../../services/personService';
import productionCompanyService from '../../../services/productionCompanyService';
import { UserService } from '../../../services/userService';
import { API_CONFIG } from '../../../constants/index.js';

const DynamicSearchFilter = ({ label, value, onChange, placeholder, type = 'keyword' }) => {
  const [selectedItems, setSelectedItems] = useState(value || []);
  const [inputValue, setInputValue] = useState('');

  // Update selectedItems when value prop changes
  useEffect(() => {
    console.log('DynamicSearchFilter: value prop changed:', value, 'type:', type);
    if (type === 'country' || type === 'language' || type === 'actor' || type === 'director' || type === 'productionCompany' || type === 'people') {
      // For countries, languages, actors, directors, production companies, and people, convert single value to array
      const singleValueArray = value ? [value] : [];
      console.log(`DynamicSearchFilter: Setting selectedItems for ${type} to:`, singleValueArray);
      setSelectedItems(singleValueArray);
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

  // Create a stable search function for keywords, countries, and languages
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
    } else if (type === 'language') {
      try {
        const searchResults = await languageService.searchLanguage(query, 1, 8);
        
        const responseData = await searchResults.json();
        
        if (responseData && responseData.data) {
          return responseData.data.map(language => ({
            id: language.id,
            name: language.englishName || language.name, // Use englishName if available, fallback to name
            description: `Language: ${language.englishName || language.name}`,
            image: null
          }));
        }
        
        return [];
      } catch (error) {
        console.error('Language search error:', error);
        return [];
      }
         } else if (type === 'actor') {
       try {
         // Use personService.searchPeople with role: 0 for cast members
         const searchResults = await personService.searchPeople({
           name: query,
           role: 0, // 0 for cast members
           pageNumber: 1,
           pageSize: 8
         });
         
         const responseData = await searchResults.json();
         
         // Debug: Log the actual profilePath values
         console.log('Actor search response data:', responseData.data);
         if (responseData.data && responseData.data.length > 0) {
           console.log('First actor profilePath:', responseData.data[0].profilePath);
         }
         
         if (responseData && responseData.data) {
           return responseData.data.map(person => {
             // Check if profilePath is already a full URL
             let imageUrl = null;
             if (person.profilePath) {
               if (person.profilePath.startsWith('http')) {
                 // Already a full URL
                 imageUrl = person.profilePath;
               } else {
                 // Relative path, construct TMDB URL
                 imageUrl = `${API_CONFIG.TMDB_IMAGE_BASE_URL}/w185${person.profilePath}`;
               }
             }
             
             console.log('Constructed image URL:', imageUrl);
             
             return {
               id: person.id,
               name: person.name,
               description: `Actor: ${person.name}`,
               image: imageUrl
             };
           });
         }
         
         return [];
       } catch (error) {
         console.error('Actor search error:', error);
         return [];
       }
     } else if (type === 'director') {
       try {
         // Use personService.searchPeople with role: 1 for crew members
         const searchResults = await personService.searchPeople({
           name: query,
           role: 1, // 1 for crew members
           pageNumber: 1,
           pageSize: 8
         });
         
         const responseData = await searchResults.json();
         
         // Debug: Log the actual profilePath values
         console.log('Crew search response data:', responseData.data);
         if (responseData.data && responseData.data.length > 0) {
           console.log('First crew member profilePath:', responseData.data[0].profilePath);
         }
         
         if (responseData && responseData.data) {
           return responseData.data.map(person => {
             // Check if profilePath is already a full URL
             let imageUrl = null;
             if (person.profilePath) {
               if (person.profilePath.startsWith('http')) {
                 // Already a full URL
                 imageUrl = person.profilePath;
               } else {
                 // Relative path, construct TMDB URL
                 imageUrl = `${API_CONFIG.TMDB_IMAGE_BASE_URL}/w185${person.profilePath}`;
               }
             }
             
             console.log('Constructed image URL:', imageUrl);
             
             return {
               id: person.id,
               name: person.name,
               description: `Crew: ${person.name}`,
               image: imageUrl
             };
           });
         }
         
         return [];
       } catch (error) {
         console.error('Crew search error:', error);
         return [];
       }
     } else if (type === 'productionCompany') {
       try {
         const searchResults = await productionCompanyService.searchProductionCompanies({
           name: query,
           pageSize: 8
         });
         
         const responseData = await searchResults.json();
         
         if (responseData && responseData.data) {
           return responseData.data.map(company => ({
             id: company.id,
             name: company.name,
             description: `Production Company: ${company.name}`,
             image: null
           }));
         }
         
         return [];
       } catch (error) {
         console.error('Production Company search error:', error);
         return [];
       }
     } else if (type === 'people') {
       try {
         const searchResults = await UserService.searchUsers({
           searchTerm: query,
           pageNumber: 1,
           pageSize: 8
         });
         
         console.log('People search response:', searchResults);
         
         if (searchResults && searchResults.data) {
           return searchResults.data.map(user => {
             console.log('Processing user:', user);
             console.log('User avatarPath:', user.avatarPath);
             
             return {
               id: user.id,
               name: user.username || 'Unknown User',
               description: user.username || 'Unknown User',
               image: user.avatarPath || null
             };
           });
         }
         
         return [];
       } catch (error) {
         console.error('People search error:', error);
         return [];
       }
     }
    
    return [];
  }, [type]);

  const handleSelectedItemsChange = (newSelectedItems) => {
    console.log('DynamicSearchFilter: handleSelectedItemsChange called with:', newSelectedItems);
    console.log('DynamicSearchFilter: Current selectedItems before update:', selectedItems);
    
    setSelectedItems(newSelectedItems);
    
    // For countries, languages, actors, directors, production companies, and people (single selection), pass the first item or null
    if (type === 'country' || type === 'language' || type === 'actor' || type === 'director' || type === 'productionCompany' || type === 'people') {
      const singleValue = newSelectedItems && newSelectedItems.length > 0 ? newSelectedItems[0] : null;
      console.log(`DynamicSearchFilter: ${type} filter changed:`, singleValue);
      console.log(`DynamicSearchFilter: Calling onChange with ${type} value:`, singleValue);
      onChange(singleValue);
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
    if (type === 'country' || type === 'language' || type === 'actor' || type === 'director' || type === 'productionCompany' || type === 'people') {
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
          if (type === 'country' || type === 'language' || type === 'actor' || type === 'director' || type === 'productionCompany' || type === 'people') {
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
