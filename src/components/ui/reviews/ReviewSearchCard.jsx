import { useNavigate } from 'react-router-dom';
import Avatar from "../users/Avatar";
import LikeButton from "../buttons/LikeButton";
import ReviewStarRating from "./ReviewStarRating";
import { Calendar, MessageCircle, Film } from 'lucide-react';

const ReviewSearchCard = ({ review }) => {
  const navigate = useNavigate();

  const handleMovieClick = (e) => {
    e.stopPropagation();
    if (review.movieId) {
      navigate(`/movie/${review.movieId}`);
    }
  };

  const handleUserClick = (e) => {
    e.stopPropagation();
    if (review.username) {
      navigate(`/profile/${review.username}`);
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

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:border-gray-600 transition-colors">
      {/* Header with user info and rating */}
      <div className="flex items-start gap-4 mb-4">
        <Avatar
          src={review.userAvatar || review.avatar}
          alt={review.username}
          size="md"
          onClick={handleUserClick}
          className="cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all"
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={handleUserClick}
              className="text-gray-400 text-sm hover:text-white transition-colors"
            >
              Review by <span className="text-white font-medium">{review.username}</span>
            </button>
            <ReviewStarRating rating={review.rating} />
          </div>
          
          {/* Movie info */}
          {review.movieTitle && (
            <button
              onClick={handleMovieClick}
              className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors mb-2"
            >
              <Film className="w-4 h-4" />
              <span className="text-sm font-medium">{review.movieTitle}</span>
            </button>
          )}
          
          {/* Date and comments info */}
          <div className="flex items-center gap-4 text-gray-500 text-xs">
            {review.createdAt && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(review.createdAt)}</span>
              </div>
            )}
            {review.commentCount > 0 && (
              <div className="flex items-center gap-1">
                <MessageCircle className="w-3 h-3" />
                <span>{review.commentCount} comments</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Review content */}
      <div className="mb-4">
        <p className="text-white text-sm leading-relaxed line-clamp-4">
          {review.content || review.text}
        </p>
      </div>
      
      {/* Like button */}
      <div className="flex items-center justify-between">
        <LikeButton
          likes={review.likes || 0}
          isLiked={review.isLiked || false}
          onToggle={() => {
            // TODO: Implement like functionality
            console.log('Like toggle for review:', review.id);
          }}
        />
        
        {/* Additional actions could go here */}
      </div>
    </div>
  );
};

export default ReviewSearchCard;
