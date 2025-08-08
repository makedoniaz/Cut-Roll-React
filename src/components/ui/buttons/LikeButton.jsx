import { Heart } from 'lucide-react';

const LikeButton = ({ likes, isLiked, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-2 text-gray-400 hover:text-red-500 transition-colors duration-200 group"
    >
      <Heart
        className={`w-4 h-4 ${
          isLiked ? 'fill-red-500 text-red-500' : 'group-hover:fill-red-500'
        }`}
      />
      <span className="text-sm">
        Like <span className="ml-3 text-gray-500">{likes.toLocaleString()} likes</span>
      </span>
    </button>
  );
};

export default LikeButton;