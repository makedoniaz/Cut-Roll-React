import { useState, useEffect } from 'react';
import { Plus, Search, Heart } from 'lucide-react';
import NewsFeed from '../components/news/NewsFeed';
import TabNav from '../components/ui/common/TabNav';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';
import { useNavigation } from '../hooks/useNavigation';
import { USER_ROLES } from '../constants/adminDashboard';

const NewsPage = () => {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  const { goToNewsSearch } = useNavigation();
  
  const [activeTab, setActiveTab] = useState('recent');
  const [loading, setLoading] = useState(false);

  // Check if user has Admin or Publisher role
  const hasAdminOrPublisherRole = () => {
    if (!isAuthenticated || !user) return false;
    
    // Handle both string and numeric role values
    const userRole = user.role;
    
    // Debug logging
    console.log('🔍 Role check:', {
      isAuthenticated,
      userRole,
      userRoleType: typeof userRole,
      USER_ROLES_ADMIN: USER_ROLES.ADMIN,
      USER_ROLES_PUBLISHER: USER_ROLES.PUBLISHER,
      isNumericAdmin: userRole === USER_ROLES.ADMIN,
      isNumericPublisher: userRole === USER_ROLES.PUBLISHER,
      isStringAdmin: userRole === 'Admin',
      isStringPublisher: userRole === 'Publisher'
    });
    
    // Check numeric values
    if (userRole === USER_ROLES.ADMIN || userRole === USER_ROLES.PUBLISHER) {
      console.log('✅ Role check passed (numeric)');
      return true;
    }
    
    // Check string values
    if (userRole === 'Admin' || userRole === 'Publisher') {
      console.log('✅ Role check passed (string)');
      return true;
    }
    
    console.log('❌ Role check failed');
    return false;
  };

  const handleCreateArticle = () => {
    navigate('/news/create');
  };

  const handleTabChange = (tabId) => {
    // For non-authenticated users, only allow 'recent' tab
    if (!isAuthenticated && (tabId === 'my' || tabId === 'liked')) {
      return;
    }
    // For authenticated users without Admin/Publisher role, don't allow 'my' tab
    if (isAuthenticated && !hasAdminOrPublisherRole() && tabId === 'my') {
      return;
    }
    setActiveTab(tabId);
  };

  const tabs = [
    { id: "recent", label: "Recent News" },
    ...(isAuthenticated ? [
      ...(hasAdminOrPublisherRole() ? [{ id: "my", label: "My News" }] : []),
      { id: "liked", label: "Liked News" }
    ] : [])
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">News</h1>
          <p className="text-gray-400">
            Stay updated with the latest movie news and industry insights
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="mt-4 sm:mt-0 flex items-center gap-3">
          <button
            onClick={() => goToNewsSearch('')}
            className="flex items-center justify-center p-3 text-white hover:text-green-400 rounded-lg transition-colors duration-200 group relative"
          >
            <Search className="w-5 h-5" />
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
              Search News
            </div>
          </button>
          
          {/* Create Article Button - Only for Admin and Publisher roles */}
          {hasAdminOrPublisherRole() && (
            <button
              onClick={handleCreateArticle}
              className="flex items-center justify-center p-3 text-white hover:text-green-400 rounded-lg transition-colors duration-200 group relative"
            >
              <Plus className="w-5 h-5" />
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                Create Article
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <TabNav 
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        showMoreButton={true}
        onMoreClick={() => {
          if (activeTab === 'recent') {
            // For recent tab, pass date range filters (current date to week ago)
            const today = new Date();
            const weekAgo = new Date();
            weekAgo.setDate(today.getDate() - 7);
            
            const dateRange = {
              from: weekAgo.toISOString().split('T')[0], // Format as YYYY-MM-DD
              to: today.toISOString().split('T')[0]      // Format as YYYY-MM-DD
            };
            
            goToNewsSearch('', { dateRange });
          } else if (activeTab === 'my') {
            // For "My News" tab, redirect to MyNews page
            navigate('/news/my');
          } else if (activeTab === 'liked') {
            // For "Liked News" tab, redirect to LikedNews page
            navigate('/news/liked');
          } else {
            // For other tabs, just go to search without filters
            goToNewsSearch('');
          }
        }}
      />

      {/* Content based on active tab */}
      <div className="min-h-96">
        {activeTab === 'recent' && (
          <NewsFeed 
            type="all"
            loading={loading}
            setLoading={setLoading}
          />
        )}
        
        {activeTab === 'my' && hasAdminOrPublisherRole() && (
          <NewsFeed 
            type="user"
            userId={user?.id}
            loading={loading}
            setLoading={setLoading}
          />
        )}

        {activeTab === 'liked' && isAuthenticated && (
          <LikedNewsFeed 
            userId={user?.id}
            loading={loading}
            setLoading={setLoading}
          />
        )}
      </div>

      {/* Welcome message for non-authenticated users */}
      {!isAuthenticated && (
        <div className="mt-12 text-center p-8 bg-gray-900 border border-gray-700 rounded-lg">
          <div className="text-6xl mb-4">📰</div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Want to share your thoughts?
          </h3>
          <p className="text-gray-400 mb-4">
            Sign in to access news features. Admin and Publisher users can create articles and view their own news.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200"
          >
            Sign In
          </button>
        </div>
      )}

      {/* Message for authenticated users without Admin/Publisher role */}
      {isAuthenticated && !hasAdminOrPublisherRole() && (
        <div className="mt-12 text-center p-8 bg-gray-900 border border-gray-700 rounded-lg">
          <div className="text-6xl mb-4">📰</div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Want to create news articles?
          </h3>
          <p className="text-gray-400 mb-4">
            Only Admin and Publisher users can create news articles. Contact an administrator to request publisher privileges.
          </p>
        </div>
      )}
    </div>
  );
};

// Custom component for liked news feed
const LikedNewsFeed = ({ userId, loading, setLoading }) => {
  const [news, setNews] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchLikedNews = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { NewsService } = await import('../services/newsService');
        const likedNewsData = await NewsService.getUserLikedNews(userId, 1, 20);
        
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

    if (userId) {
      fetchLikedNews();
    }
  }, [userId, setLoading]);

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

export default NewsPage;
