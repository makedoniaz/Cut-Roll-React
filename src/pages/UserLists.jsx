import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MovieListsGrid from "../components/ui/movie-lists/MovieListsGrid";
import { ListsService } from "../services/listsService";
import { UserService } from "../services/userService";

const UserLists = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userLists, setUserLists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userLoading, setUserLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [error, setError] = useState('');

  const fetchUser = async () => {
    if (!username) {
      setError('Username is required');
      setUserLoading(false);
      return;
    }

    try {
      setUserLoading(true);
      const userData = await UserService.getUserByUsername(username);
      setUser(userData);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load user');
    } finally {
      setUserLoading(false);
    }
  };

  const fetchUserLists = async (page = 1) => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      console.log('🔍 Fetching user lists for:', username);
      
      const params = {
        userId: user.id,
        page: page - 1, // API uses 0-based pages
        pageSize: 20
      };
      
      console.log('📤 User lists params:', params);
      const result = await ListsService.getListsByUser(params);
      console.log('📥 User lists result:', result);
      
      // Extract the data array from the API response
      const listsData = result.data || result.items || result || [];
      
      // Transform API data to match MovieListCard expected structure
      const transformedLists = listsData.map(list => ({
        id: list.id,
        title: list.title,
        description: list.description,
        coverImages: list.preview || [], // Use preview property from API for movie posters
        author: {
          name: list.userSimplified?.userName || user.username || 'Unknown',
          avatar: list.userSimplified?.avatarPath || user.avatarPath || '👤'
        },
        stats: {
          films: list.moviesCount || 0,
          likes: list.likesCount || 0,
          comments: 0 // API doesn't provide comments count yet
        }
      }));
      
      setUserLists(transformedLists);
      setTotalResults(result.totalCount || transformedLists.length);
      setTotalPages(Math.ceil((result.totalCount || transformedLists.length) / 20));
      setCurrentPage(page);
      console.log('✅ User lists set:', transformedLists);
    } catch (error) {
      console.error('❌ Error fetching user lists:', error);
      setUserLists([]);
      setTotalResults(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
      console.log('🏁 User lists loading finished');
    }
  };

  useEffect(() => {
    fetchUser();
  }, [username]);

  useEffect(() => {
    if (user?.id) {
      fetchUserLists(1);
    }
  }, [user?.id]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchUserLists(page);
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading user profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-lg mb-4">{error}</div>
          <button
            onClick={() => navigate('/')}
            className="text-blue-400 hover:text-blue-300"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-lg">User not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">{user.username}'s Lists</h1>
          <p className="text-gray-400 mt-2">Lists created by {user.username}</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/profile/${username}`)}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            View Profile
          </button>
          <button
            onClick={() => navigate('/lists')}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Back to Lists
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="min-h-96">
        {loading ? (
          <div className="text-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
            <div className="text-white text-xl mt-4">Loading {user.username}'s lists...</div>
          </div>
        ) : userLists.length > 0 ? (
          <div>
            {/* Results Count */}
            <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
              <div className="text-gray-300">
                <span className="font-semibold text-green-400">
                  Found {totalResults} list{totalResults !== 1 ? 's' : ''} created by {user.username}
                </span>
              </div>
            </div>

            {/* Lists Grid */}
            <MovieListsGrid 
              rows={Math.ceil(userLists.length / 4)} 
              itemsPerRow={4} 
              movieLists={userLists}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  <span className="px-4 py-2 text-gray-300">
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center p-8 bg-gray-900 border border-gray-700 rounded-lg">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No Lists Created
            </h3>
            <p className="text-gray-400 mb-4">
              {user.username} hasn't created any lists yet.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => navigate(`/profile/${username}`)}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors duration-200"
              >
                View Profile
              </button>
              <button
                onClick={() => navigate('/lists')}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors duration-200"
              >
                Browse All Lists
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserLists;
