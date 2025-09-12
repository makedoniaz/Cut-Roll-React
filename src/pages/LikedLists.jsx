import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MovieListsGrid from "../components/ui/movie-lists/MovieListsGrid";
import { useAuthStore } from "../stores/authStore";
import { ListsLikeService } from "../services/listsLikeService";

const LikedLists = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [likedLists, setLikedLists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const fetchLikedLists = async (page = 1) => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      console.log('🔍 Fetching liked lists...');
      
      const params = {
        userId: user.id,
        page: page - 1, // API uses 0-based pages
        pageSize: 20
      };
      
      console.log('📤 Liked lists params:', params);
      const result = await ListsLikeService.getLikedLists(params);
      console.log('📥 Liked lists result:', result);
      
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
      
      setLikedLists(transformedLists);
      setTotalResults(result.totalCount || transformedLists.length);
      setTotalPages(Math.ceil((result.totalCount || transformedLists.length) / 20));
      setCurrentPage(page);
      console.log('✅ Liked lists set:', transformedLists);
    } catch (error) {
      console.error('❌ Error fetching liked lists:', error);
      setLikedLists([]);
      setTotalResults(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
      console.log('🏁 Liked lists loading finished');
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchLikedLists(1);
    }
  }, [isAuthenticated, user?.id]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchLikedLists(page);
  };

  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Liked Lists</h1>
        <button
          onClick={() => navigate('/lists')}
          className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Back to Lists
        </button>
      </div>

      {/* Content */}
      <div className="min-h-96">
        {loading ? (
          <div className="text-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
            <div className="text-white text-xl mt-4">Loading liked lists...</div>
          </div>
        ) : likedLists.length > 0 ? (
          <div>
            {/* Results Count */}
            <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
              <div className="text-gray-300">
                <span className="font-semibold text-green-400">
                  Found {totalResults} liked list{totalResults !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Lists Grid */}
            <MovieListsGrid 
              rows={Math.ceil(likedLists.length / 4)} 
              itemsPerRow={4} 
              movieLists={likedLists}
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
            <div className="text-6xl mb-4">❤️</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No Liked Lists
            </h3>
            <p className="text-gray-400 mb-4">
              Lists you've liked will appear here. Start liking movie lists to see them in this page.
            </p>
            <button
              onClick={() => navigate('/lists')}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200"
            >
              Browse Lists
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LikedLists;
