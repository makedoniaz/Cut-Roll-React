import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MovieService } from '../../services/movieService';
import { X } from 'lucide-react';

const MovieSearchDropdown = ({ 
  placeholder = "Search for movies...", 
  searchValue = "", 
  onSearch, 
  onSearchButtonPress 
}) => {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState(searchValue);
  const [searchResults, setSearchResults] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [isFocused, setIsFocused] = useState(false);
  
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Search function for movies by title
  const searchMovies = useCallback(async (query) => {
    if (!query.trim()) {
      return [];
    }

    try {
      const results = await MovieService.searchMoviesByTitle(query, 8);
      return results;
    } catch (error) {
      console.error('Movie search error:', error);
      return [];
    }
  }, []);

  // Debounced search function
  const performSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const results = await searchMovies(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchMovies]);

  // Handle input change with debouncing
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onSearch?.(newValue);

    // Open dropdown when user starts typing
    if (newValue.trim()) {
      setIsDropdownOpen(true);
    } else {
      setIsDropdownOpen(false);
      setSearchResults([]);
    }

    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set new timeout for search
    const timeout = setTimeout(() => {
      performSearch(newValue);
    }, 500);

    setSearchTimeout(timeout);
  };

  // Handle movie selection and navigation
  const handleMovieSelect = (movie) => {
    console.log('Movie selected:', movie);
    if (movie && movie.id) {
      console.log('Navigating to movie:', movie.id);
      // Navigate to movie details page
      navigate(`/movie/${movie.id}`);
      // Close dropdown and clear search
      setIsDropdownOpen(false);
      setSearchResults([]);
      setInputValue('');
      onSearch?.('');
    } else {
      console.log('Invalid movie data:', movie);
    }
  };

  // Handle search button press
  const handleSearchButtonPress = () => {
    if (searchResults.length > 0 && inputValue.trim()) {
      // If there are search results and input has value, navigate to first result
      handleMovieSelect(searchResults[0]);
    } else {
      // Otherwise, perform regular search
      onSearchButtonPress?.();
    }
  };

  // Handle focus
  const handleFocus = () => {
    setIsFocused(true);
    // Only open dropdown if there's input value or search results
    if (inputValue.trim() || searchResults.length > 0) {
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

  // Update input value when external value changes
  useEffect(() => {
    setInputValue(searchValue);
  }, [searchValue]);

  // Clear search results when input is cleared
  const clearSearch = () => {
    setInputValue('');
    setSearchResults([]);
    setIsDropdownOpen(false);
    onSearch?.('');
  };

  return (
    <div className="relative flex">
      <div className="flex-1 relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-l-lg focus:outline-none focus:border-green-500 text-white placeholder-gray-400"
        />
        
        {/* Clear Button */}
        {inputValue && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={handleSearchButtonPress}
        className="cursor-pointer px-4 py-3 bg-green-600 hover:bg-green-700 border border-green-600 rounded-r-lg transition-colors"
      >
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>

      {/* Dropdown - Positioned below the entire search bar */}
      {isDropdownOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 left-0 right-0 top-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {isLoading ? (
            <div className="px-4 py-3 text-gray-400 text-center">
              Searching...
            </div>
          ) : searchResults.length > 0 ? (
            <div>
              {searchResults.map((movie, index) => (
                <button
                  key={movie.id || `movie-${index}`}
                  type="button"
                  onClick={() => handleMovieSelect(movie)}
                  className="w-full px-4 py-3 text-left transition-colors border-b border-gray-700 last:border-b-0 text-white hover:bg-gray-700"
                >
                  <div className="flex items-center gap-3">
                    {/* Movie Poster */}
                    {movie.image && (
                      <img
                        src={movie.image}
                        alt={movie.title}
                        className="w-12 h-18 rounded object-cover"
                      />
                    )}
                    
                    {/* Movie Info */}
                    <div className="flex-1">
                      <div className="font-medium text-white">
                        {movie.title}
                      </div>
                      {movie.description && (
                        <div className="text-sm text-gray-400">
                          {movie.description}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : inputValue.trim() ? (
            <div className="px-4 py-3 text-gray-400 text-center">
              No movies found
            </div>
          ) : (
            <div className="px-4 py-3 text-gray-400 text-center">
              Start typing to search for movies
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MovieSearchDropdown;
