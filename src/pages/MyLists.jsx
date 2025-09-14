import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from 'lucide-react';
import MovieListsGrid from "../components/ui/movie-lists/MovieListsGrid";
import { useAuthStore } from "../stores/authStore";
import { ListsService } from "../services/listsService";

const MyLists = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [myLists, setMyLists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const fetchMyLists = async (page = 1) => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      console.log('🔍 Fetching my lists...');
      
      const params = {
        userId: user.id,
        page: page - 1, // API uses 0-based pages
        pageSize: 20
      };
      
      console.log('📤 My lists params:', params);
      const result = await ListsService.getListsByUser(params);
      console.log('📥 My lists result:', result);
      
      // Extract the data array from the API response
      const listsData = result.data || result.items || result || [];
      
      // Transform API data to match MovieListCard expected structure
      const transformedLists = listsData.map(list => ({
        id: list.id,
        title: list.title,
        description: list.description,
        coverImages: list.preview || [], // Use preview property from API for movie posters
        author: {
          name: list.userSimplified?.userName || 'Unknown',
          avatar: list.userSimplified?.avatarPath || '👤'
        },
        stats: {
          films: list.moviesCount || 0,
          likes: list.likesCount || 0,
          comments: 0 // API doesn't provide comments count yet
        }
      }));
      
      setMyLists(transformedLists);
      setTotalResults(result.totalCount || transformedLists.length);
      setTotalPages(Math.ceil((result.totalCount || transformedLists.length) / 20));
      setCurrentPage(page);
      console.log('✅ My lists set:', transformedLists);
    } catch (error) {
      console.error('❌ Error fetching my lists:', error);
      setMyLists([]);
      setTotalResults(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
      console.log('🏁 My lists loading finished');
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchMyLists(1);
    }
  }, [isAuthenticated, user?.id]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchMyLists(page);
  };

  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-top sm:justify-between mb-8">
          <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white">My Lists</h1>
          </div>

        {/* Action Buttons */}
        <div className="mt-4 sm:mt-0 flex items-top gap-3">
          <button
            onClick={() => navigate('/lists/create')}
            className="flex items-center justify-center p-3 text-white hover:text-green-400 rounded-lg transition-colors duration-200 group relative"
          >
            <Plus className="w-5 h-5" />
            {/* Custom Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
              Create List
            </div>
          </button>
        </div>
      </div>

      {/* Content */}
      {/* List Description */}
      <div className="mb-8">
        <p className="text-lg text-gray-300 max-w-4xl leading-relaxed">
            Manage and organize your movie lists
        </p>
      </div>

      <div className="min-h-96">
        {loading ? (
          <div className="text-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
            <div className="text-white text-xl mt-4">Loading your lists...</div>
          </div>
        ) : myLists.length > 0 ? (
          <div>
            {/* Results Count */}
            <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
              <div className="text-gray-300">
                <span className="font-semibold text-green-400">
                  Found {totalResults} list{totalResults !== 1 ? 's' : ''} created by you
                </span>
              </div>
            </div>

            {/* Lists Grid */}
            <MovieListsGrid 
              rows={Math.ceil(myLists.length / 4)} 
              itemsPerRow={4} 
              movieLists={myLists}
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
              Lists you've created will appear here. Create your first list to get started!
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => navigate('/lists/create')}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200"
              >
                Create Your First List
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyLists;
