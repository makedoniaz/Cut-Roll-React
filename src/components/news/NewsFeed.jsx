import { useState, useEffect } from 'react';
import NewsCard from './NewsCard';
import { useAuthStore } from '../../stores/authStore';

const NewsFeed = ({ type = 'all', userId = null, loading, setLoading }) => {
  const [news, setNews] = useState([]);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // TODO: Replace with actual API call
        // For now, set empty array to show no articles state
        setNews([]);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (err) {
        setError('Failed to fetch news articles');
        console.error('Error fetching news:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [type, userId, setLoading]);

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="bg-gray-900 border border-gray-700 rounded-lg p-6 animate-pulse">
            <div className="h-48 bg-gray-800 rounded-lg mb-4"></div>
            <div className="h-6 bg-gray-800 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-800 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-800 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-800 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">❌</div>
        <h3 className="text-xl font-semibold text-white mb-2">Error Loading News</h3>
        <p className="text-gray-400 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (news.length === 0) {
    if (type === 'user') {
      return (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-white mb-2">No Articles Yet</h3>
          <p className="text-gray-400 mb-4">
            You haven't published any news articles yet. Start sharing your thoughts with the community!
          </p>
          <button
            onClick={() => window.location.href = '/news/create'}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200"
          >
            Create Your First Article
          </button>
        </div>
      );
    }
    
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📰</div>
        <h3 className="text-xl font-semibold text-white mb-2">No News Available</h3>
        <p className="text-gray-400">
          Check back later for the latest movie news and updates.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {news.map((article) => (
        <NewsCard
          key={article.id}
          article={article}
          showAuthor={type === 'all'}
          showActions={type === 'user'}
        />
      ))}
    </div>
  );
};

export default NewsFeed;
