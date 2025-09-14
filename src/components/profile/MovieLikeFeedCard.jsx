import React from 'react';
import { Link } from 'react-router-dom';

const MovieLikeFeedCard = ({ activity }) => {
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

  return (
    <div className="bg-gray-700 rounded-lg p-4 border border-gray-600 hover:border-gray-500 transition-colors">
      <div className="flex items-start space-x-3">
        {/* User Avatar */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-600">
            <img
              src={activity.user?.avatarPath || '/default-avatar.png'}
              alt={`${activity.user?.username}'s avatar`}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = '/default-avatar.png';
              }}
            />
          </div>
        </div>

        {/* Activity Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <Link
              to={`/profile/${activity.user?.username}`}
              className="text-white hover:text-blue-400 font-medium text-sm"
            >
              {activity.user?.username}
            </Link>
            <span className="text-gray-400 text-sm">liked a movie</span>
          </div>

          {/* Movie Info */}
          <div className="bg-gray-800 rounded-lg p-3 mt-2">
            <div className="flex space-x-3">
              {/* Movie Poster */}
              <div className="flex-shrink-0">
                <div className="w-16 h-24 rounded-md overflow-hidden border border-gray-600">
                  <img
                    src={activity.movie?.posterPath || '/poster-placeholder.png'}
                    alt={activity.movie?.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/poster-placeholder.png';
                    }}
                  />
                </div>
              </div>

              {/* Movie Details */}
              <div className="flex-1 min-w-0">
                <Link
                  to={`/movie/${activity.movie?.id}`}
                  className="text-white hover:text-blue-400 font-medium text-sm block truncate"
                >
                  {activity.movie?.title}
                </Link>
                <p className="text-gray-400 text-xs mt-1">
                  {activity.movie?.releaseDate ? new Date(activity.movie.releaseDate).getFullYear() : 'N/A'}
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <div className="flex items-center space-x-1">
                    <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-gray-300 text-xs">
                      {activity.movie?.voteAverage ? activity.movie.voteAverage.toFixed(1) : 'N/A'}
                    </span>
                  </div>
                  <span className="text-gray-500 text-xs">•</span>
                  <span className="text-gray-400 text-xs">
                    {activity.movie?.genres?.map(genre => genre.name).join(', ') || 'Unknown'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Timestamp */}
          <div className="flex items-center justify-between mt-2">
            <span className="text-gray-500 text-xs">
              {formatDate(activity.createdAt)}
            </span>
            <div className="flex items-center space-x-1 text-gray-500">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
              <span className="text-xs">Liked</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieLikeFeedCard;
