import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { THEME } from '../../../constants/index.js';

const ReviewPreviewCard = ({ review }) => {
  const navigate = useNavigate();

  const handleReviewClick = () => {
    if (review.id) {
      navigate(`/review/${review.id}`);
    }
  };

  const handleUserClick = (e) => {
    e.stopPropagation();
    if (review.userSimplified?.userName) {
      navigate(`/profile/${review.userSimplified.userName}`);
    }
  };

  // Format date to show month and day (e.g., "Sep 14")
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return '';
    }
  };

  // Render star rating with half-star support
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="w-4 h-4 fill-green-500 text-green-500" />
      );
    }

    // Half star
    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative">
          <Star className="w-4 h-4 text-gray-600" />
          <div className="absolute inset-0 overflow-hidden w-1/2">
            <Star className="w-4 h-4 fill-green-500 text-green-500" />
          </div>
        </div>
      );
    }

    // Empty stars
    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="w-4 h-4 text-gray-600" />
      );
    }

    return stars;
  };

  // Get movie poster URL
  const getPosterUrl = () => {
    if (review.movieSimplified?.poster?.filePath) {
      // Remove leading slash if present
      const filePath = review.movieSimplified.poster.filePath.startsWith('/') 
        ? review.movieSimplified.poster.filePath.substring(1)
        : review.movieSimplified.poster.filePath;
      const url = `https://image.tmdb.org/t/p/w500/${filePath}`;
      console.log('Poster URL:', url, 'Original filePath:', review.movieSimplified.poster.filePath);
      return url;
    }
    return '/poster-placeholder.png';
  };

  // Get movie title
  const getMovieTitle = () => {
    return review.movieSimplified?.title || 'Unknown Movie';
  };

  return (
    <div 
      className="cursor-pointer hover:scale-105 transition-all duration-300"
      onClick={handleReviewClick}
      style={{ width: '200px' }}
    >
      {/* Main Card */}
      <div 
        className="bg-gray-300 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border-0"
      >
        {/* Movie Poster Section */}
        <div className="relative w-full aspect-[2/3] overflow-hidden">
          <img 
            src={getPosterUrl()} 
            alt={getMovieTitle()}
            className="w-full h-full object-cover"
          />
          {/* Movie title overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
            <h3 className="text-white text-sm font-medium truncate">
              {getMovieTitle()}
            </h3>
          </div>
        </div>

        {/* User Info Section */}
        <div 
          className="px-3 py-2 flex items-center gap-2 border-0"
          style={{ backgroundColor: THEME.COLORS.MAIN_GRAY }}
        >
          {/* User Avatar */}
          <div 
            className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
            onClick={handleUserClick}
          >
            {review.userSimplified?.avatarPath ? (
              <img 
                src={review.userSimplified.avatarPath} 
                alt={review.userSimplified.userName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-gray-300 text-xs font-semibold">
                {review.userSimplified?.userName?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            )}
          </div>
          
          {/* Username */}
          <button
            onClick={handleUserClick}
            className="text-white text-sm font-medium hover:text-green-400 transition-colors truncate"
          >
            {review.userSimplified?.userName || 'Unknown User'}
          </button>
        </div>
      </div>

      {/* Caption Section - Rating and Date */}
      <div className="mt-2 flex items-center justify-between">
        {/* Star Rating */}
        <div className="flex items-center gap-1">
          {renderStars(review.rating)}
          <span className="text-green-500 text-sm font-semibold ml-1">
            {review.rating}
          </span>
        </div>

        {/* Date */}
        <div className="text-gray-400 text-xs">
          {formatDate(review.createdAt)}
        </div>
      </div>
    </div>
  );
};

export default ReviewPreviewCard;
