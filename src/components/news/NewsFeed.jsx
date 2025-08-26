import { useState, useEffect } from 'react';
import NewsCard from './NewsCard';
import { useAuthStore } from '../../stores/authStore';
import { NewsService } from '../../services/newsService';
import { getPlainText } from '../../utils/contentParser';

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
    
    // Log the transformed article for debugging
    console.log('Transformed article:', {
      id: article.id,
      title: article.title,
      photoPath: article.photoPath,
      references: article.newsReferences
    });
  }).filter(Boolean); // Remove any null entries
};

const NewsFeed = ({ type = 'all', userId = null, loading, setLoading }) => {
  const [news, setNews] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      setError(null);
      
      try {
        if (type === 'all') {
          // Fetch recent news articles using search with date range
          console.log('Fetching recent news with search...');
          
          // Set date range: from August 1st to current date
          const currentDate = new Date();
          const augustFirst = new Date(currentDate.getFullYear(), 7, 1); // Month is 0-indexed, so 7 = August
          
          const searchParams = {
            query: null,
            authorId: null,
            from: augustFirst.toISOString(),
            to: currentDate.toISOString(),
            referenceToSearch: null,
            page: 1,
            pageSize: 10
          };
          
          const newsData = await NewsService.searchNews(searchParams);
          console.log('Recent news data received:', newsData);
          
          // Handle the new API response structure
          let rawArticles = [];
          if (newsData && Array.isArray(newsData.data)) {
            rawArticles = newsData.data;
            console.log('Using newsData.data structure, found', rawArticles.length, 'articles');
          } else if (Array.isArray(newsData)) {
            rawArticles = newsData;
            console.log('Using direct array structure, found', rawArticles.length, 'articles');
          } else {
            console.warn('Unexpected news data structure:', newsData);
            rawArticles = [];
          }
          
          // Transform the data to match NewsCard expectations
          const transformedArticles = transformNewsData(rawArticles);
          console.log('Transformed articles:', transformedArticles);
          setNews(transformedArticles);
          setSuccess(true);
        } else if (type === 'user' && userId) {
          // Fetch user's news articles
          console.log('Fetching user news for userId:', userId);
          const userNews = await NewsService.getUserNews(userId, 1, 10);
          console.log('User news data received:', userNews);
          
          // Handle the new API response structure
          let rawArticles = [];
          if (userNews && Array.isArray(userNews.data)) {
            rawArticles = userNews.data;
            console.log('Using userNews.data structure, found', rawArticles.length, 'articles');
          } else if (Array.isArray(userNews)) {
            rawArticles = userNews;
            console.log('Using direct array structure, found', rawArticles.length, 'articles');
          } else {
            console.warn('Unexpected user news data structure:', userNews);
            rawArticles = [];
          }
          
          // Transform the data to match NewsCard expectations
          const transformedArticles = transformNewsData(rawArticles);
          console.log('Transformed user articles:', transformedArticles);
          setNews(transformedArticles);
          setSuccess(true);
        } else {
          setNews([]);
          setSuccess(false);
        }
        
      } catch (err) {
        console.error('Error fetching news:', err);
        setError(err.message || 'Failed to fetch news articles. Please try again later.');
        setSuccess(false);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [type, userId, setLoading]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading news articles...</p>
        </div>
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
        <div className="flex justify-center space-x-3">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200"
          >
            Try Again
          </button>
          <button
            onClick={() => {
              setError(null);
              setSuccess(false);
              setLoading(true);
              // Trigger a re-fetch
              const fetchNews = async () => {
                try {
                  if (type === 'all') {
                    // Set date range: from August 1st to current date
                    const currentDate = new Date();
                    const augustFirst = new Date(currentDate.getFullYear(), 7, 1);
                    
                    const searchParams = {
                      query: null,
                      authorId: null,
                      from: augustFirst.toISOString(),
                      to: currentDate.toISOString(),
                      referenceToSearch: null,
                      page: 1,
                      pageSize: 10
                    };
                    
                    const newsData = await NewsService.searchNews(searchParams);
                    let articles = [];
                    if (newsData && Array.isArray(newsData.data)) {
                      articles = newsData.data;
                    } else if (Array.isArray(newsData)) {
                      articles = newsData;
                    }
                    setNews(articles);
                  } else if (type === 'user' && userId) {
                    const userNews = await NewsService.getUserNews(userId, 1, 10);
                    let articles = [];
                    if (userNews && Array.isArray(userNews.data)) {
                      articles = userNews.data;
                    } else if (Array.isArray(userNews)) {
                      articles = userNews;
                    }
                    setNews(articles);
                  }
                } catch (err) {
                  setError(err.message || 'Failed to fetch news articles. Please try again later.');
                } finally {
                  setLoading(false);
                }
              };
              fetchNews();
            }}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
          >
            Refresh
          </button>
        </div>
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
    <div className="min-h-screen text-white">
      {/* News Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {news.map((article) => (
          <NewsCard
            key={article.id}
            article={article}
            showAuthor={type === 'all'}
            showActions={type === 'user'}
          />
        ))}
      </div>
    </div>
  );
};

export default NewsFeed;
