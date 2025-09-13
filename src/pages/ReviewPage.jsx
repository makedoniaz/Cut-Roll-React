import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { ReviewService } from '../services/reviewService';
import { ReviewLikeService } from '../services/reviewLikeService';
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
  const [isLiked, setIsLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [copied, setCopied] = useState(false);

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
        
        // Check if the review is liked by the current user
        if (isAuthenticated && user?.id) {
          try {
            const likedStatus = await ReviewLikeService.isLiked(user.id, reviewId);
            setIsLiked(likedStatus);
          } catch (err) {
            console.error('Error checking like status:', err);
            // Don't set error for like status check, just log it
          }
        }
        
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
  const getPosterUrl = (movieSimplified) => {
    if (movieSimplified?.poster?.filePath) {
      return `https://image.tmdb.org/t/p/w500${movieSimplified.poster.filePath}`;
    }
    return '/poster-placeholder.png';
  };

  const getReleaseYear = () => {
    if (!review?.movieSimplified?.releaseDate) return 'TBA';
    return new Date(review.movieSimplified.releaseDate).getFullYear();
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
      navigate(`/movie/${review.movieSimplified?.movieId}`, { 
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

  const handleLike = async () => {
    if (!review || !isAuthenticated || !user?.id || isLiking) return;
    
    setIsLiking(true);
    try {
      if (isLiked) {
        // Unlike the review
        await ReviewLikeService.unlikeReview({
          userId: user.id,
          reviewId: review.id
        });
        setIsLiked(false);
        // Update the likes count
        setReview(prev => ({
          ...prev,
          likesCount: Math.max(0, (prev.likesCount || 0) - 1)
        }));
      } else {
        // Like the review
        await ReviewLikeService.likeReview({
          userId: user.id,
          reviewId: review.id
        });
        setIsLiked(true);
        // Update the likes count
        setReview(prev => ({
          ...prev,
          likesCount: (prev.likesCount || 0) + 1
        }));
      }
    } catch (error) {
      console.error('Error toggling review like:', error);
      // You could show a toast notification here
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Review of ${review?.movieSimplified?.title || 'Movie'}`,
        text: `Check out this review of ${review?.movieSimplified?.title || 'a movie'}`,
        url: window.location.href
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
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

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column - Movie Poster (3 cols) */}
          <div className="lg:col-span-3">
            <div className="sticky top-8">
              {review?.movieSimplified && (
                <div className="space-y-4">
                  {/* Movie Poster */}
                  <div className="relative">
                    <button
                      onClick={() => navigate(`/movie/${review.movieSimplified.movieId}`)}
                      className="w-full aspect-[2/3] rounded-lg shadow-2xl relative overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                    >
                      <img 
                        src={getPosterUrl(review.movieSimplified)} 
                        alt={review.movieSimplified.title} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      
                      {/* Fallback placeholder */}
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-blue-400 to-green-400 hidden">
                        <div className="text-center">
                          <div className="bg-yellow-400 text-black px-8 py-16 rounded">
                            <div className="text-6xl font-bold mb-2">🎬</div>
                            <div className="text-xl font-bold">MOVIE</div>
                          </div>
                          <div className="text-3xl font-bold text-white mt-4 drop-shadow-lg">
                            {review.movieSimplified.title}
                          </div>
                        </div>
                      </div>
                    </button>
                  </div>

                </div>
              )}
            </div>
          </div>

          {/* Right Column - Review Content (9 cols) */}
          <div className="lg:col-span-9 space-y-6">
            
            {/* Review Card - New Design */}
            <div className="rounded-lg">
              {/* Header with avatar, "Review by", edit/delete icons, and like/share buttons */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-white font-semibold">
                    {getReviewUserName().charAt(0).toUpperCase()}
                  </div>
                  <span className="text-gray-400 text-sm">
                    Review by <span className="text-white font-medium">{getReviewUserName()}</span>
                  </span>
                  
                  {/* Edit and Delete buttons - Only show for authenticated users who are the author */}
                  {isMyReview() && (
                    <div className="flex items-center space-x-2 ml-4">
                      {/* Edit Button */}
                      <button
                        onClick={() => navigate(`/movie/${review.movieSimplified?.movieId}/review/edit/${review.id}`)}
                        className="cursor-pointer p-2 rounded-lg transition-all duration-200 transform hover:scale-105 text-gray-400 hover:text-yellow-400 group relative"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 transition-transform duration-200"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                          Edit
                        </div>
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={handleDeleteReview}
                        className="cursor-pointer p-2 rounded-lg transition-all duration-200 transform hover:scale-105 text-gray-400 hover:text-red-400 group relative"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 transition-transform duration-200"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                          Delete
                        </div>
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-3">
                  {/* Like Button - Only show for authenticated users */}
                  {isAuthenticated && (
                    <button
                      onClick={handleLike}
                      disabled={isLiking}
                      className={`cursor-pointer p-2 rounded-lg transition-all duration-200 transform hover:scale-105 group relative ${
                        isLiking
                          ? 'text-gray-500 cursor-not-allowed' 
                          : isLiked
                            ? 'text-green-400 hover:text-green-500'
                            : 'text-gray-400 hover:text-green-400'
                      }`}
                    >
                      {isLiking ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 transition-transform duration-200"
                          fill={isLiked ? "currentColor" : "none"}
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                          />
                        </svg>
                      )}
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                        {isLiking ? 'Processing...' : (isLiked ? 'Unlike' : 'Like')}
                      </div>
                    </button>
                  )}

                  {/* Share Button */}
                  <button
                    onClick={handleShare}
                    className={`cursor-pointer p-2 rounded-lg transition-all duration-200 transform hover:scale-105 group relative ${
                      copied 
                        ? 'text-green-400' 
                        : 'text-gray-400 hover:text-green-400'
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-5 w-5 transition-transform duration-200 ${copied ? 'rotate-0' : 'group-hover:-rotate-12'}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      {copied ? (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      ) : (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                        />
                      )}
                    </svg>
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                      {copied ? 'Copied!' : 'Share'}
                    </div>
                  </button>
                </div>
              </div>

              {/* Horizontal line under Review by section */}
              <hr className="border-gray-700 mb-6" />

              {/* Movie Title and Year */}
              {review?.movieSimplified && (
                <div className="mb-4">
                  <button
                    onClick={() => navigate(`/movie/${review.movieSimplified.movieId}`)}
                    className="text-4xl font-bold tracking-wider text-white mb-2 hover:text-green-400 transition-colors cursor-pointer"
                  >
                    {review.movieSimplified.title}
                  </button>
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
                  <span className="text-green-400 text-lg font-medium">
                    {review.rating}
                  </span>
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
              <div className="mb-30">
                <div className="text-gray-300 leading-relaxed text-base whitespace-pre-wrap">
                  {review.content || review.text || review.reviewText || 'No review content available.'}
                </div>
              </div>


            </div>

            {/* Comments Section */}
            <div className="space-y-4">
              <CommentSection
                reviewId={reviewId}
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
