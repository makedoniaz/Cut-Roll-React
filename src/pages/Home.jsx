import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import MovieGrid from "../components/ui/movies/MovieGrid";
import NewsFeed from "../components/ui/news/NewsFeed";
import MovieListsGrid from "../components/ui/movie-lists/MovieListsGrid";
import SmallMovieCard from '../components/ui/movies/SmallMovieCard';
import SectionHeading from "../components/ui/common/SectionHeading";
import PaginatedGridContainer from "../components/layout/PaginatedGridContainer";
import { useAuthStore } from "../stores/authStore";
import { MovieService } from "../services/movieService";
import { NewsService } from "../services/newsService";
import NewsCard from "../components/news/NewsCard";

const Home = () => {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [newReleases, setNewReleases] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [recentNews, setRecentNews] = useState([]);
  const [isLoadingNewReleases, setIsLoadingNewReleases] = useState(false);
  const [isLoadingPopular, setIsLoadingPopular] = useState(false);
  const [isLoadingRecentNews, setIsLoadingRecentNews] = useState(false);
  const [error, setError] = useState(null);
  
  // Refs for intersection observer
  const newReleasesRef = useRef(null);
  const popularMoviesRef = useRef(null);
  const recentNewsRef = useRef(null);

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

  // Lazy load recent news
  const loadRecentNews = useCallback(async () => {
    if (isLoadingRecentNews || recentNews.length > 0) return;
    
    try {
      setIsLoadingRecentNews(true);
      setError(null);

      // Fetch recent news (August 1st to current date)
      const currentDate = new Date();
      const augustFirst = new Date(currentDate.getFullYear(), 7, 1); // Month is 0-indexed, so 7 = August
      
      const searchParams = {
        query: null,
        authorId: null,
        from: augustFirst.toISOString(),
        to: currentDate.toISOString(),
        referenceToSearch: null,
        page: 1,
        pageSize: 6
      };

      const recentNewsData = await NewsService.searchNews(searchParams);
      const newsData = recentNewsData.data || recentNewsData || [];
      
      // Transform the news data to match NewsCard expected format
      const transformedNews = newsData.map(article => ({
        id: article.id,
        title: article.title || 'Untitled Article',
        content: article.content || '',
        excerpt: article.content 
          ? article.content.length > 200 
            ? article.content.substring(0, 200).trim() + '...' 
            : article.content.trim()
          : 'No content available',
        likes: article.likesCount || 0,
        likesCount: article.likesCount || 0,
        comments: 0,
        category: 'News',
        imageUrl: article.photoPath || '/news-placeholder.jpg',
        readTime: '5 min read',
        publishedAt: article.createdAt || new Date().toISOString(),
        createdAt: article.createdAt || new Date().toISOString(),
        updatedAt: article.updatedAt,
        authorId: article.authorId || 'unknown',
        author: {
          id: article.author?.id || article.authorId || 'unknown',
          name: article.author?.userName || 'Anonymous User',
          avatar: article.author?.avatarPath || null
        },
        references: article.newsReferences || []
      }));

      setRecentNews(transformedNews);
    } catch (err) {
      console.error('Error fetching recent news:', err);
      setError('Failed to load recent news. Please try again later.');
    } finally {
      setIsLoadingRecentNews(false);
    }
  }, [isLoadingRecentNews, recentNews.length]);

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

    const recentNewsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          loadRecentNews();
          recentNewsObserver.unobserve(entry.target);
        }
      });
    }, observerOptions);

    if (newReleasesRef.current) {
      newReleasesObserver.observe(newReleasesRef.current);
    }

    if (popularMoviesRef.current) {
      popularMoviesObserver.observe(popularMoviesRef.current);
    }

    if (recentNewsRef.current) {
      recentNewsObserver.observe(recentNewsRef.current);
    }

    return () => {
      newReleasesObserver.disconnect();
      popularMoviesObserver.disconnect();
      recentNewsObserver.disconnect();
    };
      }, [loadNewReleases, loadPopularMovies, loadRecentNews]);

  const movieLists = [
  {
    id: 1,
    title: "Feminist Horror Starter Pack",
    author: {
      name: "Horrorville",
      avatar: "🎭"
    },
    stats: {
      films: 20,
      likes: 2100,
      comments: 24
    },
    coverImages: [
      "https://images.unsplash.com/photo-1518929458119-e5bf444c30f4?w=400&h=600&fit=crop",
      "https://images.unsplash.com/photo-1489599538824-2e2b8e3a5f3a?w=400&h=600&fit=crop",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=600&fit=crop",
      "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&h=600&fit=crop"
    ]
  },
  {
    id: 2,
    title: "That was their first movie???",
    author: {
      name: "Bailey",
      avatar: "👤"
    },
    stats: {
      films: 46,
      likes: 1500,
      comments: 76
    },
    coverImages: [
      "https://images.unsplash.com/photo-1489599538824-2e2b8e3a5f3a?w=400&h=600&fit=crop",
      "https://images.unsplash.com/photo-1518929458119-e5bf444c30f4?w=400&h=600&fit=crop",
      "https://images.unsplash.com/photo-1516796181074-bf453fbfa3e6?w=400&h=600&fit=crop",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop"
    ]
  },
  {
    id: 3,
    title: "New York Times' 100 Best Movies of the 21st Century",
    author: {
      name: "Mogwai_Synth",
      avatar: "🎬"
    },
    stats: {
      films: 100,
      likes: 2200,
      comments: 282
    },
    coverImages: [
      "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=400&h=600&fit=crop",
      "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=600&fit=crop",
      "https://images.unsplash.com/photo-1489599538824-2e2b8e3a5f3a?w=400&h=600&fit=crop",
      "https://images.unsplash.com/photo-1518929458119-e5bf444c30f4?w=400&h=600&fit=crop"
    ]
  },
    {
    id: 4,
    title: "That was their first movie???",
    author: {
      name: "Bailey",
      avatar: "👤"
    },
    stats: {
      films: 46,
      likes: 1500,
      comments: 76
    },
    coverImages: [
      "https://images.unsplash.com/photo-1489599538824-2e2b8e3a5f3a?w=400&h=600&fit=crop",
      "https://images.unsplash.com/photo-1518929458119-e5bf444c30f4?w=400&h=600&fit=crop",
      "https://images.unsplash.com/photo-1516796181074-bf453fbfa3e6?w=400&h=600&fit=crop",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop"
    ]
  },
];

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
        {isAuthenticated && user ? `Welcome back, ${user.username}` : "Welcome to CutRoll"}
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
                  onClick={() => navigate('/search', { 
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
                  onClick={() => navigate('/search', { 
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
      
      {/* Recent News Section */}
      <div ref={recentNewsRef} className="mb-12">
        <div className="py-2">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-medium text-gray-400 tracking-wider">RECENT NEWS</h2>
              <div className="flex items-center gap-3">
                {isLoadingRecentNews && (
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                    <span>Loading...</span>
                  </div>
                  )}
                <button 
                  onClick={() => navigate('/news')}
                  className="cursor-pointer font-medium text-gray-400 hover:text-green-500"
                >
                  MORE
                </button>
              </div>
            </div>
            <hr className="border-t border-gray-700 my-4 mb-8" />
            <div>
              {isLoadingRecentNews ? (
                <LoadingSkeleton count={6} />
              ) : recentNews.length > 0 ? (
                <div className="animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recentNews.slice(0, 6).map((article) => (
                      <NewsCard
                        key={article.id}
                        article={article}
                        showAuthor={true}
                        showActions={false}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-gray-400 text-center py-8">
                  No recent news available
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="mb-12">
        <MovieListsGrid 
          heading={"POPULAR LISTS"} 
          rows={1} 
          itemsPerRow={4} 
          movieLists={movieLists}
        />
      </div>
      
      <NewsFeed />
    </div>
  );
};

export default Home;