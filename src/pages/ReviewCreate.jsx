import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { ReviewService } from '../services/reviewService';
import { MovieService } from '../services/movieService';
import { WatchedService } from '../services/watchedService';
import StarRating from '../components/ui/movies/StarRating';
import TextArea from '../components/ui/forms/inputs/TextArea';

const ReviewCreate = () => {
  const navigate = useNavigate();
  const { id: movieId } = useParams();
  const { user, isAuthenticated } = useAuthStore();
  
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [movieData, setMovieData] = useState(null);

  // Character limit for review content
  const MAX_CONTENT_LENGTH = 1000;

  // Check authentication status when component loads
  useEffect(() => {
    if (!isAuthenticated) {
      setError('You must be logged in to create a review. Please log in and try again.');
    } else if (user?.is_muted) {
      setError('You are currently muted and cannot create reviews. Please contact support if you believe this is an error.');
    } else {
      setError('');
    }
  }, [isAuthenticated, user]);

  // Fetch movie data for display
  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        const movie = await MovieService.getMovieById(movieId);
        setMovieData({
          movieId: movie.id,
          title: movie.title,
          images: movie.images
        });
      } catch (error) {
        console.error('Failed to fetch movie data:', error);
        setMovieData({
          movieId: movieId,
          title: `Movie ID: ${movieId}`,
          images: null
        });
      }
    };

    if (movieId) {
      fetchMovieData();
    }
  }, [movieId]);

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
    console.log('Rating changed to:', newRating);
    // Ensure rating is a valid number
    if (typeof newRating === 'number' && newRating >= 0 && newRating <= 5) {
      setRating(newRating);
    } else {
      console.warn('Invalid rating value:', newRating);
    }
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      setError('You must be logged in to create a review.');
      return;
    }

    if (user?.is_muted) {
      setError('You are currently muted and cannot create reviews. Please contact support if you believe this is an error.');
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
        userId: user.id,
        movieId: movieId,
        content: content.trim(),
        rating: rating // Send the actual 0-5 rating
      };

      console.log('Creating review:', reviewData);
      
      const createdReviewId = await ReviewService.createReview(reviewData);
      
      console.log('Review created successfully with ID:', createdReviewId);
      
      if (!createdReviewId) {
        throw new Error('Review was created but no ID was returned');
      }
      
      // Mark movie as watched after successful review creation
      try {
        await WatchedService.markAsWatched({
          userId: user.id,
          movieId: movieId
        });
        console.log('Movie marked as watched successfully');
      } catch (watchedError) {
        // Log the error but don't fail the entire operation
        console.error('Failed to mark movie as watched:', watchedError);
        // You could optionally show a warning message here
      }
      
      // Navigate to the created review page
      navigate(`/review/${createdReviewId}`);
      
    } catch (error) {
      console.error('Failed to create review:', error);
      setError(error.message || 'Failed to create review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = () => {
    console.log('Draft saved:', { 
      content, 
      rating,
      movieId
    });
    alert('Draft saved successfully!');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={handleBackToMovie}
          className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors"
        >
          ← Back to Movie
        </button>
        <div className="h-6 w-px bg-gray-700"></div>
        <h1 className="text-3xl font-bold text-white">Create Review</h1>
      </div>
      
      {/* Review Form */}
      <div className="w-full">
        <div className="flex w-full min-h-[600px]">
          <div className="w-full rounded-lg p-6 bg-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-white">{movieData?.title || 'Create Review'}</h1>
            </div>
            
            {/* Error Display */}
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

              {/* Review Content */}
              <TextArea
                label="Review Content *"
                value={content}
                onChange={setContent}
                placeholder="Share your thoughts about this movie..."
                required
                rows={8}
                maxLength={MAX_CONTENT_LENGTH}
                disabled={!isAuthenticated || user?.is_muted}
              />

              {/* Character Count */}
              <div className="text-sm text-gray-400 text-right">
                {content.length}/{MAX_CONTENT_LENGTH} characters
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !isAuthenticated || user?.is_muted || !content.trim()}
                  className={`cursor-pointer px-6 py-2 rounded-lg transition-colors ${
                    isSubmitting || !isAuthenticated || user?.is_muted || !content.trim()
                      ? 'bg-gray-500 text-gray-300 cursor-not-allowed' 
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {isSubmitting ? 'Publishing...' : 'Publish Review'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewCreate;
