import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import MovieGrid from "../components/ui/movies/MovieGrid";
import NewsFeed from "../components/news/NewsFeed";
import MovieListsGrid from "../components/ui/movie-lists/MovieListsGrid";
import SmallMovieCard from '../components/ui/movies/SmallMovieCard';
import SectionHeading from "../components/ui/common/SectionHeading";
import PaginatedGridContainer from "../components/layout/PaginatedGridContainer";
import ReviewGrid from "../components/ui/reviews/ReviewGrid";
import { useAuthStore } from "../stores/authStore";
import { MovieService } from "../services/movieService";
import { ListsService } from "../services/listsService";

const Home = () => {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [newReleases, setNewReleases] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [popularLists, setPopularLists] = useState([]);
  const [isLoadingNewReleases, setIsLoadingNewReleases] = useState(false);
  const [isLoadingPopular, setIsLoadingPopular] = useState(false);
  const [isLoadingPopularLists, setIsLoadingPopularLists] = useState(false);
  const [isLoadingNews, setIsLoadingNews] = useState(false);
  const [error, setError] = useState(null);
  
  // Refs for intersection observer
  const newReleasesRef = useRef(null);
  const popularMoviesRef = useRef(null);
  const popularListsRef = useRef(null);

  // Lazy load new releases
  const loadNewReleases = useCallback(async () => {
    if (isLoadingNewReleases || newReleases.length > 0) return;
    
    try {
      setIsLoadingNewReleases(true);
      setError(null);

      const newReleasesData = await MovieService.searchMovies({
        pageSize: 6,
        sortBy: 'releasedate',
        sortDescending: true
      });

      setNewReleases(newReleasesData.data || []);
    } catch (err) {
      console.error('Error fetching new releases:', err);
      setError('Failed to load new releases. Please try again later.');
    } finally {
      setIsLoadingNewReleases(false);
    }
  }, [isLoadingNewReleases, newReleases.length]);

  // Lazy load popular movies
  const loadPopularMovies = useCallback(async () => {
    if (isLoadingPopular || popularMovies.length > 0) return;
    
    try {
      setIsLoadingPopular(true);
      setError(null);

      const popularMoviesData = await MovieService.searchMovies({
        pageSize: 6,
        page: 1,
        minRating: 5,
        sortBy: 'revenue',
        sortDescending: true
      });

      setPopularMovies(popularMoviesData.data || []);
    } catch (err) {
      console.error('Error fetching popular movies:', err);
      setError('Failed to load popular movies. Please try again later.');
    } finally {
      setIsLoadingPopular(false);
    }
  }, [isLoadingPopular, popularMovies.length]);

  // Lazy load popular lists
  const loadPopularLists = useCallback(async () => {
    if (isLoadingPopularLists || popularLists.length > 0) return;
    
    try {
      setIsLoadingPopularLists(true);
      setError(null);

      const searchParams = {
        userId: null,
        title: null,
        fromDate: null,
        toDate: null,
        page: 0,
        pageSize: 4,
        sortByLikesAscending: false // Popular lists should be sorted by likes descending
      };
      
      const result = await ListsService.searchLists(searchParams);
      
      // Extract the data array from the API response
      const listsData = result.data || result.items || result || [];
      
      // Transform API data to match MovieListCard expected structure
      const transformedLists = listsData.map(list => ({
        id: list.id,
        title: list.title,
        description: list.description,
        coverImages: list.preview || [], // Use preview property from API for movie posters
        author: {
          name: list.userSimplified?.userName || 'Unknown',
          avatar: list.userSimplified?.avatarPath || '👤'
        },
        stats: {
          films: list.moviesCount || 0,
          likes: list.likesCount || 0,
          comments: 0 // API doesn't provide comments count yet
        }
      }));
      
      setPopularLists(transformedLists);
    } catch (err) {
      console.error('Error fetching popular lists:', err);
      setError('Failed to load popular lists. Please try again later.');
    } finally {
      setIsLoadingPopularLists(false);
    }
  }, [isLoadingPopularLists, popularLists.length]);

  // Intersection observer for lazy loading
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '100px', // Start loading when 100px away
      threshold: 0.1
    };

    const newReleasesObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          loadNewReleases();
          newReleasesObserver.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const popularMoviesObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          loadPopularMovies();
          popularMoviesObserver.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const popularListsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          loadPopularLists();
          popularListsObserver.unobserve(entry.target);
        }
      });
    }, observerOptions);

    if (newReleasesRef.current) {
      newReleasesObserver.observe(newReleasesRef.current);
    }

    if (popularMoviesRef.current) {
      popularMoviesObserver.observe(popularMoviesRef.current);
    }

    if (popularListsRef.current) {
      popularListsObserver.observe(popularListsRef.current);
    }

    return () => {
      newReleasesObserver.disconnect();
      popularMoviesObserver.disconnect();
      popularListsObserver.disconnect();
    };
  }, [loadNewReleases, loadPopularMovies, loadPopularLists]);


  // Loading skeleton component
  const LoadingSkeleton = ({ count = 6 }) => (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
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
      <h1 className="text-3xl font-bold mb-8">
        {isAuthenticated && user ? `Welcome back, ${user.username}` : "Welcome to Cut-N-Roll"}
      </h1>

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
                <LoadingSkeleton count={6} />
              ) : newReleases.length > 0 ? (
                <div className="animate-fade-in">
                  <PaginatedGridContainer
                    items={newReleases}
                    itemsPerRow={6}
                    rows={1}
                    renderItem={(movie) => (
                      <SmallMovieCard 
                        movie={movie} 
                        searchContext={null}
                      />
                    )}
                    itemHeight="h-64"
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
                <LoadingSkeleton count={6} />
              ) : popularMovies.length > 0 ? (
                <div className="animate-fade-in">
                  <PaginatedGridContainer
                    items={popularMovies}
                    itemsPerRow={6}
                    rows={1}
                    renderItem={(movie) => (
                      <SmallMovieCard 
                        movie={movie} 
                        searchContext={null}
                      />
                    )}
                    itemHeight="h-64"
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
      
      {/* Recent Reviews Section */}
      <div className="mb-12">
        <ReviewGrid />
      </div>
      
      {/* Popular Lists Section */}
      <div ref={popularListsRef} className="mb-12">
        <div className="py-2">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-medium text-gray-400 tracking-wider">POPULAR LISTS</h2>
              <div className="flex items-center gap-3">
                {isLoadingPopularLists && (
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                    <span>Loading...</span>
                  </div>
                )}
                <button 
                  onClick={() => navigate('/search/lists', { 
                    state: { 
                      searchParams: { 
                        sortByLikesAscending: false 
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
              {isLoadingPopularLists ? (
                <div className="text-center p-8">
                  <div className="text-white text-xl">Loading popular lists...</div>
                </div>
              ) : popularLists.length > 0 ? (
                <div className="animate-fade-in">
                  <MovieListsGrid 
                    rows={1} 
                    itemsPerRow={4} 
                    movieLists={popularLists}
                  />
                </div>
              ) : (
                <div className="text-gray-400 text-center py-8">
                  No popular lists available
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent News Section */}
      <div className="mb-12">
        <div className="py-2">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-medium text-gray-400 tracking-wider">RECENT NEWS</h2>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => navigate('/news')}
                  className="cursor-pointer font-medium text-gray-400 hover:text-green-500"
                >
                  MORE
                </button>
              </div>
            </div>
            <hr className="border-t border-gray-700 my-4 mb-8" />
            <NewsFeed 
              type="all" 
              loading={isLoadingNews}
              setLoading={setIsLoadingNews}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;