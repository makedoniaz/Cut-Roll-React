import { useState } from 'react';
import { Heart, Share2, Edit, Trash2, Eye, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Avatar from '../ui/users/Avatar';
import { NewsService } from '../../services/newsService';

const NewsCard = ({ article, showAuthor = true, showActions = false, onDelete }) => {
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
    const articleUrl = `${window.location.origin}/news/${article.id}`;
    
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.excerpt,
        url: articleUrl
      });
    } else {
      navigator.clipboard.writeText(articleUrl);
      // You could add a toast notification here
    }
  };

  const handleEdit = () => {
    navigate(`/news/edit/${article.id}`);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      try {
        await NewsService.deleteNewsArticle(article.id);
        // Call the onDelete callback to refresh the news list
        if (onDelete) {
          onDelete(article.id);
        }
      } catch (error) {
        console.error('Failed to delete article:', error);
        alert('Failed to delete article. Please try again.');
      }
    }
  };

  const handleViewArticle = () => {
    navigate(`/news/${article.id}`);
  };

  const handleAuthorClick = (e) => {
    e.stopPropagation(); // Prevent article click
    navigate(`/profile/${article.author.name}`);
  };

    return (
    <div
      className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden transition-transform transition-colors duration-300 hover:scale-105 h-full flex flex-col"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-800 cursor-pointer" onClick={handleViewArticle}>
        <img 
          src={article.imageUrl || '/news-placeholder.jpg'} 
          alt={article.title}
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Content Container */}
      <div className="p-3 flex-1 flex flex-col">
        {/* Author and Date */}
        <div className="flex items-center justify-between mb-1">
          {showAuthor && (
            <div 
              className="flex items-center gap-2 cursor-pointer group/author"
              onClick={handleAuthorClick}
            >
              <Avatar 
                src={article.author.avatar} 
                alt={article.author.name} 
                size="sm" 
              />
              <span className="text-sm text-gray-300 group-hover/author:text-green-400 transition-colors">{article.author.name}</span>
            </div>
          )}
          
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Calendar className="w-3 h-3" />
            <span>{formatTimeAgo(article.createdAt)}</span>
          </div>
        </div>
        
        {/* Title */}
        <h3 
          className="text-base font-bold text-white mb-1 leading-tight cursor-pointer hover:text-green-400 transition-colors"
          onClick={handleViewArticle}
        >
          {article.title}
        </h3>
        
        {/* Excerpt */}
        <p className="text-gray-400 text-xs leading-relaxed mb-2 flex-1 line-clamp-2">
          {article.excerpt}
        </p>
        
        {/* Actions */}
        <div className="flex items-center justify-between mt-auto">
          <button 
            onClick={handleViewArticle}
            className="text-sm font-medium hover:text-green-400 transition-colors self-start cursor-pointer text-green-500"
          >
            READ MORE
          </button>
          
          {/* User Actions (only for user's own articles) */}
          {showActions && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleEdit}
                className="p-1 text-gray-400 hover:text-yellow-400 transition-colors rounded"
                title="Edit"
              >
                <Edit className="w-4 h-4" />
              </button>
              
              <button
                onClick={handleDelete}
                className="p-1 text-gray-400 hover:text-red-400 transition-colors rounded"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewsCard;
