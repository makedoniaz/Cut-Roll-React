import React from 'react';
import { Link } from 'react-router-dom';

const ReviewLikedFeedCard = ({ activity }) => {
  if (!activity) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper function to construct poster URL
  const getPosterUrl = (poster) => {
    if (!poster?.filePath) return '/poster-placeholder.png';
    // Assuming the filePath is relative and needs a base URL
    return `https://image.tmdb.org/t/p/w500${poster.filePath}`;
  };

  // Helper function to render star rating
  const renderStars = (rating) => {
    const stars = [];
    const maxStars = 5;
    
    for (let i = 1; i <= maxStars; i++) {
      stars.push(
        <svg
          key={i}
          className={`w-3 h-3 ${i <= rating ? 'text-green-400' : 'text-gray-600'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    
    return stars;
  };

  return (
    <Link 
      to={`/review/${activity.review?.id}`}
      className="block bg-gray-900 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors w-full max-w-sm hover:bg-gray-800"
    >
      <div className="flex flex-col h-full">
        {/* Top row - aligned content */}
        <div className="flex items-start justify-between mb-3">
          {/* Left side - User info */}
          <div className="flex items-center space-x-3">
            {/* User Avatar */}
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-600">
                <img
                  src={activity.user?.avatarPath || '/default-avatar.png'}
                  alt={`${activity.user?.userName}'s avatar`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/default-avatar.png';
                  }}
                />
              </div>
            </div>

            {/* User name and action */}
            <div className="flex flex-col">
              <Link
                to={`/profile/${activity.user?.userName}`}
                className="text-white hover:text-green-400 font-medium text-sm"
                onClick={(e) => e.stopPropagation()}
              >
                {activity.user?.userName}
              </Link>
              <span className="text-gray-400 text-xs">liked a review</span>
            </div>
          </div>

          {/* Right side - Movie info */}
          <div className="flex items-start space-x-3">
            {/* Movie title */}
            <div className="flex-shrink-0 max-w-32">
              <Link
                to={`/movie/${activity.movie?.movieId}`}
                className="text-white hover:text-green-400 font-medium text-sm block line-clamp-2"
                onClick={(e) => e.stopPropagation()}
              >
                {activity.movie?.title}
              </Link>
            </div>

            {/* Movie poster */}
            <div className="flex-shrink-0">
              <div className="w-12 h-16 rounded-md overflow-hidden border border-gray-600">
                <img
                  src={getPosterUrl(activity.movie?.poster)}
                  alt={activity.movie?.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/poster-placeholder.png';
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Review content */}
        <div className="mb-3">
          <p className="text-gray-300 text-sm line-clamp-2">
            {activity.review?.content}
          </p>
        </div>

        {/* Rating */}
        <div className="flex items-center space-x-2 mb-3">
          <div className="flex items-center space-x-1">
            {renderStars(activity.review?.rating || 0)}
          </div>
          <span className="text-green-400 text-xs">
            {activity.review?.rating || 0}/5
          </span>
        </div>

        {/* Date at bottom */}
        <div className="mt-auto">
          <span className="text-gray-500 text-xs">
            {formatDate(activity.createdAt)}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ReviewLikedFeedCard;
