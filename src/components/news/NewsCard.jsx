import { useState } from 'react';
import { Heart, Share2, Edit, Trash2, Eye, Calendar, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Avatar from '../ui/users/Avatar';

const NewsCard = ({ article, showAuthor = true, showActions = false }) => {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(article.likes);
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Unknown date';
    
    const now = new Date();
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) return 'Invalid date';
    
    const diffInSeconds = Math.floor((now - date) / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks}w ago`;
    
    return formatDate(dateString);
  };

  const handleLike = () => {
    if (liked) {
      setLikesCount(prev => prev - 1);
    } else {
      setLikesCount(prev => prev + 1);
    }
    setLiked(!liked);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.excerpt,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // You could add a toast notification here
    }
  };

  const handleEdit = () => {
    navigate(`/news/edit/${article.id}`);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      // Handle delete logic here
      console.log('Deleting article:', article.id);
    }
  };

  const handleViewArticle = () => {
    navigate(`/news/${article.id}`);
  };

  return (
    <article className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden hover:border-gray-600 transition-colors duration-200">
      {/* Image */}
      <div className="relative h-48 sm:h-64 overflow-hidden">
        <img
          src={article.imageUrl || '/news-placeholder.jpg'}
          alt={article.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-4 right-4 flex items-center gap-2 text-white text-sm">
          <Clock className="w-4 h-4" />
          <span>{article.readTime}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Title and Excerpt */}
        <div className="mb-4">
          <h2 
            className="text-xl font-bold text-white mb-3 hover:text-green-400 transition-colors cursor-pointer"
            onClick={handleViewArticle}
          >
            {article.title}
          </h2>
          <p className="text-gray-300 leading-relaxed">
            {article.excerpt}
          </p>
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-gray-400">
          {showAuthor && (
            <div className="flex items-center gap-2">
              <Avatar user={article.author} size="sm" />
              <span>User ID: {article.authorId}</span>
            </div>
          )}
          
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{formatTimeAgo(article.createdAt)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">

            {/* Share */}
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-3 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors duration-200"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
          </div>

          {/* User Actions (only for user's own articles) */}
          {showActions && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleViewArticle}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <Eye className="w-4 h-4" />
                <span>View</span>
              </button>
              
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors duration-200"
              >
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </button>
              
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

export default NewsCard;
