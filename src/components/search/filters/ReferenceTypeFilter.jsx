import { useState, useCallback, useEffect, useRef } from 'react';
import { ChevronDown, Check, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import FlexibleSearchInput from '../../ui/common/FlexibleSearchInput';
import { MovieService } from '../../../services/movieService';
import personService from '../../../services/personService';
import genreService from '../../../services/genreService';
import productionCompanyService from '../../../services/productionCompanyService';
import keywordService from '../../../services/keywordService';
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
    if (value && Array.isArray(value)) {
      setSelectedReferences(value);
    } else {
      setSelectedReferences([]);
    }
  }, [value]);

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
    if (!selectedReferenceType) return [];

    try {
      let searchResults;

      switch (selectedReferenceType) {
        case REFERENCE_TYPES.MOVIE:
          searchResults = await MovieService.searchMovies({
            title: query,
            page: 1,
            pageSize: 8
          });
          if (searchResults && searchResults.data) {
            return searchResults.data.map(movie => ({
              id: movie.id,
              name: movie.title,
              description: `Movie: ${movie.title} (${movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : 'N/A'})`,
              image: movie.posterPath ? `https://image.tmdb.org/t/p/w185${movie.posterPath}` : null
            }));
          }
          break;

        case REFERENCE_TYPES.PEOPLE:
          searchResults = await personService.searchPeople({
            name: query,
            pageNumber: 1,
            pageSize: 8
          });
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
          searchResults = await genreService.searchGenres({
            name: query,
            pageNumber: 0,
            pageSize: 8
          });
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
          searchResults = await productionCompanyService.searchProductionCompanies({
            name: query,
            pageNumber: 1,
            pageSize: 8
          });
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
          searchResults = await keywordService.searchKeywords({
            name: query,
            pageNumber: 0,
            pageSize: 8
          });
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
          // Use filterNews method instead of searchNews
          searchResults = await NewsService.filterNews({
            query: query,
            page: 0,
            pageSize: 8
          });
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
          return [];
      }
    } catch (error) {
      console.error('Reference search error:', error);
      return [];
    }

    return [];
  }, [selectedReferenceType]);

  const handleReferenceTypeSelect = (typeValue) => {
    setSelectedReferenceType(typeValue);
    setSelectedReferences([]);
    setIsTypeDropdownOpen(false);
    // Clear the parent filter value when reference type changes
    onChange([]);
  };

  const handleReferencesChange = (newReferences) => {
    setSelectedReferences(newReferences);
    onChange(newReferences);
  };

  const handleClear = () => {
    setSelectedReferenceType(null);
    setSelectedReferences([]);
    onChange([]);
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
          <FlexibleSearchInput
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
            showSelectedItemsAsTags={true}
            onClear={() => handleReferencesChange([])}
          />
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
