import ActionButton from '../components/ui/buttons/ActionButton';
import CastGrid from '../components/ui/movies/CastGrid';

import TabNav from '../components/ui/common/TabNav';
import MovieDetailsPoster from '../components/ui/movies/MovieDetailsPoster';
import AddToListsModal from '../components/ui/forms/AddToListsModal';
import ConfirmationDialog from '../components/ui/common/ConfirmationDialog';
import { MovieService } from '../services/movieService';

import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { WatchService } from '../services/watchService';
import { MovieLikeService } from '../services/movieLikeService';
import { WatchedService } from '../services/watchedService';
import { ReviewService } from '../services/reviewService';
import { ReviewLikeService } from '../services/reviewLikeService';

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuthStore();
  const [userRating, setUserRating] = useState(0);
  const [activeTab, setActiveTab] = useState('CAST');
  const [showAllCast, setShowAllCast] = useState(false);
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInWantToWatch, setIsInWantToWatch] = useState(false);
  const [watchLoading, setWatchLoading] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [isWatched, setIsWatched] = useState(false);
  const [watchedLoading, setWatchedLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState(null);
  const [totalReviews, setTotalReviews] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [averageRatingLoading, setAverageRatingLoading] = useState(false);
  const [activeReviewTab, setActiveReviewTab] = useState(isAuthenticated ? 'MY REVIEW' : 'REVIEWS');
  const [deletingReviewId, setDeletingReviewId] = useState(null);
  const [showAddToListsModal, setShowAddToListsModal] = useState(false);
  const [showAllVideos, setShowAllVideos] = useState(false);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [reviewLikes, setReviewLikes] = useState({}); // Track which reviews are liked by current user
  const [reviewLikeLoading, setReviewLikeLoading] = useState({}); // Track loading state for each review like
  
  // Update active review tab when authentication status changes
  useEffect(() => {
    setActiveReviewTab(isAuthenticated ? 'MY REVIEW' : 'REVIEWS');
  }, [isAuthenticated]);

  // Scroll to top when page loads or movie ID changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);
  
  // Fetch movie data
  useEffect(() => {
    const fetchMovie = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        const movieData = await MovieService.getMovieById(id);
        setMovie(movieData);
      } catch (err) {
        console.error('Error fetching movie:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [id]);

  // Fetch watch status when movie and user are available
  useEffect(() => {
    const fetchWatchData = async () => {
      if (!movie || !isAuthenticated || !user?.id) return;
      
      try {
        // Check if movie is in want to watch list
        const watchStatus = await WatchService.isInWantToWatch(user.id, movie.id);
        console.log('Watch status response:', watchStatus); // Debug log
        console.log('Setting isInWantToWatch to:', watchStatus); // Debug log
        setIsInWantToWatch(watchStatus);
      } catch (err) {
        console.error('Error fetching watch data:', err);
        // Don't set error state for watch data, just log it
      }
    };

    fetchWatchData();
  }, [movie, isAuthenticated, user?.id]);

  // Fetch like status when movie and user are available
  useEffect(() => {
    const fetchLikeData = async () => {
      if (!movie || !isAuthenticated || !user?.id) return;
      
      try {
        // Check if movie is liked by user
        const likeStatus = await MovieLikeService.isLiked(user.id, movie.id);
        console.log('Like status response:', likeStatus); // Debug log
        console.log('Setting isLiked to:', likeStatus); // Debug log
        setIsLiked(likeStatus);
      } catch (err) {
        console.error('Error fetching like data:', err);
        // Don't set error state for like data, just log it
      }
    };

    fetchLikeData();
  }, [movie, isAuthenticated, user?.id]);

  // Fetch watched status when movie and user are available
  useEffect(() => {
    const fetchWatchedData = async () => {
      if (!movie || !isAuthenticated || !user?.id) return;
      
      try {
        // Check if movie is watched by user
        const watchedStatus = await WatchedService.isWatched(user.id, movie.id);
        console.log('Watched status response:', watchedStatus); // Debug log
        console.log('Setting isWatched to:', watchedStatus); // Debug log
        setIsWatched(watchedStatus);
      } catch (err) {
        console.error('Error fetching watched data:', err);
        // Don't set error state for watched data, just log it
      }
    };

    fetchWatchedData();
  }, [movie, isAuthenticated, user?.id]);

  // Fetch reviews when movie is available
  useEffect(() => {
    const fetchReviews = async () => {
      if (!movie?.id) return;
      
      try {
        setReviewsLoading(true);
        setReviewsError(null);
        
        // Fetch all reviews for the movie
        const reviewsData = await ReviewService.getReviewsByMovie({
          movieId: movie.id,
          page: 0,
          pageSize: 8
        });
        console.log('Reviews API response:', reviewsData); // Debug log
        // Handle different possible response structures
        const reviewsArray = reviewsData.content || reviewsData.reviews || reviewsData.data || reviewsData || [];
        setReviews(Array.isArray(reviewsArray) ? reviewsArray : []);
        // Set total count if available
        setTotalReviews(reviewsData.totalElements || reviewsData.total || reviewsData.totalCount || reviewsArray.length);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setReviewsError(err.message);
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchReviews();
  }, [movie?.id]);

  // Fetch user's own review when movie and user are available
  useEffect(() => {
    const fetchUserReview = async () => {
      if (!movie?.id || !isAuthenticated || !user?.id) return;
      
      try {
        const userReview = await ReviewService.getReviewByUserAndMovie(user.id, movie.id);
        console.log('User review:', userReview); // Debug log
        
        // Update reviews to include user's review at the top
        setReviews(prevReviews => {
          // Remove any existing user review from the list
          const otherReviews = prevReviews.filter(review => {
            const reviewUserId = getReviewUserId(review);
            return !(reviewUserId && String(reviewUserId) === String(user.id));
          });
          
          // Add user's review at the beginning
          return [userReview, ...otherReviews];
        });
      } catch (err) {
        // If user doesn't have a review, that's fine - just log it
        if (err.message !== 'Review not found') {
          console.error('Error fetching user review:', err);
        }
      }
    };

    fetchUserReview();
  }, [movie?.id, isAuthenticated, user?.id]);

  // Fetch average rating when movie is available
  useEffect(() => {
    const fetchAverageRating = async () => {
      if (!movie?.id) return;
      
      try {
        setAverageRatingLoading(true);
        const avgRating = await ReviewService.getAverageRating(movie.id);
        setAverageRating(avgRating);
      } catch (err) {
        console.error('Error fetching average rating:', err);
        setAverageRating(0);
      } finally {
        setAverageRatingLoading(false);
      }
    };

    fetchAverageRating();
  }, [movie?.id]);

  // Check like status for all reviews when reviews or user changes
  useEffect(() => {
    const checkReviewLikes = async () => {
      if (!reviews.length || !isAuthenticated || !user?.id) {
        setReviewLikes({});
        return;
      }

      try {
        const likePromises = reviews.map(async (review) => {
          try {
            const isLiked = await ReviewLikeService.isLiked(user.id, review.id);
            return { reviewId: review.id, isLiked };
          } catch (err) {
            console.error(`Error checking like status for review ${review.id}:`, err);
            return { reviewId: review.id, isLiked: false };
          }
        });

        const likeResults = await Promise.all(likePromises);
        const likesMap = {};
        likeResults.forEach(({ reviewId, isLiked }) => {
          likesMap[reviewId] = isLiked;
        });
        
        setReviewLikes(likesMap);
      } catch (err) {
        console.error('Error checking review likes:', err);
      }
    };

    checkReviewLikes();
  }, [reviews, isAuthenticated, user?.id]);

  // Handle watch button click
  const handleWatchClick = async () => {
    if (!isAuthenticated || !user?.id || !movie?.id) {
      // Redirect to login if not authenticated
      navigate('/login');
      return;
    }

    setWatchLoading(true);
    try {
      if (isInWantToWatch) {
        // Remove from want to watch
        await WatchService.removeFromWantToWatch({
          userId: user.id,
          movieId: movie.id
        });
        setIsInWantToWatch(false);
      } else {
        // Add to want to watch
        await WatchService.addToWantToWatch({
          userId: user.id,
          movieId: movie.id
        });
        setIsInWantToWatch(true);
      }
    } catch (err) {
      console.error('Error updating watch status:', err);
      // You could add a toast notification here
    } finally {
      setWatchLoading(false);
    }
  };

  // Handle like button click
  const handleLikeClick = async () => {
    if (!isAuthenticated || !user?.id || !movie?.id) {
      // Redirect to login if not authenticated
      navigate('/login');
      return;
    }

    setLikeLoading(true);
    try {
      if (isLiked) {
        // Unlike the movie
        await MovieLikeService.unlikeMovie({
          userId: user.id,
          movieId: movie.id
        });
        setIsLiked(false);
      } else {
        // Like the movie
        await MovieLikeService.likeMovie({
          userId: user.id,
          movieId: movie.id
        });
        setIsLiked(true);
      }
      

    } catch (err) {
      console.error('Error updating like status:', err);
      // You could add a toast notification here
    } finally {
      setLikeLoading(false);
    }
  };

  // Handle watched button click
  const handleWatchedClick = async () => {
    if (!isAuthenticated || !user?.id || !movie?.id) {
      // Redirect to login if not authenticated
      navigate('/login');
      return;
    }

    setWatchedLoading(true);
    try {
      if (isWatched) {
        // Remove from watched
        await WatchedService.removeFromWatched({
          userId: user.id,
          movieId: movie.id
        });
        setIsWatched(false);
      } else {
        // Mark as watched
        await WatchedService.markAsWatched({
          userId: user.id,
          movieId: movie.id
        });
        setIsWatched(true);
      }
    } catch (err) {
      console.error('Error updating watched status:', err);
      // You could add a toast notification here
    } finally {
      setWatchedLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen from-gray-900 via-gray-900 to-black text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-16 bg-gray-800 rounded mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-3">
                <div className="h-96 bg-gray-800 rounded"></div>
              </div>
              <div className="lg:col-span-6">
                <div className="h-32 bg-gray-800 rounded mb-6"></div>
                <div className="h-24 bg-gray-800 rounded"></div>
              </div>
              <div className="lg:col-span-3">
                <div className="h-32 bg-gray-800 rounded"></div>
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
      <div className="min-h-screen from-gray-900 via-gray-900 to-black text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-400 mb-4">Error Loading Movie</h1>
            <p className="text-gray-400 mb-6">{error}</p>
            <button 
              onClick={() => navigate('/movies')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
            >
              Back to Movies
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No movie data
  if (!movie) {
    return (
      <div className="min-h-screen from-gray-900 via-gray-900 to-black text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-400 mb-4">Movie Not Found</h1>
            <button 
              onClick={() => navigate('/movies')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
            >
              Back to Movies
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Helper functions
  const getSearchContext = () => {
    // First try to get from navigation state
    if (location.state?.searchContext) {
      return location.state.searchContext;
    }
    
    // Fallback to sessionStorage if navigation state is lost (e.g., page refresh)
    try {
      const storedContext = sessionStorage.getItem('lastSearchContext');
      if (storedContext) {
        return JSON.parse(storedContext);
      }
    } catch (error) {
      console.warn('Failed to parse stored search context:', error);
    }
    
    return null;
  };

  const isFromSearch = () => {
    // Check if we came from search page
    if (location.state?.fromSearch === true) {
      return true;
    }
    
    // Check if we have stored search context (fallback for page refresh)
    const storedContext = sessionStorage.getItem('lastSearchContext');
    return storedContext !== null;
  };

  const getPosterUrl = (images) => {
    const poster = images?.find(img => img.type === 'poster');
    if (poster?.filePath) {
      return `https://image.tmdb.org/t/p/w500${poster.filePath}`;
    }
    return '/poster-placeholder.png';
  };

  const getBackdropUrl = (images) => {
    const backdrop = images?.find(img => {
      const t = (img?.type || '').toString().toLowerCase();
      return t === 'backdrop' || t.includes('backdrop');
    });


    const candidate = backdrop
      || images?.find(img => (img?.type || '').toString().toLowerCase() !== 'poster')
      || images?.[0];


    if (candidate?.filePath) {
      return `https://image.tmdb.org/t/p/w1280${candidate.filePath}`;
    }
    return null;
  };

  const getDirector = () => {
    const director = movie.crew?.find(member => member.job === 'Director');
    return director?.person?.name || 'Unknown Director';
  };

  const getWriter = () => {
    const writer = movie.crew?.find(member => member.job === 'Writer');
    return writer?.person?.name || 'Unknown Writer';
  };

  const getReleaseYear = () => {
    if (!movie.releaseDate) return 'TBA';
    return new Date(movie.releaseDate).getFullYear();
  };

  const getGenres = () => {
    return movie.movieGenres?.map(g => g.genre?.name || 'Unknown Genre') || [];
  };

  const getCastNames = () => {
    return movie.cast?.sort((a, b) => a.castOrder - b.castOrder) || [];
  };

  const getCrewMembers = () => {
    const crewMap = {};
    movie.crew?.forEach(member => {
      if (!crewMap[member.job]) {
        crewMap[member.job] = [];
      }
      crewMap[member.job].push(member.person?.name || 'Unknown');
    });
    return crewMap;
  };

  const getProductionCountries = () => {
    return movie.productionCountries?.map(country => country.country?.name || country.countryCode || country.countryCode) || [];
  };

  const getSpokenLanguages = () => {
    return movie.spokenLanguages?.map(lang => lang.language?.englishName || lang.language?.name || lang.languageCode || lang.languageCode) || [];
  };

  const toEnglishLanguageName = (lang) => {
    if (!lang) return 'Unknown';
    const value = String(lang);
    if (/^[A-Za-z-]{2,5}$/.test(value)) {
      try {
        const displayNames = new Intl.DisplayNames(['en'], { type: 'language' });
        const name = displayNames.of(value.toLowerCase());
        if (name) {
          return name.charAt(0).toUpperCase() + name.slice(1);
        }
      } catch (e) {
        // Fallback to original value if Intl.DisplayNames is not supported
      }
    }
    return value;
  };

  const getProductionCompanies = () => {
    return movie.productionCompanies?.map(company => company.company?.name || company.companyId || 'Unknown Company') || [];
  };

  const getKeywords = () => {
    return movie.keywords?.map(keyword => keyword.keyword?.name || keyword.keywordId || 'Unknown Keyword') || [];
  };

  const getVideos = () => {
    return movie.videos || [];
  };

  const getImages = () => {
    return movie.images || [];
  };

  const getReviewUserId = (review) => {
    return review.userId || review.user?.id || review.userSimplified?.id || review.userSimplified?.userId || null;
  };

  const getReviewUserName = (review) => {
    return review.userSimplified?.userName || review.userName || review.username || review.authorName || review.author || null;
  };

  const getCurrentUserName = () => {
    return user?.userName || user?.username || user?.name || user?.email || null;
  };

  const isMyReview = (review) => {
    if (!isAuthenticated || !user) return false;
    const reviewUserId = getReviewUserId(review);
    if (reviewUserId && String(reviewUserId) === String(user.id)) return true;
    const reviewUserName = getReviewUserName(review);
    const currentUserName = getCurrentUserName();
    if (reviewUserName && currentUserName) {
      return String(reviewUserName).toLowerCase() === String(currentUserName).toLowerCase();
    }
    return false;
  };

  const handleDeleteReview = async (reviewId) => {
    if (!isAuthenticated || !user?.id) {
      navigate('/login');
      return;
    }
    if (!reviewId) return;

    setReviewToDelete(reviewId);
    setShowDeleteConfirmDialog(true);
  };

  const confirmDeleteReview = async () => {
    if (!reviewToDelete) return;

    try {
      setDeletingReviewId(reviewToDelete);
      await ReviewService.deleteReview(reviewToDelete);
      // Remove from local state
      setReviews(prev => prev.filter(r => r.id !== reviewToDelete));
      // Optionally update totals
      setTotalReviews(t => Math.max(0, (t || 1) - 1));
    } catch (e) {
      console.error('Failed to delete review:', e);
      alert(e.message || 'Failed to delete review.');
    } finally {
      setDeletingReviewId(null);
      setReviewToDelete(null);
    }
  };

  // Handle review like button click
  const handleReviewLikeClick = async (reviewId) => {
    if (!isAuthenticated || !user?.id) {
      // Redirect to login if not authenticated
      navigate('/login');
      return;
    }

    if (!reviewId) return;

    // Set loading state for this specific review
    setReviewLikeLoading(prev => ({ ...prev, [reviewId]: true }));

    try {
      const isCurrentlyLiked = reviewLikes[reviewId] || false;
      
      if (isCurrentlyLiked) {
        // Unlike the review
        await ReviewLikeService.unlikeReview({
          userId: user.id,
          reviewId: reviewId
        });
        setReviewLikes(prev => ({ ...prev, [reviewId]: false }));
        
        // Decrement like count
        setReviews(prev => prev.map(review => 
          review.id === reviewId 
            ? { 
                ...review, 
                likes: Math.max(0, (review.likes || review.likeCount || review.likesCount || 0) - 1),
                likeCount: Math.max(0, (review.likes || review.likeCount || review.likesCount || 0) - 1),
                likesCount: Math.max(0, (review.likes || review.likeCount || review.likesCount || 0) - 1)
              }
            : review
        ));
      } else {
        // Like the review
        await ReviewLikeService.likeReview({
          userId: user.id,
          reviewId: reviewId
        });
        setReviewLikes(prev => ({ ...prev, [reviewId]: true }));
        
        // Increment like count
        setReviews(prev => prev.map(review => 
          review.id === reviewId 
            ? { 
                ...review, 
                likes: (review.likes || review.likeCount || review.likesCount || 0) + 1,
                likeCount: (review.likes || review.likeCount || review.likesCount || 0) + 1,
                likesCount: (review.likes || review.likeCount || review.likesCount || 0) + 1
              }
            : review
        ));
      }
    } catch (err) {
      console.error('Error updating review like status:', err);
      // You could add a toast notification here
    } finally {
      // Clear loading state for this specific review
      setReviewLikeLoading(prev => ({ ...prev, [reviewId]: false }));
    }
  };

  // Handle add to lists button click
  const handleAddToListsClick = () => {
    if (!isAuthenticated || !user?.id) {
      // Redirect to login if not authenticated
      navigate('/login');
      return;
    }
    
    setShowAddToListsModal(true);
  };

  // Handle movie added to lists
  const handleMovieAddedToLists = (addedLists) => {
    console.log('Movie added to lists:', addedLists);
    // You could update UI state here if needed
  };

  const formatCurrency = (amount) => {
    if (!amount || amount === 0) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const displayedCast = showAllCast ? getCastNames() : getCastNames().slice(0, 18);
  const crewMembers = getCrewMembers();
  const genres = getGenres();
  const productionCountries = getProductionCountries();
  const spokenLanguages = getSpokenLanguages();
  const productionCompanies = getProductionCompanies();
  const keywords = getKeywords();
  const videos = getVideos();
  const images = getImages();
  
  // Get user's review (first review if it belongs to current user)
  const userReview = reviews.length > 0 && isMyReview(reviews[0]) ? reviews[0] : null;
  const otherReviews = userReview ? reviews.slice(1) : reviews;

  
  
  return (
    <div className="relative min-h-screen from-gray-900 via-gray-900 to-black text-white">
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6 flex gap-4">
          {isFromSearch() ? (
            <button
              onClick={() => navigate('/search/movies', { 
                state: { 
                  restoreSearch: getSearchContext() 
                } 
              })}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Search Results
            </button>
          ) : (
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Go Back
            </button>
          )}
        </div>
        
        {/* Main 3 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column - Poster + Streaming (3 cols) */}
          <div className="lg:col-span-3">
            <div className="sticky top-8 space-y-4">
              {/* Movie Poster */}
              <MovieDetailsPoster 
                title={movie.title}
                posterUrl={getPosterUrl(movie.images)}
              />
              
              
            </div>
          </div>
          
          {/* Center Column - Movie Info + Tabs (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            {/* Title and Year */}
            <div>
              <h1 className="text-5xl font-bold mb-2">{movie.title}</h1>
              <div className="flex items-center gap-4 text-gray-400">
                <span className="text-2xl">{getReleaseYear()}</span>
                <span>Directed by {getDirector()}</span>
              </div>
            </div>
            
            {/* Description */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-green-500 font-semibold mb-3">
                {movie.tagline ? movie.tagline.toUpperCase() : 'MOVIE OVERVIEW'}
              </h2>
              <p className="text-gray-300 leading-relaxed">
                {movie.overview || 'No overview available for this movie.'}
              </p>
            </div>
            
            
            {/* Tabs Section - Now in Center Column */}
            <div className="space-y-6 mt-12 mb-24">
                             <TabNav 
                 tabs={['CAST', 'CREW', 'DETAILS', 'GENRES', 'VIDEOS', 'PHOTOS']}
                 activeTab={activeTab}
                 onTabChange={setActiveTab}
               />
              
              {/* Tab Content */}
              {activeTab === 'CAST' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {displayedCast && displayedCast.length > 0 ? (
                      displayedCast.map((member, index) => (
                        <button
                          key={member.id || index}
                          onClick={() => navigate('/search/movies', { 
                            state: { 
                              prefillFilters: { 
                                actor: member.person?.name 
                              } 
                            } 
                          })}
                          className="bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-xs transition-colors cursor-pointer text-white"
                        >
                          {member.person?.name || 'Unknown Actor'}
                        </button>
                      ))
                    ) : (
                      <div className="text-gray-500 text-center py-4 w-full">
                        No cast information available
                      </div>
                    )}
                  </div>
                  {!showAllCast && getCastNames().length > 18 && (
                    <button 
                      onClick={() => setShowAllCast(true)}
                      className="text-cyan-500 hover:text-cyan-400 transition-colors"
                    >
                      Show All...
                    </button>
                  )}
                </div>
              )}
              
                                                           {activeTab === 'DETAILS' && (
                  <div className="space-y-6">
                    <div className="space-y-4 text-gray-300">
                      {movie.runtime !== undefined && movie.runtime !== null && movie.runtime > 0 && (
                        <div className="flex gap-4">
                          <span className="text-gray-500">Runtime:</span>
                          <span>{movie.runtime} mins</span>
                        </div>
                      )}
                      {movie.budget !== undefined && movie.budget !== null && movie.budget > 0 && (
                        <div className="flex gap-4">
                          <span className="text-gray-500">Budget:</span>
                          <span className="font-mono">{formatCurrency(movie.budget)}</span>
                        </div>
                      )}
                      {movie.revenue !== undefined && movie.revenue !== null && movie.revenue > 0 && (
                        <div className="flex gap-4">
                          <span className="text-gray-500">Revenue:</span>
                          <span className="font-mono">{formatCurrency(movie.revenue)}</span>
                        </div>
                      )}
                      {movie.homepage && (
                        <div className="flex gap-4">
                          <span className="text-gray-500">Homepage:</span>
                          <a href={movie.homepage} target="_blank" rel="noopener noreferrer" className="text-cyan-500 hover:text-cyan-400">
                            Visit Website
                          </a>
                        </div>
                      )}
                      {movie.imdbId && (
                        <div className="flex gap-4">
                          <span className="text-gray-500">IMDb:</span>
                          <a href={`https://www.imdb.com/title/${movie.imdbId}`} target="_blank" rel="noopener noreferrer" className="bg-yellow-600 text-black px-2 py-1 rounded text-xs font-bold hover:bg-yellow-500">
                            View on IMDb
                          </a>
                        </div>
                      )}
                      {productionCountries && productionCountries.length > 0 && (
                        <div className="flex gap-4">
                          <span className="text-gray-500">Production Countries:</span>
                          <span>{productionCountries.join(', ')}</span>
                        </div>
                      )}
                      {spokenLanguages && spokenLanguages.length > 0 && (
                        <div className="flex gap-4">
                          <span className="text-gray-500">Spoken Languages:</span>
                          <div className="flex flex-wrap gap-2">
                            {spokenLanguages.map((lang, index) => (
                              <button
                                key={index}
                                onClick={() => navigate('/search/movies', {
                                  state: {
                                    prefillFilters: {
                                      language: toEnglishLanguageName(lang)
                                    }
                                  }
                                })}
                                className="bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-xs transition-colors cursor-pointer text-white"
                              >
                                {toEnglishLanguageName(lang)}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      {productionCompanies && productionCompanies.length > 0 && (
                        <div className="flex gap-4">
                          <span className="text-gray-500">Production Companies:</span>
                          <div className="flex flex-wrap gap-2">
                            {productionCompanies.map((company, index) => (
                              <button
                                key={index}
                                onClick={() => navigate('/search/movies', { 
                                  state: { 
                                    prefillFilters: { 
                                      productionCompany: company 
                                    } 
                                  } 
                                })}
                                className="bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-xs transition-colors cursor-pointer text-white"
                              >
                                {company}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Release Information */}
                    <div className="mt-6">
                      <h4 className="text-sm font-semibold text-gray-400 mb-4">RELEASE INFORMATION</h4>
                      <div className="space-y-2 text-gray-300">
                        {movie.releaseDate ? (
                          <div className="flex justify-between py-2 border-b border-gray-700">
                            <span>Worldwide Release:</span>
                            <span>{new Date(movie.releaseDate).toLocaleDateString()}</span>
                          </div>
                        ) : (
                          <div className="flex justify-between py-2 border-b border-gray-700">
                            <span>Worldwide Release:</span>
                            <span>TBA</span>
                          </div>
                        )}
                        {productionCountries && productionCountries.length > 0 && productionCountries.map((country, index) => (
                          <div key={index} className="flex justify-between py-2 border-b border-gray-700">
                            <span>{country} Release:</span>
                            <span>{movie.releaseDate ? new Date(movie.releaseDate).toLocaleDateString() : 'TBA'}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Keywords */}
                    <div className="mt-6">
                      <h4 className="text-sm font-semibold text-gray-400 mb-4">KEYWORDS</h4>
                      {keywords && keywords.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {keywords.map((keyword, index) => (
                            <button
                              key={index}
                              onClick={() => navigate('/search/movies', { 
                                state: { 
                                  prefillFilters: { 
                                    keyword: keyword.keyword?.name || keyword.keywordId || keyword || 'Unknown Keyword'
                                  } 
                                } 
                              })}
                              className="bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-xs transition-colors cursor-pointer text-white"
                            >
                              {keyword.keyword?.name || keyword.keywordId || keyword || 'Unknown Keyword'}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          <div className="text-2xl mb-2">🏷️</div>
                          <p>No keywords available for this movie</p>
                        </div>
                      )}
                    </div>


                  </div>
                )}
              
                             {activeTab === 'GENRES' && (
                 <div className="flex flex-wrap gap-2">
                   {genres && genres.length > 0 ? (
                     genres.map((genre, index) => (
                       <button
                         key={index}
                         onClick={() => navigate('/search/movies', { 
                           state: { 
                             prefillFilters: { 
                               genres: [genre]
                             } 
                           } 
                         })}
                         className="bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-xs transition-colors cursor-pointer text-white"
                       >
                         {genre}
                       </button>
                     ))
                   ) : (
                     <div className="text-center py-8 text-gray-500">
                       <div className="text-4xl mb-2">🎭</div>
                       <p>No genres available for this movie</p>
                     </div>
                   )}
                 </div>
               )}
              
                                           {activeTab === 'CREW' && (
                <div className="grid grid-cols-2 gap-4 text-gray-300">
                  {crewMembers && Object.keys(crewMembers).length > 0 ? (
                    Object.entries(crewMembers).map(([job, names]) => (
                      <div key={job}>
                        <span className="text-gray-500">{job}:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {names.map((name, index) => (
                            <button
                              key={index}
                              onClick={() => navigate('/search/movies', { 
                                state: { 
                                  prefillFilters: { 
                                    director: name 
                                  } 
                                } 
                              })}
                              className="bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-xs transition-colors cursor-pointer text-white"
                            >
                              {name}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 text-gray-500 text-center py-4">
                      No crew information available
                    </div>
                  )}
                </div>
              )}
              
                             

                             {/* VIDEOS Tab */}
               {activeTab === 'VIDEOS' && (
                 <div className="space-y-4">
                   {videos && videos.length > 0 ? (
                     (() => {
                       // Find trailer first, then any YouTube video as fallback
                       const trailer = videos.find(v => 
                         v.key && v.site === 'YouTube' && 
                         (v.type?.toLowerCase().includes('trailer') || v.name?.toLowerCase().includes('trailer'))
                       );
                       const mainVideo = trailer || videos.find(v => v.key && v.site === 'YouTube');
                       const otherVideos = videos.filter(v => v !== mainVideo);
                       
                       return (
                         <div className="space-y-6">
                           {/* Main Video Player */}
                           {mainVideo && (
                             <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
                               <iframe
                                 src={`https://www.youtube.com/embed/${mainVideo.key}`}
                                 title={mainVideo.name || 'Video'}
                                 className="w-full aspect-video"
                                 frameBorder="0"
                                 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                 allowFullScreen
                               ></iframe>
                               <div className="p-4">
                                 <h4 className="font-medium text-white mb-2">{mainVideo.name || 'Untitled Video'}</h4>
                                 <p className="text-sm text-gray-400">{mainVideo.type || 'Unknown Type'}</p>
                               </div>
                             </div>
                           )}
                           
                           {/* Other Videos as Links */}
                           {otherVideos.length > 0 && (
                             (() => {
                               const maxVisibleVideos = 3;
                               const videosToShow = showAllVideos ? otherVideos : otherVideos.slice(0, maxVisibleVideos);
                               const hasMoreVideos = otherVideos.length > maxVisibleVideos;
                               
                               return (
                                 <div>
                                   <div className="space-y-2">
                                     {videosToShow.map((video, index) => (
                                       <div key={index} className="bg-gray-800 hover:bg-gray-700 rounded-lg p-3 transition-colors border border-gray-700 hover:border-green-500">
                                         {video.key && video.site === 'YouTube' ? (
                                           <a 
                                             href={`https://www.youtube.com/watch?v=${video.key}`}
                                             target="_blank"
                                             rel="noopener noreferrer"
                                             className="flex items-center gap-3 text-gray-200 hover:text-white transition-colors"
                                           >
                                             <div className="flex-shrink-0 w-8 h-8 bg-red-600 rounded flex items-center justify-center">
                                               <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                                                 <path d="M8 5v14l11-7z"/>
                                               </svg>
                                             </div>
                                             <div className="flex-1">
                                               <h5 className="font-medium text-sm">{video.name || 'Untitled Video'}</h5>
                                               <p className="text-xs text-gray-400">{video.type || 'Unknown Type'}</p>
                                             </div>
                                           </a>
                                         ) : (
                                           <div className="flex items-center gap-3 text-gray-400">
                                             <div className="flex-shrink-0 w-8 h-8 bg-gray-600 rounded flex items-center justify-center">
                                               <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                                 <path d="M8 5v14l11-7z"/>
                                               </svg>
                                             </div>
                                             <div className="flex-1">
                                               <h5 className="font-medium text-sm">{video.name || 'Untitled Video'}</h5>
                                               <p className="text-xs text-gray-400">{video.type || 'Unknown Type'}</p>
                                             </div>
                                           </div>
                                         )}
                                       </div>
                                     ))}
                                   </div>
                                   
                                   {/* More Videos Button */}
                                   {hasMoreVideos && (
                                     <div className="mt-4 text-center">
                                       <button
                                         onClick={() => setShowAllVideos(!showAllVideos)}
                                         className="px-4 py-2 bg-gray-700 hover:bg-green-600 text-gray-200 hover:text-white rounded-lg transition-colors text-sm font-medium"
                                       >
                                         {showAllVideos ? 'Show Less' : `More videos (${otherVideos.length - maxVisibleVideos} more)`}
                                       </button>
                                     </div>
                                   )}
                                 </div>
                               );
                             })()
                           )}
                         </div>
                       );
                     })()
                   ) : (
                     <div className="text-center py-8 text-gray-500">
                       <div className="text-4xl mb-2">📹</div>
                       <p>No videos available for this movie</p>
                     </div>
                   )}
                 </div>
               )}

                             {/* PHOTOS Tab */}
               {activeTab === 'PHOTOS' && (
                 <div className="space-y-4">
                   {images && images.length > 0 ? (
                     <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                       {images.map((image, index) => (
                         <div key={index} className="group cursor-pointer">
                           <div className="aspect-[4/3] bg-gray-700 rounded-lg overflow-hidden">
                             {image.filePath ? (
                               <a
                                 href={`https://image.tmdb.org/t/p/original${image.filePath}`}
                                 target="_blank"
                                 rel="noopener noreferrer"
                                 className="block w-full h-full"
                               >
                                 <img
                                   src={`https://image.tmdb.org/t/p/w500${image.filePath}`}
                                   alt={image.type || 'Movie image'}
                                   className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                   onError={(e) => {
                                     e.target.style.display = 'none';
                                     e.target.nextSibling.style.display = 'flex';
                                   }}
                                 />
                               </a>
                             ) : null}
                             <div className="hidden w-full h-full bg-gray-600 items-center justify-center group-hover:flex">
                               <div className="text-center">
                                 <div className="text-2xl mb-1">🖼️</div>
                               </div>
                             </div>
                           </div>
                         </div>
                       ))}
                     </div>
                   ) : (
                     <div className="text-center py-8 text-gray-500">
                       <div className="text-4xl mb-2">📸</div>
                       <p>No photos available for this movie</p>
                     </div>
                   )}
                 </div>
               )}

                             


            </div>
            
            {/* Reviews Section */}
            <div className="bg-gray-900 mb-12">
              <div className="max-w-4xl mx-auto">
                <div>
                                     <TabNav 
                     tabs={isAuthenticated ? ['MY REVIEW', 'OTHER'] : ['REVIEWS']}
                     activeTab={activeReviewTab}
                     onTabChange={setActiveReviewTab}
                   />
                  
                  {reviewsLoading ? (
                    <div className="text-center py-8">
                      <div className="w-8 h-8 border-2 border-gray-600 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-gray-400">Loading reviews...</p>
                    </div>
                  ) : reviewsError ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-4xl mb-2">⚠️</div>
                      <p>Failed to load reviews: {reviewsError}</p>
                    </div>
                                     ) : (isAuthenticated && activeReviewTab === 'MY REVIEW' ? !userReview : (isAuthenticated ? otherReviews.length === 0 : reviews.length === 0)) ? (
                     <div className="text-center py-8 text-gray-500">
                       <div className="text-4xl mb-2">💬</div>
                       {(isAuthenticated && activeReviewTab === 'MY REVIEW') ? (
                         <>
                           <p>You haven't written a review for this movie yet.</p>
                         </>
                       ) : (
                         <p>No reviews {isAuthenticated ? 'from other users' : 'available'} yet</p>
                       )}
                                               {isAuthenticated && activeReviewTab === 'MY REVIEW' && (
                          <button 
                            onClick={() => navigate(userReview ? `/movie/${movie.id}/review/edit/${userReview.id}` : `/movie/${movie.id}/review/create`)}
                            className="mt-4 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                          >
                            {userReview ? 'Edit your Review' : 'Write a Review'}
                          </button>
                        )}
                     </div>
                   ) : (
                     <div className="rounded-lg">
                                               {(isAuthenticated && activeReviewTab === 'MY REVIEW' ? [userReview] : (isAuthenticated ? otherReviews : reviews)).filter(Boolean).map((review, index) => (
                                                 <div key={review.id} className={`flex gap-4 ${index === 0 ? 'pt-0 pb-6' : index === (isAuthenticated && activeReviewTab === 'MY REVIEW' ? 0 : reviews.length - 1) ? 'pt-6 pb-0' : 'py-6'} border-b border-gray-800 last:border-b-0`}>
                          <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {(review.userSimplified?.userName || review.userName || review.username || review.authorName || review.author) ? 
                              (review.userSimplified?.userName || review.userName || review.username || review.authorName || review.author).charAt(0).toUpperCase() : 'U'}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-3">
                              <button 
                                onClick={() => navigate(`/review/${review.id}`)}
                                className="text-gray-400 text-sm hover:text-gray-300 transition-colors cursor-pointer"
                              >
                                Review by <span className="text-gray-200 hover:text-gray-100 font-medium">
                                  {review.userSimplified?.userName || review.userName || review.username || review.authorName || review.author || 'Anonymous'}
                                </span>
                              </button>
                                                             {(review.rating !== undefined && review.rating !== null) && (
                                 <div className="flex items-center gap-2">
                                   <div className="flex items-center gap-1">
                                     {[...Array(5)].map((_, i) => {
                                       const starValue = i + 1;
                                       const isHalfStar = review.rating >= starValue - 0.5 && review.rating < starValue;
                                       const isFullStar = review.rating >= starValue;

                                       console.log(review);
                                       
                                       return (
                                         <div key={i} className="relative">
                                           {isHalfStar ? (
                                             // Half star - show gray star with green overlay
                                             <>
                                               <svg className="w-3 h-3 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                                 <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                               </svg>
                                               <div className="absolute inset-0 overflow-hidden">
                                                 <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20" style={{ clipPath: 'inset(0 50% 0 0)' }}>
                                                   <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                 </svg>
                                               </div>
                                             </>
                                           ) : (
                                             // Regular star (full or empty)
                                             <svg className={`w-3 h-3 ${isFullStar ? 'text-green-500 fill-current' : 'text-gray-600 fill-current'}`} viewBox="0 0 20 20">
                                               <path d="M9.048 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                             </svg>
                                           )}
                                         </div>
                                       );
                                     })}
                                   </div>
                                   <span className="text-sm text-green-500 font-medium">
                                     {review.rating}
                                   </span>
                                 </div>
                               )}
                              {(isAuthenticated && isMyReview(review)) && (
                                <div className="ml-auto flex items-center gap-2">
                                  <button
                                    onClick={() => navigate(`/movie/${movie.id}/review/edit/${review.id}`)}
                                    className="p-1 cursor-pointer text-gray-400 hover:text-white transition-colors flex items-center justify-center group relative"
                                  >
                                    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                                      <path d="M17.414 2.586a2 2 0 010 2.828l-9.9 9.9a2 2 0 01-.878.502l-3.293.823a1 1 0 01-1.212-1.212l.823-3.293a2 2 0 01.502-.878l9.9-9.9a2 2 0 012.828 0zM15 4l-9.5 9.5-.5 2 2-.5L16 5 15 4z" />
                                    </svg>
                                    {/* Tooltip */}
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                                      Edit Review
                                    </div>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteReview(review.id)}
                                    disabled={deletingReviewId === review.id}
                                    className={`p-1 flex cursor-pointer items-center justify-center group relative ${deletingReviewId === review.id ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 hover:text-red-400'} transition-colors`}
                                  >
                                    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                                      <path d="M6 7a1 1 0 011-1h6a1 1 0 011 1v9a2 2 0 01-2 2H8a2 2 0 01-2-2V7zm3-3a1 1 0 00-1 1v1H6a1 1 0 000 2h8a1 1 0 100-2h-2V5a1 1 0 00-1-1H9z" />
                                    </svg>
                                    {/* Tooltip */}
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                                      Delete Review
                                    </div>
                                  </button>
                                </div>
                              )}
                            </div>
                            
                            <p className="text-white text-base leading-relaxed mb-4">
                              {review.text || review.content || review.reviewText || 'No review text available'}
                            </p>
                            
                            
                            {/* Like and Comment buttons - Only show for authenticated users */}
                            {isAuthenticated && (
                              <div className="flex items-center gap-4 mb-3">
                                <button 
                                  onClick={() => handleReviewLikeClick(review.id)}
                                  disabled={reviewLikeLoading[review.id]}
                                  className={`flex items-center gap-2 transition-colors group relative ${
                                    reviewLikeLoading[review.id] 
                                      ? 'opacity-50 cursor-not-allowed text-gray-500' 
                                      : reviewLikes[review.id] 
                                        ? 'text-green-500 hover:text-green-400' 
                                        : 'text-gray-400 hover:text-gray-300'
                                  }`}
                                >
                                  {reviewLikeLoading[review.id] ? (
                                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                  ) : (
                                    <svg className="w-4 h-4" fill={reviewLikes[review.id] ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                  )}
                                  <span className="text-sm">{review.likes || review.likeCount || review.likesCount || 0}</span>
                                  {/* Tooltip */}
                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                                    {reviewLikes[review.id] ? 'Unlike Review' : 'Like Review'}
                                  </div>
                                </button>
                                <button 
                                  onClick={() => navigate(`/review/${review.id}`)}
                                  className="flex items-center gap-2 cursor-pointer text-gray-400 hover:text-gray-300 transition-colors group relative"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                  </svg>
                                  {/* Tooltip */}
                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                                    View Comments
                                  </div>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column - Actions & Rating (3 cols) */}
          <div className="lg:col-span-3 space-y-6">
            {/* Action Buttons - Horizontal Layout - Only for logged in users */}
            {isAuthenticated && (
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-400 mb-3">ACTIONS</h3>
                                 <div className="flex justify-center gap-3">
                                     <button 
                    onClick={handleWatchedClick}
                    disabled={watchedLoading}
                    className={`flex flex-col items-center gap-2 px-4 py-3 rounded-lg transition-colors hover:bg-gray-700 ${
                      watchedLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {watchedLoading ? (
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <svg className={`w-5 h-5 ${isWatched ? 'text-green-500' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                    <span className={`text-sm ${isWatched ? 'text-green-500' : ''}`}>
                      {isWatched ? 'Watched' : 'Watch'}
                    </span>
                  </button>
                  <button 
                    onClick={handleLikeClick}
                    disabled={likeLoading}
                    className={`flex flex-col items-center gap-2 px-4 py-3 rounded-lg transition-colors hover:bg-gray-700 ${
                      likeLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                                         {likeLoading ? (
                       <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                     ) : (
                       <svg className={`w-5 h-5 ${isLiked ? 'text-green-500 fill-current' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                       </svg>
                     )}
                     <span className={`text-sm ${isLiked ? 'text-green-500' : ''}`}>
                       {isLiked ? 'Liked' : 'Like'}
                     </span>
                  </button>
                  <button 
                    onClick={handleWatchClick}
                    disabled={watchLoading}
                    className={`flex flex-col items-center gap-2 px-4 py-3 rounded-lg transition-colors hover:bg-gray-700 ${
                      watchLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                   {watchLoading ? (
                     <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                   ) : (
                     <svg className={`w-5 h-5 ${isInWantToWatch ? 'text-green-500' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                     </svg>
                   )}
                                                             <span className={`text-sm ${isInWantToWatch ? 'text-green-500' : ''}`}>
                       Watchlist
                     </span>
                 </button>
                </div>
                

              </div>
            )}
            
                                      {/* Your Rating - Only for authenticated users */}
             {isAuthenticated && (
               <div className="bg-gray-800 rounded-lg p-4">
                 <h3 className="text-sm font-semibold text-gray-400 mb-3">YOUR RATING</h3>

                    
                    
                    {/* Your Rating Summary */}
             <div className="bg-gray-800 rounded-lg ">
               <div className="flex items-center gap-2">
                                   <span className="text-3xl font-bold text-green-500">
                     {userReview && userReview.rating !== undefined && userReview.rating !== null ? userReview.rating.toFixed(1) : 'N/A'}
                   </span>
                 {userReview && userReview.rating !== undefined && userReview.rating !== null && (
                   <div className="flex gap-0.5">
                     {(() => {
                       // Helper function to round to nearest 0.5
                       const roundToHalf = (num) => {
                         return Math.round(num * 2) / 2;
                       };
                       
                       // Use the rating directly without rounding - preserve decimal values
                       const displayRating = userReview.rating;
                       
                       return [1,2,3,4,5].map(star => {
                         let starClass = 'text-gray-600'; // Default gray
                         let isHalfStar = false;
                         
                         if (star <= Math.floor(displayRating)) {
                           starClass = 'text-green-500'; // Full star
                         } else if (star === Math.ceil(displayRating) && displayRating % 1 === 0.5) {
                           isHalfStar = true; // Mark as half star
                         }
                         
                         return (
                           <div key={star} className="relative">
                             {isHalfStar ? (
                               // Half star - show gray star with green overlay
                               <>
                                 <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                   <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                 </svg>
                                 <div className="absolute inset-0 overflow-hidden">
                                   <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20" style={{ clipPath: 'inset(0 50% 0 0)' }}>
                                     <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                   </svg>
                                 </div>
                               </>
                             ) : (
                               // Regular star (full or empty)
                               <svg className={`w-4 h-4 ${starClass}`} fill="currentColor" viewBox="0 0 20 20">
                                 <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                               </svg>
                             )}
                           </div>
                         );
                       });
                     })()}
                   </div>
                 )}
               </div>
             </div>
                                       {isAuthenticated && (
                <button 
                  onClick={() => navigate(userReview ? `/movie/${movie.id}/review/edit/${userReview.id}` : `/movie/${movie.id}/review/create`)}
                  className="mt-4 w-full bg-gray-700 hover:bg-gray-600 py-2 rounded transition-colors text-sm"
                >
                  {userReview ? 'Edit your Review' : 'Write a Review'}
                </button>
              )}
              {isAuthenticated && (
                <button 
                  onClick={handleAddToListsClick}
                  className="mt-3 w-full bg-gray-700 hover:bg-gray-600 py-2 rounded transition-colors text-sm"
                >
                  Add to lists...
                </button>
              )}
                 <button 
                   onClick={() => {
                     if (navigator.share) {
                       navigator.share({
                         title: movie.title,
                         text: `Check out ${movie.title} (${getReleaseYear()}) - ${movie.overview || 'A great movie!'}`,
                         url: window.location.href
                       }).catch(console.error);
                     } else {
                       // Fallback for browsers that don't support Web Share API
                       navigator.clipboard.writeText(window.location.href).then(() => {
                         alert('Link copied to clipboard!');
                       }).catch(() => {
                         // Fallback for older browsers
                         const textArea = document.createElement('textarea');
                         textArea.value = window.location.href;
                         document.body.appendChild(textArea);
                         textArea.select();
                         document.execCommand('copy');
                         document.body.removeChild(textArea);
                         alert('Link copied to clipboard!');
                       });
                     }
                   }}
                   className="mt-3 w-full bg-gray-700 hover:bg-gray-600 py-2 rounded transition-colors text-sm"
                 >
                   Share
                                  </button>
                </div>
             )}
             
                           {/* IMDb Ratings Summary */}
             <div className="bg-gray-800 rounded-lg p-4">
               <h3 className="text-sm font-semibold text-gray-400 mb-3">AVERAGE RATING</h3>
               <div className="flex items-center gap-2 mb-4">
                 <span className="text-3xl font-bold text-green-500">
                   {averageRatingLoading ? '...' : (averageRating !== undefined && averageRating !== null ? averageRating.toFixed(1) : 'N/A')}
                 </span>
                 {!averageRatingLoading && averageRating !== undefined && averageRating !== null && (
                   <div className="flex gap-0.5">
                     {(() => {
                       // Helper function to round to nearest 0.5
                       const roundToHalf = (num) => {
                         return Math.round(num * 2) / 2;
                       };
                       
                       // Use the rating directly without rounding - preserve decimal values
                       const displayRating = averageRating;
                       
                       return [1,2,3,4,5].map(star => {
                         let starClass = 'text-gray-600'; // Default gray
                         let isHalfStar = false;
                         
                         if (star <= Math.floor(displayRating)) {
                           starClass = 'text-green-500'; // Full star
                         } else if (star === Math.ceil(displayRating) && displayRating % 1 === 0.5) {
                           isHalfStar = true; // Mark as half star
                         }
                         
                         return (
                           <div key={star} className="relative">
                             {isHalfStar ? (
                               // Half star - show gray star with green overlay
                               <>
                                 <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                   <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                 </svg>
                                 <div className="absolute inset-0 overflow-hidden">
                                   <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20" style={{ clipPath: 'inset(0 50% 0 0)' }}>
                                     <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                   </svg>
                                 </div>
                               </>
                             ) : (
                               // Regular star (full or empty)
                               <svg className={`w-4 h-4 ${starClass}`} fill="currentColor" viewBox="0 0 20 20">
                                 <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                               </svg>
                             )}
                           </div>
                         );
                       });
                     })()}
                   </div>
                 )}
               </div>
               
               <h3 className="text-sm font-semibold text-gray-400 mb-3">IMDB RATING</h3>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-3xl font-bold text-green-500">
                  {movie.voteAverage !== undefined && movie.voteAverage !== null && movie.voteAverage > 0 ? movie.voteAverage.toFixed(1) : 'N/A'}
                </span>
                {movie.voteAverage !== undefined && movie.voteAverage !== null && movie.voteAverage > 0 && (
                  <div className="flex gap-0.5">
                    {(() => {
                      // Helper function to round to nearest 0.5
                      const roundToHalf = (num) => {
                        return Math.round(num * 2) / 2;
                      };
                      
                      const roundedRating = roundToHalf(movie.voteAverage);
                      
                      return [1,2,3,4,5,6,7,8,9,10].map(star => {
                        let starClass = 'text-gray-600'; // Default gray
                        let isHalfStar = false;
                        
                        if (star <= Math.floor(roundedRating)) {
                          starClass = 'text-green-500'; // Full star
                        } else if (star === Math.ceil(roundedRating) && roundedRating % 1 === 0.5) {
                          isHalfStar = true; // Mark as half star
                        }
                        
                        return (
                          <div key={star} className="relative">
                            {isHalfStar ? (
                              // Half star - show gray star with green overlay
                              <>
                                <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <div className="absolute inset-0 overflow-hidden">
                                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20" style={{ clipPath: 'inset(0 50% 0 0)' }}>
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                </div>
                              </>
                            ) : (
                              // Regular star (full or empty)
                              <svg className={`w-4 h-4 ${starClass}`} fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>
                )}
              </div>
              {movie.voteCount !== undefined && movie.voteCount !== null && movie.voteCount > 0 && (
                <div className="text-xs text-gray-500 mt-1">Rate this movie to join!</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add to Lists Modal */}
      <AddToListsModal
        isOpen={showAddToListsModal}
        onClose={() => setShowAddToListsModal(false)}
        movieId={movie?.id}
        movieTitle={movie?.title}
        onMovieAddedToLists={handleMovieAddedToLists}
      />

      {/* Delete Review Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteConfirmDialog}
        onClose={() => {
          setShowDeleteConfirmDialog(false);
          setReviewToDelete(null);
        }}
        onConfirm={confirmDeleteReview}
        title="Delete Review"
        message="Are you sure you want to delete your review? This action cannot be undone."
        confirmText="Yes, Delete"
        cancelText="Cancel"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
        isLoading={deletingReviewId !== null}
      />
    </div>
  );
};

export default MovieDetails;