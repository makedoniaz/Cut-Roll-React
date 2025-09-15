import { useNavigate } from 'react-router-dom';

const MovieMixCard = ({ movie }) => {
  const navigate = useNavigate();
  
  // Handle both old and new data formats
  const movieId = movie.movieId || movie.id;
  const title = movie.title || 'Unknown Title';

  // Construct TMDB poster URL directly from posterPath
  const getPosterUrl = (posterPath) => {
    if (posterPath && posterPath.filePath) {
      // TMDB base URL for images
      const TMDB_BASE_URL = 'https://image.tmdb.org/t/p/w500';
      return `${TMDB_BASE_URL}${posterPath.filePath}`;
    }
    // Fallback to placeholder
    return '/poster-placeholder.png';
  };

  // Handle click to navigate to movie details
  const handleClick = () => {
    if (movieId) {
      navigate(`/movie/${movieId}`);
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

export default MovieMixCard;
