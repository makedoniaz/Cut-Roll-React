import { useNavigate } from 'react-router-dom';
import { Calendar, MessageCircle, Star } from 'lucide-react';
import { getAvatarUrl } from '../../../utils/avatarUtils.js';

const ReviewCard = ({ review }) => {
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

  // Render star rating
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="w-4 h-4 fill-green-400 text-green-400" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative">
          <Star className="w-4 h-4 text-gray-600" />
          <div className="absolute inset-0 overflow-hidden w-1/2">
            <Star className="w-4 h-4 fill-green-400 text-green-400" />
          </div>
        </div>
      );
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="w-4 h-4 text-gray-600" />
      );
    }

    return stars;
  };

  return (
    <div 
      className="bg-gray-800 rounded-xl border border-gray-700 p-6 hover:border-gray-600 transition-all duration-300 hover:shadow-lg cursor-pointer"
      onClick={handleReviewClick}
    >
      {/* Header Section */}
      <div className="flex items-start justify-between mb-4">
        {/* User Info */}
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
            onClick={handleUserClick}
          >
            {review.userSimplified?.avatarPath ? (
              <img 
                src={getAvatarUrl(review.userSimplified.avatarPath, review.userSimplified.userId || review.userSimplified.id)} 
                alt={review.userSimplified.userName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-white font-semibold text-lg">
                {review.userSimplified?.userName?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            )}
          </div>
          
          <div>
            <button
              onClick={handleUserClick}
              className="text-white font-medium hover:text-blue-400 transition-colors"
            >
              {review.userSimplified?.userName || 'Unknown User'}
            </button>
            <div className="text-gray-400 text-sm">
              {review.userSimplified?.email}
            </div>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {renderStars(review.rating)}
          </div>
          <span className="text-green-400 font-semibold text-lg">
            {review.rating.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Review Content */}
      <div className="mb-4">
        <p className="text-gray-300 leading-relaxed text-sm">
          {review.content}
        </p>
      </div>

      {/* Footer Section */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-700">
        {/* Date */}
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(review.createdAt)}</span>
        </div>

        {/* Engagement Stats */}
        <div className="flex items-center gap-4">
          {/* Likes */}
          <div className="flex items-center gap-1 text-gray-500 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span>{review.likesCount || 0}</span>
          </div>

          {/* Comments */}
          <div className="flex items-center gap-1 text-gray-500 text-sm">
            <MessageCircle className="w-4 h-4" />
            <span>{review.commentsCount || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;