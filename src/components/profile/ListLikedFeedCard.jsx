import React from 'react';
import { Link } from 'react-router-dom';

const ListLikedFeedCard = ({ activity }) => {
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

  // Helper function to get list preview image or placeholder
  const getListPreviewImage = (preview) => {
    if (preview && preview.length > 0) {
      // Use the first poster path from the preview array
      const firstPosterPath = preview[0];
      if (firstPosterPath) {
        return `https://image.tmdb.org/t/p/w500${firstPosterPath}`;
      }
    }
    return '/poster-placeholder.png';
  };

  return (
    <div className="bg-gray-900 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors w-full max-w-sm">
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
              >
                {activity.user?.userName}
              </Link>
              <span className="text-gray-400 text-xs">liked a list</span>
            </div>
          </div>

          {/* Right side - List info */}
          <div className="flex items-start space-x-3">
            {/* List details */}
            <div className="flex-shrink-0 max-w-32">
              <Link
                to={`/lists/${activity.list?.id}`}
                className="text-white hover:text-green-400 font-medium text-sm block line-clamp-2"
              >
                {activity.list?.title}
              </Link>
            </div>

            {/* List Preview Image */}
            <div className="flex-shrink-0">
              <div className="w-12 h-16 rounded-md overflow-hidden border border-gray-600">
                <img
                  src={getListPreviewImage(activity.list?.preview)}
                  alt={activity.list?.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/poster-placeholder.png';
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Date at bottom */}
        <div className="mt-auto">
          <span className="text-gray-500 text-xs">
            {formatDate(activity.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ListLikedFeedCard;
