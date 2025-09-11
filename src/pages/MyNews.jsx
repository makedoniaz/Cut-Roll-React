import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Search } from 'lucide-react';
import NewsFeed from '../components/news/NewsFeed';
import { useAuthStore } from '../stores/authStore';
import { useNavigation } from '../hooks/useNavigation';
import { USER_ROLES } from '../constants/adminDashboard';

const MyNews = () => {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  const { goToNewsSearch } = useNavigation();
  const [loading, setLoading] = useState(false);

  // Redirect if not authenticated or doesn't have admin/publisher role
  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/news');
      return;
    }

    // Check if user has Admin or Publisher role
    const hasAdminOrPublisherRole = () => {
      if (!isAuthenticated || !user) return false;
      
      const userRole = user.role;
      
      // Check numeric values
      if (userRole === USER_ROLES.ADMIN || userRole === USER_ROLES.PUBLISHER) {
        return true;
      }
      
      // Check string values
      if (userRole === 'Admin' || userRole === 'Publisher') {
        return true;
      }
      
      return false;
    };

    if (!hasAdminOrPublisherRole()) {
      navigate('/news');
    }
  }, [isAuthenticated, user, navigate]);

  const handleBackToNews = () => {
    navigate('/news');
  };

  const handleCreateArticle = () => {
    navigate('/news/create');
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
            <h1 className="text-4xl font-bold text-white mb-2">My News</h1>
            <p className="text-gray-400">
              Manage and view all your published news articles
            </p>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => goToNewsSearch('', { authorId: user.id })}
            className="flex items-center justify-center p-3 text-white hover:text-green-400 rounded-lg transition-colors duration-200"
            title="Search My News"
          >
            <Search className="w-5 h-5" />
          </button>
          
          <button
            onClick={handleCreateArticle}
            className="flex items-center justify-center p-3 text-white hover:text-green-400 rounded-lg transition-colors duration-200"
            title="Create New Article"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="min-h-96">
        <NewsFeed 
          type="user"
          userId={user.id}
          loading={loading}
          setLoading={setLoading}
        />
      </div>
    </div>
  );
};

export default MyNews;
