import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserReviewCard from "../components/ui/reviews/UserReviewCard";
import { ReviewService } from "../services/reviewService";
import { useAuthStore } from "../stores/authStore";

const MyReviews = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [myReviews, setMyReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const fetchMyReviews = async (page = 1) => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      console.log('🔍 Fetching my reviews...');
      
      const params = {
        userId: user.id,
        page: page - 1, // API uses 0-based pages
        pageSize: 10
      };
      
      console.log('📤 My reviews params:', params);
      const result = await ReviewService.getReviewsByUser(params);
      console.log('📥 My reviews result:', result);
      
      // Extract the data array from the API response
      const reviewsData = result.data || result.items || result || [];
      
      setMyReviews(reviewsData);
      setTotalResults(result.totalCount || reviewsData.length);
      setTotalPages(Math.ceil((result.totalCount || reviewsData.length) / 10));
      setCurrentPage(page);
      console.log('✅ My reviews set:', reviewsData);
    } catch (error) {
      console.error('❌ Error fetching my reviews:', error);
      setMyReviews([]);
      setTotalResults(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
      console.log('🏁 My reviews loading finished');
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchMyReviews(1);
    }
  }, [isAuthenticated, user?.id]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchMyReviews(page);
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
        <h1 className="text-3xl font-bold text-white">My Reviews</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/reviews')}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Back to Reviews
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="min-h-96">
        {loading ? (
          <div className="text-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
            <div className="text-white text-xl mt-4">Loading your reviews...</div>
          </div>
        ) : myReviews.length > 0 ? (
          <div>
            {/* Results Count */}
            <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
              <div className="text-gray-300">
                <span className="font-semibold text-green-400">
                  Found {totalResults} review{totalResults !== 1 ? 's' : ''} written by you
                </span>
              </div>
            </div>

            {/* Reviews Grid */}
            <div className="space-y-6">
              {myReviews.map((review) => (
                <UserReviewCard key={review.id} review={review} />
              ))}
            </div>

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
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No Reviews Written
            </h3>
            <p className="text-gray-400 mb-4">
              Reviews you've written will appear here. Start writing reviews to share your thoughts on movies!
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => navigate('/movies')}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200"
              >
                Browse Movies
              </button>
              <button
                onClick={() => navigate('/reviews')}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors duration-200"
              >
                Browse Reviews
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReviews;
