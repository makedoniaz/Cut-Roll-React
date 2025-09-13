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
  const [movieData, setMovieData] = useState(null);

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
        const review = await ReviewService.getReviewById(reviewId);
        
        // Always fetch full movie data to get proper poster images
        const movie = await MovieService.getMovieById(movieId);
        setMovieData({
          movieId: movie.id,
          title: movie.title,
          images: movie.images
        });
        
        setContent(review.content || review.text || review.reviewText || '');
        setRating(typeof review.rating === 'number' ? review.rating : 0);
      } catch (e) {
        console.error('Failed to load review for edit:', e);
        setError(e.message || 'Failed to load review.');
      } finally {
        setLoading(false);
      }
    };

    if (reviewId) {
      loadData();
    }
  }, [reviewId, movieId]);

  const handleBackToMovie = () => {
    navigate(`/movie/${movieId}`);
  };

  const getPosterUrl = () => {
    if (!movieData?.images) return '/poster-placeholder.png';
    const poster = movieData.images.find(img => img.type === 'poster');
    if (poster?.filePath) {
      return `https://image.tmdb.org/t/p/w500${poster.filePath}`;
    }
    return '/poster-placeholder.png';
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
      navigate(`/review/${reviewId}`);
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
              <h1 className="text-2xl font-bold text-white">{movieData?.title || 'Edit Review'}</h1>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-600/20 border border-red-600 rounded-lg">
                <p className="text-red-400">{error}</p>
              </div>
            )}

            <div className="space-y-6">
              {/* Movie Info and Rating Section */}
              <div className="flex items-start gap-6">
                {/* Left side - Movie Poster and Title */}
                <div className="flex items-center gap-6">
                  <img 
                    src={getPosterUrl()} 
                    alt={movieData?.title || 'Movie poster'}
                    className="w-32 h-48 object-cover rounded-lg shadow-lg"
                  />
                </div>
                
                {/* Right side - Rating - actual width */}
                <div className="flex flex-col items-start gap-3">
                  <StarRating 
                    rating={rating} 
                    onRate={handleRatingChange}
                  />
                </div>
              </div>

              <TextArea
                label=""
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
                  disabled={isSubmitting || !isAuthenticated || !content.trim()}
                  className={`cursor-pointer px-6 py-2 rounded-lg transition-colors ${
                    isSubmitting || !isAuthenticated || !content.trim()
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



