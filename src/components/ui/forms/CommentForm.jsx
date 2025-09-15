import { useState } from "react";
import { useAuthStore } from "../../../stores/authStore";

const CommentForm = ({ onSubmit }) => {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, isAuthenticated } = useAuthStore();
  
  const MAX_LENGTH = 500;

  const getUserName = () => {
    return user?.userName || user?.username || user?.name || 'Anonymous';
  };

  const handleCommentChange = (e) => {
    const value = e.target.value;
    if (value.length <= MAX_LENGTH) {
      setComment(value);
    }
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      alert('You must be logged in to post comments.');
      return;
    }

    if (user?.is_muted) {
      alert('You are currently muted and cannot post comments. Please contact support if you believe this is an error.');
      return;
    }

    if (comment.trim() && !isSubmitting) {
      setIsSubmitting(true);
      try {
        await onSubmit(comment.trim());
        setComment('');
      } catch (error) {
        console.error('Error submitting comment:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmit();
    }
  };

  const isNearLimit = comment.length > MAX_LENGTH * 0.8;
  const isAtLimit = comment.length >= MAX_LENGTH;

  return (
    <div className="p-4 border-t border-gray-700">
      <textarea
        value={comment}
        onChange={handleCommentChange}
        placeholder={user?.is_muted ? 'You are muted and cannot post comments.' : `Reply as ${getUserName()}...`}
        className="w-full bg-gray-700 text-white placeholder-gray-400 p-3 rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 transition-all"
        rows={3}
        onKeyDown={handleKeyPress}
        disabled={isSubmitting || !isAuthenticated || user?.is_muted}
        maxLength={MAX_LENGTH}
      />
      
      {/* Character count */}
      <div className="flex justify-between items-center mt-3">
        <div className={`text-xs ${isAtLimit ? 'text-red-400' : isNearLimit ? 'text-yellow-400' : 'text-gray-400'}`}>
          {comment.length}/{MAX_LENGTH} characters
        </div>
        
        <button
          onClick={handleSubmit}
          disabled={!comment.trim() || isSubmitting || !isAuthenticated || user?.is_muted}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded transition-colors"
        >
          {isSubmitting ? 'POSTING...' : 'POST'}
        </button>
      </div>
    </div>
  );
};

export default CommentForm;