import { useNavigate, useLocation } from 'react-router-dom';

const SmallMovieCard = ({ movie, searchContext }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
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

  // Handle click to navigate to movie details with search context
  const handleClick = () => {
    if (movieId) {
      // If we have search context, pass it along for back navigation
      if (searchContext && searchContext.hasSearched) {
        // Store search context in sessionStorage as backup for page refreshes
        try {
          const contextString = JSON.stringify(searchContext);
          // Only store if it's not too large (sessionStorage has size limits)
          if (contextString.length < 1000000) { // 1MB limit
            sessionStorage.setItem('lastSearchContext', contextString);
          }
        } catch (error) {
          console.warn('Failed to store search context in sessionStorage:', error);
        }
        
        navigate(`/movie/${movieId}`, { 
          state: { 
            searchContext,
            fromSearch: true 
          } 
        });
      } else {
        // No search context or not from search - regular navigation
        navigate(`/movie/${movieId}`, {
          state: {
            fromSearch: false
          }
        });
      }
    }
  };

  return (
    <div 
      className="cursor-pointer min-w-0 h-64" 
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
        

        

      </div>
    </div>
  );
};

export default SmallMovieCard;