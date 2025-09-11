import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
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
            Stay updated with the latest movie news, reviews, and industry insights
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="mt-4 sm:mt-0 flex items-center gap-3">
          <button
            onClick={() => goToNewsSearch('')}
            className="flex items-center justify-center p-3 text-white hover:text-green-400 rounded-lg transition-colors duration-200"
            title="Search News"
          >
            <Search className="w-5 h-5" />
          </button>
          
          {/* Create Article Button - Only for Admin and Publisher roles */}
          {hasAdminOrPublisherRole() && (
            <button
              onClick={handleCreateArticle}
              className="flex items-center justify-center p-3 text-white hover:text-green-400 rounded-lg transition-colors duration-200"
              title="Create Article"
            >
              <Plus className="w-5 h-5" />
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

export default NewsPage;
