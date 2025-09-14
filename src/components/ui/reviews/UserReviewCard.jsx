import { useNavigate } from 'react-router-dom';

const UserReviewCard = ({ review }) => {
  const navigate = useNavigate();

  const handleReviewClick = () => {
    if (review.id) {
      navigate(`/review/${review.id}`);
    }
  };

  const handleMovieClick = (e) => {
    e.stopPropagation();
    if (review.movieSimplified?.movieId) {
      navigate(`/movie/${review.movieSimplified.movieId}`);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return '';
    }
  };

  // Render star rating - exact same as MovieDetails
  const renderStars = (rating) => {
    if (!rating && rating !== 0) return null;
    
    return [...Array(5)].map((_, i) => {
      const starValue = i + 1;
      const isHalfStar = rating >= starValue - 0.5 && rating < starValue;
      const isFullStar = rating >= starValue;

      return (
        <div key={i} className="relative">
          {isHalfStar ? (
            // Half star - show gray star with green overlay
            <>
              <svg className="w-3 h-3 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <div className="absolute inset-0 overflow-hidden">
                <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20" style={{ clipPath: 'inset(0 50% 0 0)' }}>
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            </>
          ) : (
            // Regular star (full or empty)
            <svg className={`w-3 h-3 ${isFullStar ? 'text-green-500 fill-current' : 'text-gray-600 fill-current'}`} viewBox="0 0 20 20">
              <path d="M9.048 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          )}
        </div>
      );
    });
  };

  return (
    <div 
      className="bg-gray-800 rounded-xl border border-gray-700 p-6 hover:border-gray-600 transition-all duration-300 hover:shadow-lg cursor-pointer"
      onClick={handleReviewClick}
    >
      {/* Main Content Container */}
      <div className="flex gap-4 mb-4 pb-4 border-b border-gray-700">
        {/* Left Side - User Info and Review Content */}
        <div className="flex-1 min-w-0">
          {/* Header Section */}
          <div className="flex items-start justify-between mb-4">
            {/* User Info */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-white font-semibold text-sm overflow-hidden">
                {review.userSimplified?.avatarPath ? (
                  <img 
                    src={review.userSimplified.avatarPath} 
                    alt={review.userSimplified.userName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className={`w-full h-full flex items-center justify-center ${review.userSimplified?.avatarPath ? 'hidden' : 'flex'}`}>
                  {(review.userSimplified?.userName || 'U').charAt(0).toUpperCase()}
                </div>
              </div>
              
              <div>
                <div className="text-gray-400 text-sm">
                  Review by <span className="text-gray-200 hover:text-gray-100 font-medium">
                    {review.userSimplified?.userName || 'Anonymous'}
                  </span>
                </div>
              </div>
            </div>

            {/* Rating */}
            {review.rating !== undefined && review.rating !== null && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {renderStars(review.rating)}
                </div>
                <span className="text-sm text-green-500 font-medium">
                  {review.rating}
                </span>
              </div>
            )}
          </div>

          {/* Review Content */}
          <div>
            <p className="text-white text-base leading-relaxed whitespace-pre-wrap">
              {review.content || review.text || review.reviewText || 'No review text available'}
            </p>
          </div>
        </div>

        {/* Right Side - Movie Poster */}
        <div className="flex-shrink-0 w-20">
          <div 
            className="cursor-pointer group"
            onClick={handleMovieClick}
          >
            {/* Movie Poster */}
            <div className="relative w-full h-24 bg-gray-700 rounded-lg overflow-hidden mb-2 group-hover:scale-105 transition-transform duration-200">
              {review.movieSimplified?.poster?.filePath ? (
                <img 
                  src={`https://image.tmdb.org/t/p/w500${review.movieSimplified.poster.filePath}`} 
                  alt={review.movieSimplified.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/poster-placeholder.png';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <div className="text-lg mb-1">🎬</div>
                    <div className="text-xs">No Poster</div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Movie Title */}
            <div className="text-center">
              <h3 className="text-white text-xs font-medium leading-tight group-hover:text-blue-400 transition-colors">
                {review.movieSimplified?.title || 'Unknown Movie'}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Section - Engagement Stats Below horizontal line */}
      <div className="flex items-center gap-4">
        {/* Likes */}
        <div className="flex items-center gap-2 text-gray-400 hover:text-gray-300 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span className="text-sm">{review.likesCount || 0}</span>
        </div>

        {/* Comments */}
        <div className="flex items-center gap-2 text-gray-400 hover:text-gray-300 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="text-sm">{review.commentsCount || 0}</span>
        </div>
      </div>
    </div>
  );
};

export default UserReviewCard;
