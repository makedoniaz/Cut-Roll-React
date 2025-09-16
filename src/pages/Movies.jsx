import MovieGrid from "../components/ui/movies/MovieGrid";
import SmallMovieCard from '../components/ui/movies/SmallMovieCard';
import PaginatedGridContainer from "../components/layout/PaginatedGridContainer";
import ReviewGrid from "../components/ui/reviews/ReviewGrid";
import Feed from "../components/profile/Feed";
import { WatchService } from '../services/watchService';
import { MovieLikeService } from '../services/movieLikeService';
import { WatchedService } from '../services/watchedService';
import { MovieService } from '../services/movieService';
import { RecommendationsService } from '../services/recommendationsService';
import { useAuthStore } from '../stores/authStore';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';

const Movies = () => {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  
  // Authenticated user states
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [errorRecommendations, setErrorRecommendations] = useState(null);
  const [recommendationsCacheTime, setRecommendationsCacheTime] = useState(null);
  const [lastLikedMovieTime, setLastLikedMovieTime] = useState(null);
  const [isManualRefresh, setIsManualRefresh] = useState(false);
  const [recentlyLiked, setRecentlyLiked] = useState([]);
  const [wantToWatch, setWantToWatch] = useState([]);
  const [recentlyWatched, setRecentlyWatched] = useState([]);
  const [loadingLiked, setLoadingLiked] = useState(false);
  const [loadingWantToWatch, setLoadingWantToWatch] = useState(false);
  const [loadingWatched, setLoadingWatched] = useState(false);
  const [errorLiked, setErrorLiked] = useState(null);
  const [errorWantToWatch, setErrorWantToWatch] = useState(null);
  const [errorWatched, setErrorWatched] = useState(null);
  
  // Unauthenticated user states (from Home page)
  const [newReleases, setNewReleases] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [isLoadingNewReleases, setIsLoadingNewReleases] = useState(false);
  const [isLoadingPopular, setIsLoadingPopular] = useState(false);
  const [error, setError] = useState(null);
  
  // Pagination states (1-based pagination)
  const [newReleasesPage, setNewReleasesPage] = useState(1);
  const [popularMoviesPage, setPopularMoviesPage] = useState(1);
  const [newReleasesTotalPages, setNewReleasesTotalPages] = useState(4);
  const [popularMoviesTotalPages, setPopularMoviesTotalPages] = useState(4);
  
  // Refs for intersection observer and request tracking
  const newReleasesRef = useRef(null);
  const popularMoviesRef = useRef(null);
  const isFetchingRecommendations = useRef(false);
  const recommendationsTimeoutRef = useRef(null);

  // Local storage utility functions
  const getStorageKey = () => `recommendations_${user?.id}`;
  
  const saveRecommendationsToStorage = (data) => {
    try {
      const storageData = {
        recommendations: data,
        timestamp: Date.now(),
        userId: user?.id
      };
      localStorage.setItem(getStorageKey(), JSON.stringify(storageData));
    } catch (error) {
      console.warn('Failed to save recommendations to localStorage:', error);
    }
  };

  const loadRecommendationsFromStorage = () => {
    try {
      const stored = localStorage.getItem(getStorageKey());
      if (stored) {
        const data = JSON.parse(stored);
        // Check if the data is for the current user and not too old (24 hours)
        if (data.userId === user?.id && (Date.now() - data.timestamp) < 24 * 60 * 60 * 1000) {
          return data.recommendations;
        }
      }
    } catch (error) {
      console.warn('Failed to load recommendations from localStorage:', error);
    }
    return null;
  };

  const clearRecommendationsFromStorage = () => {
    try {
      localStorage.removeItem(getStorageKey());
    } catch (error) {
      console.warn('Failed to clear recommendations from localStorage:', error);
    }
  };

  // Fetch user recommendations when user is authenticated
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!isAuthenticated || !user?.id) {
        setRecommendations([]);
        setRecommendationsCacheTime(null);
        setLastLikedMovieTime(null);
        return;
      }

      // Try to load from localStorage first (unless manual refresh)
      if (!isManualRefresh) {
        const storedRecommendations = loadRecommendationsFromStorage();
        if (storedRecommendations && storedRecommendations.length > 0) {
          console.log('Loading recommendations from localStorage');
          setRecommendations(storedRecommendations);
          setErrorRecommendations(null);
          return;
        }
      }

      // Check if we should use cached recommendations (in-memory cache)
      const shouldUseCache = recommendationsCacheTime && 
        (!lastLikedMovieTime || recommendationsCacheTime > lastLikedMovieTime) &&
        !isManualRefresh;

      if (shouldUseCache) {
        console.log('Using cached recommendations');
        return;
      }

      // Prevent multiple simultaneous requests
      if (isFetchingRecommendations.current) {
        console.log('Recommendations request already in progress, skipping...');
        return;
      }

      console.log('Fetching fresh recommendations...');
      isFetchingRecommendations.current = true;
      setLoadingRecommendations(true);
      try {
        const response = await RecommendationsService.getUserRecommendations({
          limit: 12, // 2 rows of 6 movies
          excludeMovieIds: [] // Send empty array instead of null
        });
        
        // Handle the new response format directly as an array
        let recommendedMovies = [];
        if (Array.isArray(response)) {
          recommendedMovies = response;
        } else if (response && typeof response === 'object') {
          if (response.movies && Array.isArray(response.movies)) {
            recommendedMovies = response.movies;
          } else if (response.data && Array.isArray(response.data)) {
            recommendedMovies = response.data;
          }
        }
        
        // Transform the response to match the expected movie format
        const transformedMovies = recommendedMovies.map(movie => ({
          id: movie.movieId,
          title: movie.title,
          year: 'TBA', // API doesn't provide year in this response
          poster: movie.posterPath ? {
            filePath: movie.posterPath
              .replace(/^\\?"/, '') // Remove leading escaped quote
              .replace(/\\?"$/, '') // Remove trailing escaped quote
              .replace(/^\/+/, '') // Remove leading slashes
          } : null,
          rating: 0, // API doesn't provide rating in this response
          similarityScore: movie.similarityScore // Keep similarity score for potential future use
        }));

        setRecommendations(transformedMovies);
        setErrorRecommendations(null);
        setRecommendationsCacheTime(Date.now()); // Cache the recommendations
        saveRecommendationsToStorage(transformedMovies); // Save to localStorage
        setIsManualRefresh(false); // Reset manual refresh flag
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        setRecommendations([]);
        setErrorRecommendations('Failed to fetch recommendations');
      } finally {
        setLoadingRecommendations(false);
        isFetchingRecommendations.current = false;
      }
    };

    // Clear any existing timeout
    if (recommendationsTimeoutRef.current) {
      clearTimeout(recommendationsTimeoutRef.current);
    }

    // Add a small delay to prevent rapid successive calls
    recommendationsTimeoutRef.current = setTimeout(() => {
      fetchRecommendations();
    }, 100);

    // Cleanup function
    return () => {
      if (recommendationsTimeoutRef.current) {
        clearTimeout(recommendationsTimeoutRef.current);
      }
    };
  }, [isAuthenticated, user?.id, isManualRefresh]);

  // Function to invalidate recommendations cache when user likes a movie
  const invalidateRecommendationsCache = () => {
    setLastLikedMovieTime(Date.now());
    clearRecommendationsFromStorage(); // Clear localStorage cache
    console.log('Recommendations cache invalidated due to new movie like');
  };

  // Function to manually refresh recommendations
  const handleManualRefresh = () => {
    setIsManualRefresh(true);
    clearRecommendationsFromStorage(); // Clear localStorage cache
    console.log('Manual refresh triggered');
  };

  // Expose the invalidation function globally so it can be called from other components
  useEffect(() => {
    window.invalidateRecommendationsCache = invalidateRecommendationsCache;
    return () => {
      delete window.invalidateRecommendationsCache;
    };
  }, []);

  // Fetch recently liked movies when user is authenticated
  useEffect(() => {
    const fetchRecentlyLiked = async () => {
      if (!isAuthenticated || !user?.id) {
        setRecentlyLiked([]);
        return;
      }

      setLoadingLiked(true);
      try {
        const response = await MovieLikeService.getLikedByUser({
          userId: user.id,
          page: 0,
          pageSize: 6
        });
        
                // Handle different possible response formats
        let likedMovies = [];
        if (response && typeof response === 'object') {
          if (Array.isArray(response)) {
            likedMovies = response;
          } else if (response.movies && Array.isArray(response.movies)) {
            likedMovies = response.movies;
          } else if (response.data && Array.isArray(response.data)) {
            likedMovies = response.data;
          }
        }
        
        // Transform the response to match the expected movie format
        const transformedMovies = likedMovies.map(movie => ({
          id: movie.movieId || movie.id,
          title: movie.title,
          year: movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : 'TBA',
          poster: movie.poster || null,
          rating: 0 // API doesn't provide rating in this response
        }));

        setRecentlyLiked(transformedMovies);
        setErrorLiked(null);
      } catch (error) {
        console.error('Error fetching recently liked movies:', error);
        setRecentlyLiked([]);
        setErrorLiked('Failed to fetch liked movies');
      } finally {
        setLoadingLiked(false);
      }
    };

    fetchRecentlyLiked();
  }, [isAuthenticated, user?.id]);

  // Fetch want to watch movies when user is authenticated
  useEffect(() => {
    const fetchWantToWatch = async () => {
      if (!isAuthenticated || !user?.id) {
        setWantToWatch([]);
        return;
      }

      setLoadingWantToWatch(true);
      try {
        const response = await WatchService.getWantToWatchByUser({
          userId: user.id,
          page: 0,
          pageSize: 6
        });
        
        // Handle different possible response formats
        let wantToWatchMovies = [];
        if (response && typeof response === 'object') {
          if (Array.isArray(response)) {
            wantToWatchMovies = response;
          } else if (response.data && Array.isArray(response.data)) {
            wantToWatchMovies = response.data;
          }
        }
        
        // Transform the response to match the expected movie format
        const transformedMovies = wantToWatchMovies.map(movie => ({
          id: movie.movieId || movie.id,
          title: movie.title,
          year: movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : 'TBA',
          poster: movie.poster || null,
          rating: 0 // API doesn't provide rating in this response
        }));

        setWantToWatch(transformedMovies);
        setErrorWantToWatch(null);
      } catch (error) {
        console.error('Error fetching want to watch movies:', error);
        setWantToWatch([]);
        setErrorWantToWatch('Failed to fetch want to watch movies');
      } finally {
        setLoadingWantToWatch(false);
      }
    };

    fetchWantToWatch();
  }, [isAuthenticated, user?.id]);

  // Fetch recently watched movies when user is authenticated
  useEffect(() => {
    const fetchRecentlyWatched = async () => {
      if (!isAuthenticated || !user?.id) {
        setRecentlyWatched([]);
        return;
      }

      setLoadingWatched(true);
      try {
        const response = await WatchedService.getWatchedByUser({
          userId: user.id,
          page: 0,
          pageSize: 6
        });
        
        // Handle different possible response formats
        let watchedMovies = [];
        if (response && typeof response === 'object') {
          if (Array.isArray(response)) {
            watchedMovies = response;
          } else if (response.data && Array.isArray(response.data)) {
            watchedMovies = response.data;
          }
        }
        
        // Transform the response to match the expected movie format
        const transformedMovies = watchedMovies.map(watchedItem => {
          // Handle the nested structure for watched movies
          const movie = watchedItem.movie || watchedItem;
          
          return {
            id: movie.movieId || movie.id,
            title: movie.title,
            year: movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : 'TBA',
            poster: movie.poster, // Pass the poster object directly
            rating: 0 // API doesn't provide rating in this response
          };
        });

        setRecentlyWatched(transformedMovies);
        setErrorWatched(null);
      } catch (error) {
        console.error('Error fetching recently watched movies:', error);
        setRecentlyWatched([]);
        setErrorWatched('Failed to fetch watched movies');
      } finally {
        setLoadingWatched(false);
      }
    };

    fetchRecentlyWatched();
  }, [isAuthenticated, user?.id]);

  // Load new releases for unauthenticated users with pagination
  const loadNewReleases = useCallback(async (page = 1) => {
    try {
      setIsLoadingNewReleases(true);
      setError(null);

      const newReleasesData = await MovieService.searchMovies({
        pageSize: 12, // 2 rows of 6 movies
        page: page, // API expects 1-based pagination
        sortBy: 'releasedate',
        sortDescending: true
      });

      // Always replace the data for the current page
      setNewReleases(newReleasesData.data || []);
      
      // Set total pages based on API response or default to 4
      if (newReleasesData.totalPages) {
        setNewReleasesTotalPages(newReleasesData.totalPages);
      }
    } catch (err) {
      console.error('Error fetching new releases:', err);
      setError('Failed to load new releases. Please try again later.');
    } finally {
      setIsLoadingNewReleases(false);
    }
  }, []);

  // Load popular movies for unauthenticated users with pagination
  const loadPopularMovies = useCallback(async (page = 1) => {
    try {
      setIsLoadingPopular(true);
      setError(null);

      const popularMoviesData = await MovieService.searchMovies({
        pageSize: 12, // 2 rows of 6 movies
        page: page, // API expects 1-based pagination
        minRating: 5,
        sortBy: 'revenue',
        sortDescending: true
      });

      // Always replace the data for the current page
      setPopularMovies(popularMoviesData.data || []);
      
      // Set total pages based on API response or default to 4
      if (popularMoviesData.totalPages) {
        setPopularMoviesTotalPages(popularMoviesData.totalPages);
      }
    } catch (err) {
      console.error('Error fetching popular movies:', err);
      setError('Failed to load popular movies. Please try again later.');
    } finally {
      setIsLoadingPopular(false);
    }
  }, []);

  // Load initial data for unauthenticated users
  useEffect(() => {
    if (isAuthenticated) return; // Skip for authenticated users
    
    // Load first page of data immediately
    loadNewReleases(1);
    loadPopularMovies(1);
  }, [isAuthenticated, loadNewReleases, loadPopularMovies]);

  // Pagination handlers
  const handleNewReleasesPageChange = (newPage) => {
    setNewReleasesPage(newPage);
    loadNewReleases(newPage);
  };

  const handlePopularMoviesPageChange = (newPage) => {
    setPopularMoviesPage(newPage);
    loadPopularMovies(newPage);
  };

  // Navigation functions for MORE buttons
  const handleWantToWatchMore = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate('/action-lists/want-to-watch');
  };

  const handleRecentlyWatchedMore = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate('/action-lists/recently-watched');
  };

  const handleRecentlyLikedMore = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate('/action-lists/recently-liked');
  };

  // Loading skeleton component
  const LoadingSkeleton = ({ count = 12 }) => (
    <div className="space-y-6">
      <div className="grid grid-cols-6 gap-4">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="h-64 w-48">
            <div className="animate-pulse bg-gray-700 rounded-md h-full w-full"></div>
          </div>
        ))}
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-400 text-xl text-center">
          <div>{error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Recent Reviews Section - displayed for all users */}
      <div className="py-2">
        <div className="max-w-7xl mx-auto">
          <ReviewGrid />
        </div>
      </div>
      
      {isAuthenticated ? (
        // Authenticated user content
        <div>
          <MovieGrid 
            heading={"FOR YOU"} 
            rows={2} 
            itemsPerRow={6} 
            movies={recommendations} 
            CardComponent={SmallMovieCard}
            loading={loadingRecommendations}
            showMore={false}
            emptyStateMessage="No recommendations available yet"
            onRefreshClick={handleManualRefresh}
            showRefresh={true}
            isRefreshing={loadingRecommendations}
          />
          <MovieGrid 
            heading={"WANT TO WATCH"} 
            rows={1} 
            itemsPerRow={6} 
            movies={wantToWatch} 
            CardComponent={SmallMovieCard}
            loading={loadingWantToWatch}
            onMoreClick={wantToWatch.length > 0 ? handleWantToWatchMore : undefined}
            showMore={wantToWatch.length > 0}
            emptyStateMessage="No movies in your watchlist yet"
          />
          <MovieGrid 
            heading={"RECENTLY WATCHED"} 
            rows={1} 
            itemsPerRow={6} 
            movies={recentlyWatched} 
            CardComponent={SmallMovieCard}
            loading={loadingWatched}
            onMoreClick={recentlyWatched.length > 0 ? handleRecentlyWatchedMore : undefined}
            showMore={recentlyWatched.length > 0}
            emptyStateMessage="No watched movies yet"
          />
          <MovieGrid 
            heading={"RECENTLY LIKED"} 
            rows={1} 
            itemsPerRow={6} 
            movies={recentlyLiked} 
            CardComponent={SmallMovieCard}
            loading={loadingLiked}
            onMoreClick={recentlyLiked.length > 0 ? handleRecentlyLikedMore : undefined}
            showMore={recentlyLiked.length > 0}
            emptyStateMessage="No liked movies yet"
          />
          
          {/* Activity Feed */}
          <Feed showHeading={true} />
        </div>
      ) : (
        // Unauthenticated user content (from Home page)
        <div>
          {/* New Releases Section */}
          <div ref={newReleasesRef} className="mb-12">
            <div className="py-2">
              <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center">
                  <h2 className="text-base font-medium text-gray-400 tracking-wider">NEW RELEASES</h2>
                  <div className="flex items-center gap-3">
                    {isLoadingNewReleases && (
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                        <span>Loading...</span>
                      </div>
                    )}
                    <button 
                      onClick={() => navigate('/search/movies', { 
                        state: { 
                          prefillFilters: { 
                            sortBy: 'releasedate', 
                            sortDescending: true 
                          }
                        } 
                      })}
                      className="cursor-pointer font-medium text-gray-400 hover:text-green-500"
                    >
                      MORE
                    </button>
                  </div>
                </div>
                <hr className="border-t border-gray-700 my-4 mb-8" />
                <div>
                  {isLoadingNewReleases ? (
                    <LoadingSkeleton count={12} />
                  ) : newReleases.length > 0 ? (
                    <div className="animate-fade-in">
                      <PaginatedGridContainer
                        items={newReleases}
                        itemsPerRow={6}
                        rows={2}
                        renderItem={(movie) => (
                          <SmallMovieCard 
                            movie={movie} 
                            searchContext={null}
                          />
                        )}
                        itemHeight="h-64"
                        currentPage={newReleasesPage}
                        totalPages={newReleasesTotalPages}
                        onPageChange={handleNewReleasesPageChange}
                        useExternalPagination={true}
                      />
                    </div>
                  ) : (
                    <div className="text-gray-400 text-center py-8">
                      No new releases available
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Popular Movies Section */}
          <div ref={popularMoviesRef} className="mb-12">
            <div className="py-2">
              <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center">
                  <h2 className="text-base font-medium text-gray-400 tracking-wider">BIGGEST HITS</h2>
                  <div className="flex items-center gap-3">
                    {isLoadingPopular && (
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                        <span>Loading...</span>
                      </div>
                    )}
                    <button 
                      onClick={() => navigate('/search/movies', { 
                        state: { 
                          prefillFilters: { 
                            sortBy: 'revenue', 
                            sortDescending: true 
                          }
                        } 
                      })}
                      className="cursor-pointer font-medium text-gray-400 hover:text-green-500"
                    >
                      MORE
                    </button>
                  </div>
                </div>
                <hr className="border-t border-gray-700 my-4 mb-8" />
                <div>
                  {isLoadingPopular ? (
                    <LoadingSkeleton count={12} />
                  ) : popularMovies.length > 0 ? (
                    <div className="animate-fade-in">
                      <PaginatedGridContainer
                        items={popularMovies}
                        itemsPerRow={6}
                        rows={2}
                        renderItem={(movie) => (
                          <SmallMovieCard 
                            movie={movie} 
                            searchContext={null}
                          />
                        )}
                        itemHeight="h-64"
                        currentPage={popularMoviesPage}
                        totalPages={popularMoviesTotalPages}
                        onPageChange={handlePopularMoviesPageChange}
                        useExternalPagination={true}
                      />
                    </div>
                  ) : (
                    <div className="text-gray-400 text-center py-8">
                      No popular movies available
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Movies;