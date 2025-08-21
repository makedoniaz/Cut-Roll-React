import { useState, useCallback } from "react";
import FlexibleSearchInput from "../common/FlexibleSearchInput";
import { MovieService } from "../../../services/movieService";
import genreService from "../../../services/genreService";

// Search functions for different reference types - defined outside component to prevent recreation
const searchFunctions = {
    movie: async (query) => {
      console.log('Movie search function called with query:', query);
      try {
        // Use MovieService to search movies by title
        const searchResults = await MovieService.searchMovies({
          title: query,
          pageSize: 8,
          sortBy: 'title',
          sortDescending: false
        });
        
        console.log('Raw movie search results:', searchResults);
        
        // Transform the results to match the expected format
        if (searchResults && searchResults.data) {
          const transformed = searchResults.data.map(movie => ({
            id: movie.movieId,
            name: movie.title,
            description: `Movie ID: ${movie.movieId}`,
            image: movie.poster?.filePath ? `https://image.tmdb.org/t/p/original${movie.poster.filePath}` : null
          }));
          console.log('Transformed movie results:', transformed);
          return transformed;
        }
        
        console.log('No movie data found, returning empty array');
        return [];
      } catch (error) {
        console.error('Movie search error:', error);
        // Return empty array on error, but you could also show a toast notification
        return [];
      }
    },
    people: async (query) => {
      // Mock people search - replace with PeopleService.searchPeople() when available
      return [
        { id: '1', name: 'Keanu Reeves', description: 'Actor • The Matrix' },
        { id: '2', name: 'Christopher Nolan', description: 'Director • Inception' },
        { id: '3', name: 'Leonardo DiCaprio', description: 'Actor • Inception' }
      ].filter(person => 
        person.name.toLowerCase().includes(query.toLowerCase())
      );
    },
    genre: async (query) => {
      console.log('Genre search function called with query:', query);
      try {
        // Use GenreService to search genres by name
        const searchResults = await genreService.searchGenres({
          name: query,
          pageNumber: 0,
          pageSize: 8
        });
        
        console.log('Raw genre search results:', searchResults);
        
        // Parse the response to get JSON data
        const responseData = await searchResults.json();
        console.log('Parsed response data:', responseData);
        
        // Transform the results to match the expected format
        if (responseData && responseData.data) {
          const transformed = responseData.data.map(genre => ({
            id: genre.id, // Use the id directly from the API response
            name: genre.name,
            description: `Genre: ${genre.name}`, // More user-friendly description
            image: null // Genres typically don't have images
          }));
          console.log('Transformed genre results:', transformed);
          return transformed;
        }
        
        console.log('No genre data found, returning empty array');
        return [];
      } catch (error) {
        console.error('Genre search error:', error);
        // Return empty array on error
        return [];
      }
    },
    production_company: async (query) => {
      // Mock production company search
      return [
        { id: '1', name: 'Warner Bros.', description: 'Major studio' },
        { id: '2', name: 'Paramount', description: 'Film studio' },
        { id: '3', name: 'Universal', description: 'Entertainment company' }
      ].filter(company => 
        company.name.toLowerCase().includes(query.toLowerCase())
      );
    },
    keyword: async (query) => {
      // Mock keyword search
      return [
        { id: '1', name: 'Artificial Intelligence', description: 'AI-related content' },
        { id: '2', name: 'Time Travel', description: 'Temporal themes' },
        { id: '3', name: 'Virtual Reality', description: 'VR experiences' }
      ].filter(keyword => 
        keyword.name.toLowerCase().includes(query.toLowerCase())
      );
    },
    news: async (query) => {
      // Mock news search - replace with NewsService.searchNews() when available
      return [
        { id: '1', name: 'New Marvel Movie Announced', description: 'Latest superhero news' },
        { id: '2', name: 'Oscar Winners 2024', description: 'Awards coverage' },
        { id: '3', name: 'Streaming Wars Update', description: 'Industry analysis' }
      ].filter(news => 
        news.name.toLowerCase().includes(query.toLowerCase())
      );
    }
};

