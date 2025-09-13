import { useState, useCallback } from "react";
import FlexibleSearchInput from "../common/FlexibleSearchInput";
import Modal from "../../layout/Modal";
import { MovieService } from "../../../services/movieService";
import { ListMovieService } from "../../../services/listMovieService";

function AddMoviesModal({ isOpen, onClose, listId, onMoviesAdded }) {
  const [selectedMovies, setSelectedMovies] = useState([]);
  const [isAddingMovies, setIsAddingMovies] = useState(false);

  // Create a stable search function for movies
  const movieSearchFunction = useCallback(async (query) => {
    console.log('Movie search function called with query:', query);
    try {
      // Use MovieService to search movies by title
      const searchResults = await MovieService.searchMovies({
        title: query,
        pageSize: 10,
        page: 1,
        sortBy: 'title',
        sortDescending: false
      });
      
      console.log('Raw movie search results:', searchResults);
      
      // Transform the results to match the expected format
      if (searchResults && searchResults.data) {
        const transformed = searchResults.data.map(movie => ({
          id: movie.movieId,
          name: movie.title,
          description: `${movie.releaseYear ? `(${movie.releaseYear})` : ''} ${movie.overview ? movie.overview.slice(0, 80) + '...' : ''}`.trim(),
          image: movie.poster?.filePath ? `https://image.tmdb.org/t/p/w200${movie.poster.filePath}` : null,
          movieData: movie // Store original movie data for API call
        }));
        console.log('Transformed movie results:', transformed);
        return transformed;
      }
      
      console.log('No movie data found, returning empty array');
      return [];
    } catch (error) {
      console.error('Movie search error:', error);
      return [];
    }
  }, []);

  const handleMovieSelection = (movies) => {
    setSelectedMovies(movies);
  };

  const handleAddMovies = async () => {
    if (selectedMovies.length === 0) {
      alert('Please select at least one movie to add.');
      return;
    }

    setIsAddingMovies(true);
    
    try {
      console.log('🎬 Starting bulk add operation for movies:', {
        listId,
        movieCount: selectedMovies.length,
        movies: selectedMovies.map(movie => ({
          movieId: movie.id,
          title: movie.name,
          originalData: movie.movieData
        }))
      });

      // Use the real ListMovieService to add movies (bulk operation)
      const movieIds = selectedMovies.map(movie => movie.id);
      
      console.log('🚀 Calling ListMovieService.addMultipleMoviesToList with:', {
        listId,
        movieIds
      });

      const response = await ListMovieService.addMultipleMoviesToList({
        listId,
        movieIds
      });

      console.log('📡 Bulk add response:', {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText
      });

      // Check if the response is successful
      if (response.ok) {
        // Call the parent callback to notify movies were added
        if (onMoviesAdded) {
          onMoviesAdded(selectedMovies);
        }

        console.log('✅ Successfully added movies to list');

        // Reset state and close modal
        setSelectedMovies([]);
        onClose();
      } else {
        // Request failed
        const errorText = await response.text();
        console.error('❌ Bulk movie addition failed:', {
          status: response.status,
          statusText: response.statusText,
          errorText
        });
        alert('Failed to add movies to the list. Please try again.');
      }
    } catch (error) {
      console.error('💥 Error adding movies to list:', error);
      alert('Failed to add movies to the list. Please try again.');
    } finally {
      setIsAddingMovies(false);
    }
  };

  const handleClose = () => {
    setSelectedMovies([]);
    onClose();
  };

  const handleClearSearch = () => {
    setSelectedMovies([]);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Add Movies to List</h2>
        
        {/* Movie Search with FlexibleSearchInput */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Search for movies
          </label>
          <FlexibleSearchInput
            placeholder="Search for movies to add..."
            searchFunction={movieSearchFunction}
            onSelectedItemsChange={handleMovieSelection}
            selectedItems={selectedMovies}
            maxResults={10}
            debounceMs={500}
            clearable={true}
            multiple={true}
            autoOpen={false}
            onClear={handleClearSearch}
            showSelectedItemsAsTags={true}
            className="w-full"
          />
        </div>

        {/* Selected Movies Summary */}
        {selectedMovies.length > 0 && (
          <div className="mb-6">
            <div className="text-sm text-gray-300 mb-2">
              {selectedMovies.length} movie(s) selected
            </div>
            <div className="max-h-40 overflow-y-auto bg-gray-700/50 rounded-lg p-3">
              {selectedMovies.map((movie, index) => (
                <div key={movie.id} className="flex items-start gap-3 mb-2 last:mb-0">
                  {movie.image && (
                    <img 
                      src={movie.image} 
                      alt={movie.name}
                      className="w-12 h-16 object-cover rounded flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium text-sm truncate">
                      {movie.name}
                    </div>
                    {movie.description && (
                      <div className="text-gray-400 text-xs">
                        {movie.description}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}


        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
            onClick={handleClose}
            disabled={isAddingMovies}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={selectedMovies.length === 0 || isAddingMovies}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedMovies.length > 0 && !isAddingMovies
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-500 text-gray-300 cursor-not-allowed'
            }`}
            onClick={handleAddMovies}
            title={selectedMovies.length === 0 ? 'Please select at least one movie to add' : ''}
          >
            {isAddingMovies ? 'Adding Movies...' : selectedMovies.length === 0 ? 'Select Movies to Add' : `Add ${selectedMovies.length} Movie(s)`}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default AddMoviesModal;
