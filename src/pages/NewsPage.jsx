import { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import NewsGrid from '../components/news/NewsGrid';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';
import { NewsService } from '../services/newsService';
import { getPlainText } from '../utils/contentParser';

// Transform API response to NewsCard expected format
const transformNewsData = (apiData) => {
  if (!Array.isArray(apiData)) {
    console.warn('transformNewsData: Expected array, got:', typeof apiData);
    return [];
  }

  return apiData.map(article => {
    if (!article) {
      console.warn('transformNewsData: Null or undefined article found');
      return null;
    }

    // Calculate estimated read time based on content length
    const wordCount = article.content ? article.content.split(' ').length : 0;
    const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200)); // Assume 200 words per minute
    
    return {
      id: article.id || `temp-${Date.now()}-${Math.random()}`,
      title: article.title || 'Untitled Article',
      content: article.content || '',
      excerpt: article.content 
        ? (() => {
            const plainText = getPlainText(article.content);
            return plainText.length > 200 
              ? plainText.substring(0, 200).trim() + '...' 
              : plainText.trim();
          })()
        : 'No content available',
      likes: article.likesCount || 0,
      likesCount: article.likesCount || 0,
      comments: 0, // Not provided by API yet
      category: 'News', // Default category since not provided by API
      imageUrl: article.photoPath || '/news-placeholder.jpg', // Use photoPath from API
      readTime: `${readTimeMinutes} min read`,
      publishedAt: article.createdAt || new Date().toISOString(),
      createdAt: article.createdAt || new Date().toISOString(),
      updatedAt: article.updatedAt,
      authorId: article.authorId || 'unknown',
      author: {
        id: article.author?.id || article.authorId || 'unknown',
        name: article.author?.userName || 'Anonymous User',
        avatar: article.author?.avatarPath || null
      },
      // Add references data from the new API format
      references: article.newsReferences || []
    };
  }).filter(Boolean); // Remove any null entries
};

const NewsPage = () => {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  
  // State for news data
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Tab state
  const [activeTab, setActiveTab] = useState('recent');

  // Tab configurations
  const tabs = [
    { id: 'recent', label: 'Recent News' },
    { id: 'my-news', label: 'My News' },
    { id: 'liked', label: 'Liked News' }
  ];

  // Memoized fetch function to prevent unnecessary re-renders
  const fetchNews = useCallback(async () => {
    if (loading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch news based on active tab
      let newsData;
      
      if (activeTab === 'my-news' && isAuthenticated && user?.id) {
        // Fetch user's news
        const userNewsData = await NewsService.getUserNews(user.id, 1, 6);
        if (userNewsData && Array.isArray(userNewsData.data)) {
          newsData = userNewsData.data;
        } else if (Array.isArray(userNewsData)) {
          newsData = userNewsData.data;
        }
      } else if (activeTab === 'liked' && isAuthenticated && user?.id) {
        // TODO: Fetch liked news when API is available
        // For now, use empty array
        newsData = [];
      } else {
        // Fetch recent news (August 1st to current date)
        const currentDate = new Date();
        const augustFirst = new Date(currentDate.getFullYear(), 7, 1); // Month is 0-indexed, so 7 = August
        
        const searchParams = {
          query: null,
          authorId: null,
          from: augustFirst.toISOString(),
          to: currentDate.toISOString(),
          referenceToSearch: null,
          page: 1,
          pageSize: 6
        };
        
        const recentNewsData = await NewsService.searchNews(searchParams);
        if (recentNewsData && Array.isArray(recentNewsData.data)) {
          newsData = recentNewsData.data;
        } else if (Array.isArray(recentNewsData)) {
          newsData = recentNewsData;
        }
      }
      
      const transformedData = transformNewsData(newsData || []);
      setNews(transformedData);
      
    } catch (err) {
      console.error('Error fetching news:', err);
      setError(err.message || 'Failed to fetch news articles. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [activeTab, isAuthenticated, user?.id]);

  // Function to refresh news after deletion
  const handleNewsDeleted = useCallback(() => {
    fetchNews();
  }, [fetchNews]);

  // Initial fetch when tab changes
  useEffect(() => {
    fetchNews();
  }, [activeTab, fetchNews]);

  const handleCreateArticle = () => {
    navigate('/news/create');
  };

  // Handle MORE button click - navigate to search page with pre-filled filters
  const handleMoreClick = useCallback((activeTab) => {
    // Navigate to search page with pre-filled filters based on active tab
    const searchParams = new URLSearchParams();
    
    if (activeTab === 'recent') {
      // For recent news, set date range filters
      const currentDate = new Date();
      const augustFirst = new Date(currentDate.getFullYear(), 7, 1);
      searchParams.set('from', augustFirst.toISOString());
      searchParams.set('to', currentDate.toISOString());
    } else if (activeTab === 'my-news') {
      // For my news, set author filter
      if (user?.id) {
        searchParams.set('authorId', user.id);
      }
    }
    // For liked news, no specific filters needed
    
    navigate(`/search?type=news&${searchParams.toString()}`);
  }, [navigate, user?.id]);

  // Only show full page loading on initial load
  if (loading && news.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading news articles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
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
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">News</h1>
          <p className="text-gray-400">
            Stay updated with the latest movie news, reviews, and industry insights
          </p>
        </div>
        
        {/* Create Article Button - Only for authenticated users */}
        {isAuthenticated && (
          <button
            onClick={handleCreateArticle}
            className="mt-4 sm:mt-0 flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200"
          >
            <Plus className="w-5 h-5" />
            Create Article
          </button>
        )}
      </div>

                     {/* Single News Section with Tabs */}
        <NewsGrid 
          heading=""
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onMoreClick={handleMoreClick}
          news={news}
          showAuthor={activeTab !== 'my-news'}
          showActions={activeTab === 'my-news'}
          onNewsDeleted={handleNewsDeleted}
        />

       

      {/* Welcome message for non-authenticated users */}
      {!isAuthenticated && (
        <div className="mt-12 text-center p-8 bg-gray-900 border border-gray-700 rounded-lg">
          <div className="text-6xl mb-4">📰</div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Want to share your thoughts?
          </h3>
          <p className="text-gray-400 mb-4">
            Sign in to create your own news articles and share your movie insights with the community.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200"
          >
            Sign In
          </button>
        </div>
      )}
    </div>
  );
};

export default NewsPage;
