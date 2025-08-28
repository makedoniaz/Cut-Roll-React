import { useState, useCallback, useEffect, useRef } from 'react';
import { ChevronDown, Check, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import FlexibleSearchInput from '../../ui/common/FlexibleSearchInput';
import { NewsService } from '../../../services/newsService';
import { REFERENCE_TYPES } from '../../../constants/news';

const ReferenceTypeFilter = ({ label, value, onChange, placeholder }) => {
  const [selectedReferenceType, setSelectedReferenceType] = useState(null);
  const [selectedReferences, setSelectedReferences] = useState([]);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [typeDropdownPosition, setTypeDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const typeSelectRef = useRef(null);
  const typeDropdownRef = useRef(null);

  // Reference type options based on REFERENCE_TYPES
  const referenceTypeOptions = [
    { value: REFERENCE_TYPES.MOVIE, label: 'Movies' },
    { value: REFERENCE_TYPES.PEOPLE, label: 'People' },
    { value: REFERENCE_TYPES.GENRE, label: 'Genres' },
    { value: REFERENCE_TYPES.PRODUCTION_COMPANY, label: 'Production Companies' },
    { value: REFERENCE_TYPES.KEYWORD, label: 'Keywords' },
    { value: REFERENCE_TYPES.NEWS, label: 'News' }
  ];

  // Update selectedReferences when value prop changes
  useEffect(() => {
    console.log('🔄 useEffect triggered - value prop changed:', value);
    if (value && Array.isArray(value)) {
      console.log('🔄 Setting selectedReferences from value prop:', value);
      setSelectedReferences(value);
      
      // Extract reference type from the first reference if available
      if (value.length > 0 && value[0].referenceType !== undefined) {
        console.log('🔄 Setting selectedReferenceType from value prop:', value[0].referenceType);
        setSelectedReferenceType(value[0].referenceType);
      }
    } else {
      console.log('🔄 Clearing selectedReferences (value is falsy or not array)');
      setSelectedReferences([]);
    }
    
    // Only reset the selected reference type if we had a previous value and it's now cleared
    // This prevents the effect from clearing the reference type on initial render
    if (selectedReferences.length > 0 && (!value || (Array.isArray(value) && value.length === 0))) {
      console.log('🔄 Resetting selectedReferenceType to null');
      setSelectedReferenceType(null);
    }
  }, [value, selectedReferences.length]);

  // Close type dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isOutsideSelect = typeSelectRef.current && !typeSelectRef.current.contains(event.target);
      const isOutsideDropdown = typeDropdownRef.current && !typeDropdownRef.current.contains(event.target);
      
      if (isOutsideSelect && isOutsideDropdown) {
        setIsTypeDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calculate dropdown position when opening
  useEffect(() => {
    if (isTypeDropdownOpen && typeSelectRef.current) {
      const selectRect = typeSelectRef.current.getBoundingClientRect();
      setTypeDropdownPosition({
        top: selectRect.bottom + 4,
        left: selectRect.left,
        width: selectRect.width
      });
    }
  }, [isTypeDropdownOpen]);

  // Create search function based on selected reference type
  const searchFunction = useCallback(async (query) => {
    console.log('🔍 ReferenceTypeFilter searchFunction called with:', { query, selectedReferenceType });
    
    if (selectedReferenceType === null) {
      console.log('❌ No reference type selected, returning empty array');
      return [];
    }

    try {
      let searchResults;

      switch (selectedReferenceType) {
        case REFERENCE_TYPES.MOVIE:
          console.log('🎬 Searching for movies with query:', query);
          searchResults = await NewsService.searchMovieReference({
            title: query,
            page: 1,
            pageSize: 8
          });
          console.log('🎬 Movie search results:', searchResults);
          if (searchResults && searchResults.data) {
            console.log('🎬 First movie data structure:', searchResults.data[0]);
            return searchResults.data.map(movie => ({
              id: movie.movieId || movie.id, // Use movieId if available, fallback to id
              name: movie.title,
              description: `Movie: ${movie.title}`,
              image: movie.poster?.filePath ? `https://image.tmdb.org/t/p/w185${movie.poster.filePath}` : null
            }));
          }
          break;

        case REFERENCE_TYPES.PEOPLE:
          console.log('👥 Searching for people with query:', query);
          searchResults = await NewsService.searchPersonReference({
            name: query,
            pageNumber: 1,
            pageSize: 8
          });
          console.log('👥 People search results:', searchResults);
          if (searchResults && searchResults.data) {
            return searchResults.data.map(person => ({
              id: person.id,
              name: person.name,
              description: `Person: ${person.name}`,
              image: person.profilePath ? `https://image.tmdb.org/t/p/w185${person.profilePath}` : null
            }));
          }
          break;

        case REFERENCE_TYPES.GENRE:
          console.log('🎭 Searching for genres with query:', query);
          searchResults = await NewsService.searchGenreReference({
            name: query,
            pageNumber: 0,
            pageSize: 8
          });
          console.log('🎭 Genre search results:', searchResults);
          if (searchResults && searchResults.data) {
            return searchResults.data.map(genre => ({
              id: genre.id,
              name: genre.name,
              description: `Genre: ${genre.name}`,
              image: null
            }));
          }
          break;

        case REFERENCE_TYPES.PRODUCTION_COMPANY:
          console.log('🏢 Searching for production companies with query:', query);
          searchResults = await NewsService.searchProductionCompanyReference({
            name: query,
            pageNumber: 1,
            pageSize: 8
          });
          console.log('🏢 Production company search results:', searchResults);
          if (searchResults && searchResults.data) {
            return searchResults.data.map(company => ({
              id: company.id,
              name: company.name,
              description: `Production Company: ${company.name}`,
              image: null
            }));
          }
          break;

        case REFERENCE_TYPES.KEYWORD:
          console.log('🔑 Searching for keywords with query:', query);
          searchResults = await NewsService.searchKeywordReference({
            name: query,
            pageNumber: 0,
            pageSize: 8
          });
          console.log('🔑 Keyword search results:', searchResults);
          if (searchResults && searchResults.data) {
            return searchResults.data.map(keyword => ({
              id: keyword.id,
              name: keyword.name,
              description: `Keyword: ${keyword.name}`,
              image: null
            }));
          }
          break;

        case REFERENCE_TYPES.NEWS:
          console.log('📰 Searching for news with query:', query);
          // Use filterNews method instead of searchNews
          searchResults = await NewsService.filterNews({
            query: query,
            page: 0,
            pageSize: 8
          });
          console.log('📰 News search results:', searchResults);
          if (searchResults && searchResults.data) {
            return searchResults.data.map(news => ({
              id: news.id,
              name: news.title,
              description: `News: ${news.title}`,
              image: news.photoUrl || null
            }));
          }
          break;

        default:
          console.log('❓ Unknown reference type:', selectedReferenceType);
          return [];
      }
    } catch (error) {
      console.error('❌ Reference search error:', error);
      return [];
    }

    console.log('⚠️ No results found for reference type:', selectedReferenceType);
    return [];
  }, [selectedReferenceType]);

  const handleReferenceTypeSelect = (typeValue) => {
    console.log('🔄 handleReferenceTypeSelect called with:', typeValue);
    console.log('🔄 REFERENCE_TYPES.MOVIE value:', REFERENCE_TYPES.MOVIE);
    console.log('🔄 REFERENCE_TYPES.PEOPLE value:', REFERENCE_TYPES.PEOPLE);
    console.log('🔄 Is typeValue === REFERENCE_TYPES.MOVIE?', typeValue === REFERENCE_TYPES.MOVIE);
    console.log('🔄 Current selectedReferences before change:', selectedReferences);
    
    setSelectedReferenceType(typeValue);
    // Don't clear selected references when changing reference type
    // setSelectedReferences([]);
    setIsTypeDropdownOpen(false);
    // Don't clear the parent filter value when reference type changes
    // onChange([]);
    
    console.log('🔄 Reference type changed, selectedReferences preserved:', selectedReferences);
  };

  const handleReferencesChange = (newReferences) => {
    console.log('🔄 handleReferencesChange called with:', newReferences);
    console.log('🔄 Current selectedReferences state:', selectedReferences);
    console.log('🔄 Length comparison - new:', newReferences.length, 'current:', selectedReferences.length);
    console.log('🔄 JSON comparison - are they equal?', JSON.stringify(newReferences) === JSON.stringify(selectedReferences));
    
    // Add referenceType to each reference object
    const referencesWithType = newReferences.map(ref => ({
      ...ref,
      referenceType: selectedReferenceType
    }));
    
    setSelectedReferences(referencesWithType);
    onChange(referencesWithType);
    
    console.log('🔄 State updated, new selectedReferences with type:', referencesWithType);
  };

  const handleClear = () => {
    console.log('🔄 handleClear called');
    console.log('🔄 Current selectedReferences before clear:', selectedReferences);
    
    setSelectedReferenceType(null);
    setSelectedReferences([]);
    onChange([]);
    
    console.log('🔄 All references cleared');
  };

  const removeSelectedReference = (referenceToRemove) => {
    console.log('🔄 removeSelectedReference called with:', referenceToRemove);
    console.log('🔄 Current selectedReferences before removal:', selectedReferences);
    
    const newReferences = selectedReferences.filter(ref => ref.id !== referenceToRemove.id);
    console.log('🔄 New references after removal:', newReferences);
    
    // Ensure referenceType is preserved in remaining references
    const referencesWithType = newReferences.map(ref => ({
      ...ref,
      referenceType: ref.referenceType || selectedReferenceType
    }));
    
    setSelectedReferences(referencesWithType);
    onChange(referencesWithType);
  };

  const selectedTypeOption = referenceTypeOptions.find(opt => opt.value === selectedReferenceType);

  // Render type dropdown using portal
  const renderTypeDropdown = () => {
    if (!isTypeDropdownOpen) return null;

    return createPortal(
      <div
        ref={typeDropdownRef}
        className="fixed z-[9999] bg-gray-800 border border-gray-700 rounded-md shadow-lg max-h-48 overflow-y-auto"
        style={{
          top: typeDropdownPosition.top,
          left: typeDropdownPosition.left,
          width: typeDropdownPosition.width,
        }}
      >
        <button
          type="button"
          onClick={() => handleReferenceTypeSelect(null)}
          className="w-full px-3 py-2 text-left hover:bg-gray-700 text-gray-400 border-b border-gray-700"
        >
          {placeholder || 'Select reference type...'}
        </button>
        {referenceTypeOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => handleReferenceTypeSelect(option.value)}
            className={`w-full px-3 py-2 text-left hover:bg-gray-700 transition-colors flex items-center justify-between ${
              option.value === selectedReferenceType ? 'bg-gray-700 text-green-400' : 'text-white'
            }`}
          >
            <span>{option.label}</span>
            {option.value === selectedReferenceType ? (
              <Check className="w-4 h-4" />
            ) : null}
          </button>
        ))}
      </div>,
      document.body
    );
  };

  return (
    <div className="flex flex-col space-y-3">
      <label className="text-sm font-medium text-gray-300">{label}</label>
      
      {/* Reference Type Selector */}
      <div className="flex flex-col space-y-1" ref={typeSelectRef}>
        <label className="text-xs text-gray-400">Reference Type</label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
            className="w-full px-3 py-3 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:border-green-500 text-white text-left flex justify-between items-center"
          >
            <span className={selectedTypeOption ? 'text-white' : 'text-gray-400'}>
              {selectedTypeOption ? selectedTypeOption.label : 'Select reference type...'}
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isTypeDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          {renderTypeDropdown()}
        </div>
      </div>

      {/* Reference Search Input */}
      {selectedReferenceType !== null && (
        <div className="flex flex-col space-y-1">
          <label className="text-xs text-gray-400">Search References</label>
          {console.log('🔍 Rendering FlexibleSearchInput with selectedReferenceType:', selectedReferenceType)}
          {console.log('🔍 searchFunction:', searchFunction)}
          {console.log('🔍 selectedReferences being passed to FlexibleSearchInput:', selectedReferences)}
          <FlexibleSearchInput
            key={`reference-search-${selectedReferenceType}`}
            placeholder={`Search for ${selectedTypeOption?.label.toLowerCase()}...`}
            searchFunction={searchFunction}
            onSelectedItemsChange={handleReferencesChange}
            selectedItems={selectedReferences}
            value=""
            onChange={() => {}} // We don't need input change handling here
            maxResults={8}
            debounceMs={500}
            clearable={true}
            multiple={true}
            autoOpen={false}
            showSelectedItemsAsTags={false} // Disable tags display in FlexibleSearchInput
            onClear={() => handleReferencesChange([])}
          />
        </div>
      )}

      {/* Selected References Display - Moved above Clear References button */}
      {selectedReferences.length > 0 && (
        <div className="flex flex-col space-y-2">
          <label className="text-xs text-gray-400">Selected References</label>
          <div className="flex flex-wrap gap-2">
            {selectedReferences.map((reference) => (
              <div
                key={reference.id}
                className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded-full text-sm"
              >
                <span>{reference.name || reference.title || reference.label}</span>
                <button
                  type="button"
                  onClick={() => removeSelectedReference(reference)}
                  className="hover:bg-green-700 rounded-full p-1 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clear All Button */}
      {(selectedReferenceType !== null || selectedReferences.length > 0) && (
        <button
          onClick={handleClear}
          className="flex items-center justify-center space-x-2 px-3 py-2 text-gray-300 hover:text-white transition-colors border border-gray-600 rounded-md hover:border-gray-500 bg-gray-800 hover:bg-gray-700 text-sm"
        >
          <X className="w-4 h-4" />
          <span>Clear References</span>
        </button>
      )}
    </div>
  );
};

export default ReferenceTypeFilter;
