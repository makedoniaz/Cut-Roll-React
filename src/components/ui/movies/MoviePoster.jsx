import { API_CONFIG, IMAGE_SIZES } from '../../../constants';

const MoviePoster = ({ src, alt, className = "" }) => {
  // Helper function to construct TMDB image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'poster-placeholder.png';
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // If it's a TMDB poster path (starts with /), construct full URL
    if (imagePath.startsWith('/')) {
      return `${API_CONFIG.TMDB_IMAGE_BASE_URL}/${IMAGE_SIZES.POSTER.MEDIUM}${imagePath}`;
    }
    
    // For other cases, return as is (could be local path)
    return imagePath;
  };

  return (
    <div className={`relative overflow-hidden rounded-md ${className}`}>
      <img 
        src={getImageUrl(src)} 
        alt={alt}
        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
      />
    </div>
  );
};

export default MoviePoster