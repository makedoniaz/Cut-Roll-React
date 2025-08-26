import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import NewsFeed from '../components/news/NewsFeed';
import NewsSectionHeading from '../components/news/NewsSectionHeading';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';
import { useNavigation } from '../hooks/useNavigation';

const NewsPage = () => {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  const { goToNewsSearch } = useNavigation();
  
  const [activeTab, setActiveTab] = useState('recent');
  const [loading, setLoading] = useState(false);

  const handleCreateArticle = () => {
    navigate('/news/create');
  };

  const handleTabChange = (tabId) => {
    // For non-authenticated users, only allow 'recent' tab
    if (!isAuthenticated && (tabId === 'my' || tabId === 'liked')) {
      return;
    }
    setActiveTab(tabId);
  };

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
        
        {/* Action Buttons */}
        <div className="mt-4 sm:mt-0 flex items-center gap-3">
          <button
            onClick={() => goToNewsSearch('')}
            className="flex items-center gap-2 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors duration-200"
          >
            <Search className="w-5 h-5" />
            Search News
          </button>
          
          {/* Create Article Button - Only for authenticated users */}
          {isAuthenticated && (
            <button
              onClick={handleCreateArticle}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200"
            >
              <Plus className="w-5 h-5" />
              Create Article
            </button>
          )}
        </div>
      </div>

      {/* News Section Heading with Tabs */}
      <NewsSectionHeading
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onMoreClick={() => goToNewsSearch('')}
        isAuthenticated={isAuthenticated}
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
        
        {activeTab === 'my' && isAuthenticated && (
          <NewsFeed 
            type="user"
            userId={user?.id}
            loading={loading}
            setLoading={setLoading}
          />
        )}

        {activeTab === 'liked' && isAuthenticated && (
          <div className="text-center p-8 bg-gray-900 border border-gray-700 rounded-lg">
            <div className="text-6xl mb-4">❤️</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Liked News
            </h3>
            <p className="text-gray-400 mb-4">
              Articles you've liked will appear here. Start liking news articles to see them in this tab.
            </p>
          </div>
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
