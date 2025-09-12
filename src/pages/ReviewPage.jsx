import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { ReviewService } from '../services/reviewService';
import { MovieService } from '../services/movieService';
import CommentSection from '../components/ui/comments/CommentSection';
import ConfirmationDialog from '../components/ui/common/ConfirmationDialog';

const ReviewPage = () => {
  const { reviewId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuthStore();
  
  const [review, setReview] = useState(null);
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);

  // Fetch review and movie data
  useEffect(() => {
    const fetchData = async () => {
      if (!reviewId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch the review
        const reviewData = await ReviewService.getReviewById(reviewId);
        setReview(reviewData);
        
        // Fetch the movie details
        if (reviewData.movieId) {
          const movieData = await MovieService.getMovieById(reviewData.movieId);
          setMovie(movieData);
        }
      } catch (err) {
        console.error('Error fetching review:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [reviewId]);

  // Helper functions
  const getPosterUrl = (images) => {
    const poster = images?.find(img => img.type === 'poster');
    if (poster?.filePath) {
      return `https://image.tmdb.org/t/p/w500${poster.filePath}`;
    }
    return '/poster-placeholder.png';
  };

  const getReleaseYear = () => {
    if (!movie?.releaseDate) return 'TBA';
    return new Date(movie.releaseDate).getFullYear();
  };

  const getReviewUserName = () => {
    return review?.userSimplified?.userName || 
           review?.userName || 
           review?.username || 
           review?.authorName || 
           review?.author || 
           'Anonymous';
  };

  const isMyReview = () => {
    if (!isAuthenticated || !user || !review) return false;
    const reviewUserId = review.userId || review.user?.id || review.userSimplified?.id;
    return reviewUserId && String(reviewUserId) === String(user.id);
  };

  const handleDeleteReview = async () => {
    if (!isAuthenticated || !user?.id) {
      navigate('/login');
      return;
    }

    setShowDeleteConfirmDialog(true);
  };

  const confirmDeleteReview = async () => {
    try {
      await ReviewService.deleteReview(reviewId);
      navigate(`/movie/${movie.id}`, { 
        replace: true,
        state: { message: 'Review deleted successfully' }
      });
    } catch (err) {
      console.error('Failed to delete review:', err);
      alert(err.message || 'Failed to delete review.');
    }
  };

  const handleAddComment = (commentText) => {
    console.log('Adding comment:', commentText);
    // TODO: Implement comment functionality when available
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-800 rounded mb-8 w-32"></div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-3">
                <div className="h-96 bg-gray-800 rounded"></div>
              </div>
              <div className="lg:col-span-9">
                <div className="h-32 bg-gray-800 rounded mb-6"></div>
                <div className="h-64 bg-gray-800 rounded mb-6"></div>
                <div className="h-48 bg-gray-800 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-400 mb-4">Error Loading Review</h1>
            <p className="text-gray-400 mb-6">{error}</p>
            <button 
              onClick={() => navigate('/reviews')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
            >
              Back to Reviews
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No review data
  if (!review) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-400 mb-4">Review Not Found</h1>
            <button 
              onClick={() => navigate('/reviews')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
            >
              Back to Reviews
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Go Back
          </button>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column - Movie Poster (3 cols) */}
          <div className="lg:col-span-3">
            <div className="sticky top-8">
              {movie && (
                <div className="space-y-4">
                  {/* Movie Poster */}
                  <div className="relative">
                    <div className="w-full aspect-[2/3] rounded-lg shadow-2xl relative overflow-hidden">
                      {movie.images ? (
                        <img 
                          src={getPosterUrl(movie.images)} 
                          alt={movie.title} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      
                      {/* Fallback placeholder */}
                      <div className={`absolute inset-0 flex items-center justify-center bg-gradient-to-b from-blue-400 to-green-400 ${movie.images ? 'hidden' : 'flex'}`}>
                        <div className="text-center">
                          <div className="bg-yellow-400 text-black px-8 py-16 rounded">
                            <div className="text-6xl font-bold mb-2">🎬</div>
                            <div className="text-xl font-bold">MOVIE</div>
                          </div>
                          <div className="text-3xl font-bold text-white mt-4 drop-shadow-lg">
                            {movie.title}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Movie Info */}
                  <div className="ounded-lg p-4">
                    <button
                      onClick={() => navigate(`/movie/${movie.id}`)}
                      className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded transition-colors text-sm"
                    >
                      View Movie Details
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Review Content (9 cols) */}
          <div className="lg:col-span-9 space-y-6">
            
            {/* Review Card - New Design */}
            <div className="rounded-lg p-6">
              {/* Header with avatar and "Review by" */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-white font-semibold">
                  {getReviewUserName().charAt(0).toUpperCase()}
                </div>
                <span className="text-gray-400 text-sm">
                  Review by <span className="text-white font-medium">{getReviewUserName()}</span>
                </span>
              </div>

              {/* Movie Title and Year */}
              {movie && (
                <div className="mb-4">
                  <h1 className="text-4xl font-bold tracking-wider text-white mb-2">
                    {movie.title.toUpperCase()}
                  </h1>
                  <span className="text-gray-400 text-lg">{getReleaseYear()}</span>
                </div>
              )}

              {/* Rating Stars */}
              {(review.rating !== undefined && review.rating !== null) && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => {
                      const starValue = i + 1;
                      const isHalfStar = review.rating >= starValue - 0.5 && review.rating < starValue;
                      const isFullStar = review.rating >= starValue;
                      
                      return (
                        <div key={i} className="relative">
                          {isHalfStar ? (
                            <>
                              <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              <div className="absolute inset-0 overflow-hidden">
                                <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20" style={{ clipPath: 'inset(0 50% 0 0)' }}>
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              </div>
                            </>
                          ) : (
                            <svg className={`w-6 h-6 ${isFullStar ? 'text-green-500' : 'text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Watched Date */}
              <div className="text-gray-400 text-sm mb-6">
                Watched {new Date(review.createdAt || review.createdDate || review.dateCreated || review.date || Date.now()).toLocaleDateString('en-GB', { 
                  day: 'numeric', 
                  month: 'short', 
                  year: 'numeric' 
                })}
              </div>

              {/* Review Text */}
              <div className="mb-6">
                <p className="text-gray-300 leading-relaxed text-base">
                  {review.content || review.text || review.reviewText || 'No review content available.'}
                </p>
              </div>

              {/* Like Review Button */}
              <div className="flex items-center gap-4 mb-6">
                <button className="flex items-center gap-2 text-gray-400 hover:text-green-500 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                  </svg>
                  <span>Like review</span>
                </button>

                {/* Mobile Movie Link */}
                {movie && (
                  <div className="lg:hidden">
                    <button
                      onClick={() => navigate(`/movie/${movie.id}`)}
                      className="text-blue-400 hover:text-blue-300 transition-colors text-sm"
                    >
                      → View Movie Details
                    </button>
                  </div>
                )}
              </div>

              {/* Action Buttons for Review Owner */}
              {isMyReview() && (
                <div className="flex gap-3 pt-4 border-t border-gray-700">
                  <button
                    onClick={() => navigate(`/movie/${movie?.id}/review/edit/${review.id}`)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors text-sm"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M17.414 2.586a2 2 0 010 2.828l-9.9 9.9a2 2 0 01-.878.502l-3.293.823a1 1 0 01-1.212-1.212l.823-3.293a2 2 0 01.502-.878l9.9-9.9a2 2 0 012.828 0zM15 4l-9.5 9.5-.5 2 2-.5L16 5 15 4z" />
                    </svg>
                    Edit Review
                  </button>
                  <button
                    onClick={handleDeleteReview}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors text-sm"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M6 7a1 1 0 011-1h6a1 1 0 011 1v9a2 2 0 01-2 2H8a2 2 0 01-2-2V7zm3-3a1 1 0 00-1 1v1H6a1 1 0 000 2h8a1 1 0 100-2h-2V5a1 1 0 00-1-1H9z" />
                    </svg>
                    Delete Review
                  </button>
                </div>
              )}
            </div>

            {/* Comments Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Comments</h2>
              <CommentSection
                initialComments={[]}
                onAddComment={handleAddComment}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Delete Review Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteConfirmDialog}
        onClose={() => setShowDeleteConfirmDialog(false)}
        onConfirm={confirmDeleteReview}
        title="Delete Review"
        message="Are you sure you want to delete your review? This action cannot be undone."
        confirmText="Yes, Delete"
        cancelText="Cancel"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
      />
    </div>
  );
};

export default ReviewPage;
