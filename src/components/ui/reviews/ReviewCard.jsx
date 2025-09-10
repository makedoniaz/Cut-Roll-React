import Avatar from "../users/Avatar";
import LikeButton from "../buttons/LikeButton";
import ReviewStarRating from "../reviews/ReviewStarRating"

import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ReviewCard = ({ review, isFirst = false, isLast = false }) => {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(review.likes);

  const handleLikeToggle = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  // Dynamic padding classes based on position
  const getPaddingClasses = () => {
    if (isFirst && isLast) {
      // Single item - no vertical padding
      return "py-0";
    } else if (isFirst) {
      // First item - no top padding
      return "pt-0 pb-6";
    } else if (isLast) {
      // Last item - no bottom padding
      return "pt-6 pb-0";
    } else {
      // Middle items - full padding
      return "py-6";
    }
  };

  return (
    <div className={`flex gap-4 ${getPaddingClasses()} border-b border-gray-800 last:border-b-0`}>
      <Avatar
        src={review.avatar}
        alt={review.username}
        size="md"
      />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-gray-400 text-sm">
            Review by <span className="text-white font-medium">{review.username}</span>
          </span>
          <ReviewStarRating rating={review.rating} />
          {review.comments && (
            <div className="flex items-center gap-1 text-gray-500">
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm">{review.comments}</span>
            </div>
          )}
        </div>
        
        <p className="text-white text-base leading-relaxed mb-4">
          {review.text}
        </p>
        
        {/* Read More Link */}
        {review.id && (
          <div className="mb-4">
            <button
              onClick={() => navigate(`/review/${review.id}`)}
              className="text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium"
            >
              Read full review →
            </button>
          </div>
        )}
        
        <LikeButton
          likes={likeCount}
          isLiked={isLiked}
          onToggle={handleLikeToggle}
        />
      </div>
    </div>
  );
};

export default ReviewCard;