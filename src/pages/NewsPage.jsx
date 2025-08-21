import { useState, useEffect, useCallback } from 'react';
import { Plus, Newspaper, User } from 'lucide-react';
import NewsFeed from '../components/news/NewsFeed';
import TabNav from '../components/ui/common/TabNav';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';
import NewsForm from '../components/ui/forms/NewsForm';

const NewsPage = () => {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const tabs = [
    {
      id: 'all',
      label: 'All News',
      icon: <Newspaper className="w-4 h-4" />,
      count: null
    },
    ...(isAuthenticated ? [{
      id: 'my-news',
      label: 'My News',
      icon: <User className="w-4 h-4" />,
      count: null
    }] : [])
  ];

  const handleCreateArticle = () => {
    setShowCreateForm(true);
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setShowCreateForm(false);
  };

  const handleFormClose = () => {
    setShowCreateForm(false);
  };

  // If showing create form, render the form
  if (showCreateForm) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={handleFormClose}
            className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            ← Back to News
          </button>
          <div className="h-6 w-px bg-gray-700"></div>
          <h1 className="text-3xl font-bold text-white">Create News Article</h1>
        </div>
        
        <NewsForm onClose={handleFormClose} />
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

      {/* Tab Navigation */}
      <div className="mb-8">
        <TabNav
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          className="bg-gray-900 border border-gray-700 rounded-lg p-1"
        />
      </div>

      {/* Content based on active tab */}
      <div className="min-h-96">
        {activeTab === 'all' && (
          <NewsFeed 
            type="all"
            loading={loading}
            setLoading={setLoading}
          />
        )}
        
        {activeTab === 'my-news' && isAuthenticated && (
          <NewsFeed 
            type="user"
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
