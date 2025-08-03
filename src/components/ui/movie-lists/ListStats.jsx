import { Heart, MessageCircle } from 'lucide-react';

const ListStats = ({ films, likes, comments }) => {
  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <div className="flex items-center gap-4 text-sm text-gray-400">
      <span>{films} films</span>
      <div className="flex items-center gap-1">
        <Heart className="w-4 h-4" />
        <span>{formatNumber(likes)}</span>
      </div>
      <div className="flex items-center gap-1">
        <MessageCircle className="w-4 h-4" />
        <span>{comments}</span>
      </div>
    </div>
  );
};

export default ListStats