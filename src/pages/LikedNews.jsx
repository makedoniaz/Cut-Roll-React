import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Heart } from 'lucide-react';
import NewsFeed from '../components/news/NewsFeed';
import { useAuthStore } from '../stores/authStore';
import { useNavigation } from '../hooks/useNavigation';

const LikedNews = () => {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  const { goToNewsSearch } = useNavigation();
  const [loading, setLoading] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/news');
    }
  }, [isAuthenticated, user, navigate]);

  const handleBackToNews = () => {
    navigate('/news');
  };

  if (!isAuthenticated || !user) {
    return null; // Will redirect
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div className="flex items-center gap-4 mb-4 sm:mb-0">
          <button
            onClick={handleBackToNews}
            className="flex items-center justify-center p-2 text-white hover:text-green-400 rounded-lg transition-colors duration-200"
            title="Back to News"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <Heart className="w-8 h-8 text-red-500" />
              Liked News
            </h1>
            <p className="text-gray-400">
              All the news articles you've liked and saved
            </p>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => goToNewsSearch('')}
            className="flex items-center justify-center p-3 text-white hover:text-green-400 rounded-lg transition-colors duration-200"
            title="Search All News"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div>
        <LikedNewsFeed 
          loading={loading}
          setLoading={setLoading}
        />
      </div>
    </div>
  );
};

// Custom component for liked news feed
const LikedNewsFeed = ({ loading, setLoading }) => {
  const [news, setNews] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchLikedNews = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { NewsService } = await import('../services/newsService');
        const likedNewsData = await NewsService.getLikedNews(1, 20);
        
        console.log('Liked news data received:', likedNewsData);
        
        // Handle the API response structure
        let rawArticles = [];
        if (likedNewsData && Array.isArray(likedNewsData.data)) {
          rawArticles = likedNewsData.data;
        } else if (Array.isArray(likedNewsData)) {
          rawArticles = likedNewsData;
        } else {
          console.warn('Unexpected liked news data structure:', likedNewsData);
          rawArticles = [];
        }
        
        // Transform the data to match NewsCard expectations
        const transformedArticles = transformNewsData(rawArticles);
        console.log('Transformed liked articles:', transformedArticles);
        setNews(transformedArticles);
        setSuccess(true);
        
      } catch (err) {
        console.error('Error fetching liked news:', err);
        setError(err.message || 'Failed to fetch liked news articles. Please try again later.');
        setSuccess(false);
      } finally {
        setLoading(false);
      }
    };

    fetchLikedNews();
  }, [setLoading]);

  const transformNewsData = (rawArticles) => {
    return rawArticles.map(article => ({
      id: article.id,
      title: article.title,
      content: article.content,
      author: article.author || article.authorName || 'Unknown Author',
      authorId: article.authorId,
      publishedAt: article.publishedAt || article.createdAt || article.date,
      likes: article.likes || 0,
      photo: article.photo || article.imageUrl,
      references: article.references || []
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 bg-gray-900 border border-gray-700 rounded-lg">
        <div className="text-6xl mb-4">😞</div>
        <h3 className="text-xl font-semibold text-white mb-2">
          Failed to Load Liked News
        </h3>
        <p className="text-gray-400 mb-4">
          {error}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!success || news.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-900 border border-gray-700 rounded-lg">
        <div className="text-6xl mb-4">💔</div>
        <h3 className="text-xl font-semibold text-white mb-2">
          No Liked News Yet
        </h3>
        <p className="text-gray-400 mb-4">
          Start liking news articles to see them here. Go back to the news page and like some articles!
        </p>
        <button
          onClick={() => window.history.back()}
          className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200"
        >
          Back to News
        </button>
      </div>
    );
  }

  // Create rows dynamically based on actual news count
  const itemsPerRow = 3; // 3 items per row on large screens
  const rows = [];
  
  for (let i = 0; i < news.length; i += itemsPerRow) {
    const rowItems = news.slice(i, i + itemsPerRow);
    rows.push(rowItems);
  }

  return (
    <div className="space-y-6">
      {rows.map((rowItems, rowIndex) => (
        <div key={rowIndex} className="flex flex-wrap gap-6">
          {rowItems.map((article, itemIndex) => (
            <div key={article.id} className="w-full md:w-1/2 lg:w-1/3 bg-gray-900 border border-gray-700 rounded-lg overflow-hidden hover:border-gray-600 transition-colors duration-200">
              {/* Article Image */}
              {article.photo && (
                <div className="aspect-video bg-gray-800">
                  <img
                    src={article.photo}
                    alt={article.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
              
              {/* Article Content */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                  {article.title}
                </h3>
                
                <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                  {article.content}
                </p>
                
                {/* Article Meta */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{article.author}</span>
                  <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                </div>
                
                {/* Likes */}
                <div className="flex items-center gap-2 mt-3 text-red-500">
                  <Heart className="w-4 h-4 fill-current" />
                  <span className="text-sm">{article.likes} likes</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default LikedNews;
