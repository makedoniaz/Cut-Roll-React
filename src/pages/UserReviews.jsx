import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import UserReviewCard from "../components/ui/reviews/UserReviewCard";
import { ReviewService } from "../services/reviewService";
import { UserService } from "../services/userService";

const UserReviews = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userReviews, setUserReviews] = useState([]);
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

  const fetchUserReviews = async (page = 1) => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      console.log('🔍 Fetching user reviews for:', username);
      
      const params = {
        userId: user.id,
        page: page - 1, // API uses 0-based pages
        pageSize: 10
      };
      
      console.log('📤 User reviews params:', params);
      const result = await ReviewService.getReviewsByUser(params);
      console.log('📥 User reviews result:', result);
      
      // Extract the data array from the API response
      const reviewsData = result.data || result.items || result || [];
      
      setUserReviews(reviewsData);
      setTotalResults(result.totalCount || reviewsData.length);
      setTotalPages(Math.ceil((result.totalCount || reviewsData.length) / 10));
      setCurrentPage(page);
      console.log('✅ User reviews set:', reviewsData);
    } catch (error) {
      console.error('❌ Error fetching user reviews:', error);
      setUserReviews([]);
      setTotalResults(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
      console.log('🏁 User reviews loading finished');
    }
  };

  useEffect(() => {
    fetchUser();
  }, [username]);

  useEffect(() => {
    if (user?.id) {
      fetchUserReviews(1);
    }
  }, [user?.id]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchUserReviews(page);
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
          <h1 className="text-3xl font-bold text-white">{user.username}'s Reviews</h1>
          <p className="text-gray-400 mt-2">Reviews written by {user.username}</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/profile/${username}`)}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            View Profile
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="min-h-96">
        {loading ? (
          <div className="text-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
            <div className="text-white text-xl mt-4">Loading {user.username}'s reviews...</div>
          </div>
        ) : userReviews.length > 0 ? (
          <div>
            {/* Results Count */}
            <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
              <div className="text-gray-300">
                <span className="font-semibold text-green-400">
                  Found {totalResults} review{totalResults !== 1 ? 's' : ''} written by {user.username}
                </span>
              </div>
            </div>

            {/* Reviews Grid */}
            <div className="space-y-6">
              {userReviews.map((review) => (
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
              {user.username} hasn't written any reviews yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserReviews;
