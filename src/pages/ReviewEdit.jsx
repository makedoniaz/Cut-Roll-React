import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { ReviewService } from '../services/reviewService';
import { MovieService } from '../services/movieService';
import StarRating from '../components/ui/movies/StarRating';
import TextArea from '../components/ui/forms/inputs/TextArea';

const ReviewEdit = () => {
  const navigate = useNavigate();
  const { id: movieId, reviewId } = useParams();
  const { user, isAuthenticated } = useAuthStore();

  const [content, setContent] = useState('');
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [movieTitle, setMovieTitle] = useState('');

  const MAX_CONTENT_LENGTH = 1000;

  useEffect(() => {
    if (!isAuthenticated) {
      setError('You must be logged in to edit a review.');
    } else {
      setError('');
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [movie, review] = await Promise.all([
          MovieService.getMovieById(movieId),
          ReviewService.getReviewById(reviewId)
        ]);
        setMovieTitle(movie.title);
        setContent(review.content || review.text || review.reviewText || '');
        setRating(typeof review.rating === 'number' ? review.rating : 0);
      } catch (e) {
        console.error('Failed to load review for edit:', e);
        setError(e.message || 'Failed to load review.');
      } finally {
        setLoading(false);
      }
    };

    if (movieId && reviewId) {
      loadData();
    }
  }, [movieId, reviewId]);

  const handleBackToMovie = () => {
    navigate(`/movie/${movieId}`);
  };

  const handleRatingChange = (newRating) => {
    if (typeof newRating === 'number' && newRating >= 0 && newRating <= 5) {
      setRating(newRating);
    }
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      setError('You must be logged in to edit a review.');
      return;
    }

    if (!content.trim()) {
      setError('Please enter your review content.');
      return;
    }

    if (rating === 0) {
      setError('Please select a rating for your review.');
      return;
    }

    if (content.length > MAX_CONTENT_LENGTH) {
      setError(`Review content cannot exceed ${MAX_CONTENT_LENGTH} characters.`);
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const reviewData = {
        id: reviewId,
        userId: user.id,
        content: content.trim(),
        rating: rating
      };

      await ReviewService.updateReview(reviewData);
      alert('Review updated successfully!');
      navigate(`/movie/${movieId}`);
    } catch (e) {
      console.error('Failed to update review:', e);
      setError(e.message || 'Failed to update review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-gray-400">Loading review...</div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={handleBackToMovie}
          className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors"
        >
          ← Back to Movie
        </button>
        <div className="h-6 w-px bg-gray-700"></div>
        <h1 className="text-3xl font-bold text-white">Edit Review</h1>
      </div>

      <div className="w-full">
        <div className="flex w-full min-h-[600px]">
          <div className="w-full rounded-lg p-6 bg-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-white">Update Your Review</h1>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-600/20 border border-red-600 rounded-lg">
                <p className="text-red-400">{error}</p>
              </div>
            )}

            <div className="space-y-6">
              <div className="p-4 bg-gray-700 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-2">Editing Review For:</h3>
                <p className="text-gray-300">{movieTitle || `Movie ID: ${movieId}`}</p>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-white">
                  Your Rating *
                </label>
                <div className="flex flex-col gap-3">
                  <StarRating 
                    rating={rating} 
                    onRate={handleRatingChange}
                  />
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-semibold text-white">
                      {rating > 0 ? `${rating}/5` : 'Select rating'}
                    </span>
                    <span className="text-sm text-gray-400">
                                             Use the slider to rate from 0 to 5 (half-star ratings supported)
                    </span>
                  </div>
                </div>
              </div>

              <TextArea
                label="Review Content *"
                value={content}
                onChange={setContent}
                placeholder="Update your thoughts about this movie..."
                required
                rows={8}
                maxLength={MAX_CONTENT_LENGTH}
                disabled={!isAuthenticated}
              />

              <div className="text-sm text-gray-400 text-right">
                {content.length}/{MAX_CONTENT_LENGTH} characters
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !isAuthenticated || rating === 0 || !content.trim()}
                  className={`cursor-pointer px-6 py-2 rounded-lg transition-colors ${
                    isSubmitting || !isAuthenticated || rating === 0 || !content.trim()
                      ? 'bg-gray-500 text-gray-300 cursor-not-allowed' 
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewEdit;



