import { useNavigate } from 'react-router-dom';

const SimilarMovieCard = ({ movie }) => {
  const navigate = useNavigate();
  
  // Construct TMDB poster URL from posterPath
  const getPosterUrl = (posterPath) => {
    if (posterPath) {
      // Remove quotes if present and clean the path
      const cleanPath = posterPath.replace(/"/g, '');
      return `https://image.tmdb.org/t/p/w500${cleanPath}`;
    }
    // Fallback to placeholder
    return '/poster-placeholder.png';
  };

  // Handle both old and new data formats
  const movieId = movie.movieId || movie.id;
  const title = movie.title || 'Unknown Title';
  const similarityScore = movie.similarityScore;

  // Handle click to navigate to movie details
  const handleClick = () => {
    if (movieId) {
      navigate(`/movie/${movieId}`);
    }
  };

  return (
    <div 
      className="cursor-pointer min-w-0 h-48 group" 
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
          src={getPosterUrl(movie.posterPath)}
          alt={title}
          className="w-full h-full object-cover object-center"
          onError={(e) => {
            // Fallback to placeholder if image fails to load
            e.target.src = '/poster-placeholder.png';
          }}
        />
        
        {/* Overlay with title */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="absolute bottom-0 left-0 right-0 p-2">
            <h3 className="text-white text-xs font-medium line-clamp-2">
              {title.replace(/"/g, '')}
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimilarMovieCard;
