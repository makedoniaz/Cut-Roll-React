import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { ReviewService } from '../services/reviewService';
import { MovieService } from '../services/movieService';
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
  const [movieTitle, setMovieTitle] = useState('');

  // Character limit for review content
  const MAX_CONTENT_LENGTH = 1000;

  // Check authentication status when component loads
  useEffect(() => {
    if (!isAuthenticated) {
      setError('You must be logged in to create a review. Please log in and try again.');
    } else {
      setError('');
    }
  }, [isAuthenticated]);

  // Fetch movie title for display
  useEffect(() => {
    const fetchMovieTitle = async () => {
      try {
        const movie = await MovieService.getMovieById(movieId);
        setMovieTitle(movie.title);
      } catch (error) {
        console.error('Failed to fetch movie title:', error);
        setMovieTitle(`Movie ID: ${movieId}`);
      }
    };

    if (movieId) {
      fetchMovieTitle();
    }
  }, [movieId]);

  const handleBackToMovie = () => {
    navigate(`/movie/${movieId}`);
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
        userId: user.id,
        movieId: movieId,
        content: content.trim(),
        rating: rating // Send the actual 0-5 rating
      };

      console.log('Creating review:', reviewData);
      
      const createdReview = await ReviewService.createReview(reviewData);
      
      console.log('Review created successfully:', createdReview);
      
      // Show success message before navigating
      alert('Review created successfully!');
      
      // Navigate back to the movie details page
      navigate(`/movie/${movieId}`);
      
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
              <h1 className="text-2xl font-bold text-white">Write Your Review</h1>
            </div>
            
            {/* Error Display */}
            {error && (
              <div className="mb-4 p-3 bg-red-600/20 border border-red-600 rounded-lg">
                <p className="text-red-400">{error}</p>
              </div>
            )}
            
            <div className="space-y-6">
              {/* Movie Title Display */}
              <div className="p-4 bg-gray-700 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-2">Reviewing:</h3>
                <p className="text-gray-300">{movieTitle || `Movie ID: ${movieId}`}</p>
              </div>

              {/* Rating Selection */}
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

              {/* Review Content */}
              <TextArea
                label="Review Content *"
                value={content}
                onChange={setContent}
                placeholder="Share your thoughts about this movie... What did you like or dislike? How did it make you feel? Would you recommend it to others?"
                required
                rows={8}
                maxLength={MAX_CONTENT_LENGTH}
                disabled={!isAuthenticated}
              />

              {/* Character Count */}
              <div className="text-sm text-gray-400 text-right">
                {content.length}/{MAX_CONTENT_LENGTH} characters
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between">
                <div className="text-sm text-gray-400">
                  {rating > 0 && `Rating: ${rating}/5`}
                </div>
                
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    disabled={!isAuthenticated}
                    className={`cursor-pointer px-6 py-2 rounded-lg transition-colors ${
                      isAuthenticated
                        ? 'bg-gray-600 text-white hover:bg-gray-500' 
                        : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                    }`}
                  >
                    Save Draft
                  </button>
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
                    {isSubmitting ? 'Publishing...' : 'Publish Review'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewCreate;
