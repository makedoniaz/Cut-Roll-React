const SmallMovieCard = ({ movie }) => {
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

  return (
    <div className="group cursor-pointer min-w-0 h-64">
      <div className="relative overflow-hidden rounded-md shadow-md transition-transform duration-200 hover:scale-105 hover:shadow-lg h-full">
        <img 
          src={getPosterUrl(movie.poster)}
          alt={title}
          className="w-full h-full object-cover object-center transition-all duration-200 group-hover:brightness-110"
          style={{ aspectRatio: '2/3' }}
          onError={(e) => {
            // Fallback to placeholder if image fails to load
            e.target.src = '/poster-placeholder.png';
          }}
        />
        
        {/* Optional overlay on hover */}
        <div className="absolute inset-0 group-hover:bg-opacity-20 transition-all duration-200"></div>
      </div>
    </div>
  );
};

export default SmallMovieCard;