function LinkModal({ selectedText, onClose, onAddReference = null }) {
  const [linkType, setLinkType] = useState('movie');
  const [selectedReference, setSelectedReference] = useState(null);

  // Create a stable search function that doesn't change on every render
  const currentSearchFunction = useCallback(async (query) => {
    console.log('Searching for:', linkType, 'with query:', query);
    const result = await searchFunctions[linkType](query);
    console.log('Search result for', linkType, ':', result);
    return result;
  }, [linkType]);

  const linkTypes = [
    { value: 'movie', label: 'Movie' },
    { value: 'people', label: 'People' },
    { value: 'genre', label: 'Genre' },
    { value: 'production_company', label: 'Production Company'},
    { value: 'keyword', label: 'Keyword' },
    { value: 'news', label: 'News' }
  ];

  const handleReferenceSelect = (item) => {
    setSelectedReference(item);
  };

  const handleAddReference = () => {
    if (selectedText && selectedReference) {
      // Create the reference object with all necessary data
      const reference = {
        id: selectedReference.id,
        type: linkType,
        name: selectedReference.name,
        description: selectedReference.description,
        image: selectedReference.image
      };

      // Create HTML link that will replace the selected text
      const htmlLink = `<a href="#" data-reference-id="${reference.id}" data-reference-type="${reference.type}" class="reference-link text-blue-400 hover:text-blue-300 underline cursor-pointer" title="${reference.description}">${selectedText}</a>`;

      // Call the parent's onAddReference function with all the data
      if (onAddReference && typeof onAddReference === 'function') {
        onAddReference({
          originalText: selectedText,
          htmlText: htmlLink,
          reference: reference
        });
      } else {
        console.log('Reference data:', {
          originalText: selectedText,
          htmlText: htmlLink,
          reference: reference
        });
      }
      
      // Close modal after adding reference
      onClose();
    }
  };

  const handleClearSearch = () => {
    setSelectedReference(null);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Add Reference</h2>
      
      {/* Selected Text Display */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Selected Text
        </label>
        <div className="p-3 bg-gray-700 border border-gray-600 rounded-lg">
          <p className="text-white italic">
            {selectedText ? `"${selectedText}"` : 'No text selected'}
          </p>
        </div>
      </div>

      {/* Link Type Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Reference Type
        </label>
        <select
          value={linkType}
          onChange={(e) => {
            setLinkType(e.target.value);
            setSelectedReference(null);
          }}
          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {linkTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Search Bar with FlexibleSearchInput */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Search for reference
        </label>
        <FlexibleSearchInput
          key={linkType} // Force re-render when linkType changes
          placeholder={`Search for ${linkTypes.find(t => t.value === linkType)?.label.toLowerCase()}...`}
          searchFunction={currentSearchFunction}
          onSelect={handleReferenceSelect}
          maxResults={8}
          debounceMs={500}
          clearable={true}
          multiple={false}
          autoOpen={true}
          onClear={handleClearSearch}
        />
      </div>

      {/* Selected Reference Display */}
      {selectedReference && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Selected Reference
          </label>
          <div className="p-3 bg-green-600/20 border border-green-600 rounded-lg">
            <div className="text-white font-medium">
              {selectedReference.name}
            </div>
            {selectedReference.description && (
              <div className="text-green-300 text-sm">
                {selectedReference.description}
              </div>
            )}
          </div>
        </div>
      )}



      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={!selectedText || !selectedReference}
          className={`px-4 py-2 rounded-lg transition-colors ${
            selectedText && selectedReference
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-500 text-gray-300 cursor-not-allowed'
          }`}
          onClick={handleAddReference}
        >
          Add Reference
        </button>
      </div>
    </div>
  );
}

export default LinkModal;
