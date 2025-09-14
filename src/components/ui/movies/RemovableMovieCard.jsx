import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { ListMovieService } from '../../../services/listMovieService';

const RemovableMovieCard = ({ movie, listId, onMovieRemoved, isOwner }) => {
  const navigate = useNavigate();
  
  // Construct TMDB poster URL
  const getPosterUrl = (poster) => {
    if (poster && poster.filePath) {
      // TMDB base URL for images
      const TMDB_BASE_URL = 'https://image.tmdb.org/t/p/w500';
      return `${TMDB_BASE_URL}${poster.filePath}`;
    }
    // Fallback to placeholder
    return '/poster-placeholder.png';
  };

  // Handle both old and new data formats
  const movieId = movie.movieId || movie.id;
  const title = movie.title || 'Unknown Title';

  // Handle click to navigate to movie details
  const handleClick = () => {
    if (movieId) {
      navigate(`/movie/${movieId}`, {
        state: {
          fromSearch: false
        }
      });
    }
  };

  // Handle remove movie from list
  const handleRemoveMovie = async (e) => {
    e.stopPropagation(); // Prevent navigation when clicking remove button
    
    if (!isOwner || !listId || !movieId) return;

    try {
      await ListMovieService.removeMovieFromList({
        listId,
        movieId
      });
      
      // Call the callback to refresh the movies list
      if (onMovieRemoved) {
        onMovieRemoved(movieId);
      }
    } catch (error) {
      console.error('Error removing movie from list:', error);
    }
  };

  return (
    <div 
      className="cursor-pointer min-w-0 h-64 group relative" 
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <div className="relative overflow-hidden rounded-md shadow-md h-full transition-transform duration-200 hover:scale-105 hover:shadow-lg">
        <img 
          src={getPosterUrl(movie.poster)}
          alt={title}
          className="w-full h-full object-cover object-center"
          style={{ aspectRatio: '2/3' }}
          onError={(e) => {
            // Fallback to placeholder if image fails to load
            e.target.src = '/poster-placeholder.png';
          }}
        />
        
        {/* Remove button - only show for list owner */}
        {isOwner && (
          <button
            onClick={handleRemoveMovie}
            className="absolute top-2 right-2 p-1.5 bg-green-600/90 hover:bg-green-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 shadow-lg"
            title={`Remove "${title}" from list`}
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default RemovableMovieCard;
