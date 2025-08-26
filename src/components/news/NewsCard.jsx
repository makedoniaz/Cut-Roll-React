import { useState } from 'react';
import { Heart, Share2, Edit, Trash2, Eye, Calendar } from 'lucide-react';
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
    <div
      className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden transition-transform transition-colors duration-300 hover:scale-105 h-full flex flex-col"
    >
      {/* Image Container */}
      <div className="relative aspect-video overflow-hidden bg-gray-800 cursor-pointer" onClick={handleViewArticle}>
        <img 
          src={article.imageUrl || '/news-placeholder.jpg'} 
          alt={article.title}
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Content Container */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Author and Date */}
        <div className="flex items-center justify-between mb-3">
          {showAuthor && (
            <div className="flex items-center gap-2">
              <Avatar 
                src={article.author.avatar} 
                alt={article.author.name} 
                size="sm" 
              />
              <span className="text-sm text-gray-300">{article.author.name}</span>
            </div>
          )}
          
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Calendar className="w-3 h-3" />
            <span>{formatTimeAgo(article.createdAt)}</span>
          </div>
        </div>
        
        {/* Title */}
        <h3 
          className="text-xl font-bold text-white mb-3 leading-tight cursor-pointer hover:text-green-400 transition-colors"
          onClick={handleViewArticle}
        >
          {article.title}
        </h3>
        
        {/* Excerpt */}
        <p className="text-gray-400 text-sm leading-relaxed mb-4 flex-1">
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
                className="p-1 text-yellow-400 hover:text-yellow-300 transition-colors rounded hover:bg-yellow-500/20"
                title="Edit"
              >
                <Edit className="w-4 h-4" />
              </button>
              
                              <button
                  onClick={handleDelete}
                  className="p-1 text-red-400 hover:text-red-300 transition-colors rounded hover:bg-red-500/20"
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
