import MovieGrid from "../components/ui/movies/MovieGrid";
import SmallMovieCard from '../components/ui/movies/SmallMovieCard';
import { WatchService } from '../services/watchService';
import { useAuthStore } from '../stores/authStore';
import { useState, useEffect } from 'react';

const Movies = () => {
  const { isAuthenticated, user } = useAuthStore();
  const [recentlyLiked, setRecentlyLiked] = useState([]);
  const [recentlyWatched, setRecentlyWatched] = useState([]);
  const [loadingLiked, setLoadingLiked] = useState(false);
  const [loadingWatched, setLoadingWatched] = useState(false);

  const movies = [
    { id: 1, title: 'The Matrix Reloaded', year: 2003, poster: null, rating: 4 },
    { id: 2, title: 'Inception Dreams', year: 2010, poster: '🎭', rating: 5 },
    { id: 3, title: 'Interstellar Journey', year: 2014, poster: '🚀', rating: 5 },
    { id: 4, title: 'The Dark Knight Rises', year: 2012, poster: '🦇', rating: 4 },
    { id: 5, title: 'Pulp Fiction Classic', year: 1994, poster: '🔫', rating: 5 },
        { id: 3, title: 'Interstellar Journey', year: 2014, poster: '🚀', rating: 5 },
    { id: 4, title: 'The Dark Knight Rises', year: 2012, poster: '🦇', rating: 4 },
    { id: 5, title: 'Pulp Fiction Classic', year: 1994, poster: '🔫', rating: 5 },
        { id: 3, title: 'Interstellar Journey', year: 2014, poster: '🚀', rating: 5 },
    { id: 4, title: 'The Dark Knight Rises', year: 2012, poster: '🦇', rating: 4 },
    { id: 5, title: 'Pulp Fiction Classic', year: 1994, poster: '🔫', rating: 5 },
        { id: 3, title: 'Interstellar Journey', year: 2014, poster: '🚀', rating: 5 },
    { id: 4, title: 'The Dark Knight Rises', year: 2012, poster: '🦇', rating: 4 },
    { id: 5, title: 'Pulp Fiction Classic', year: 1994, poster: '🔫', rating: 5 },
  ];

  // Fetch recently liked movies when user is authenticated
  useEffect(() => {
    const fetchRecentlyLiked = async () => {
      if (!isAuthenticated || !user?.id) {
        setRecentlyLiked([]);
        return;
      }

      setLoadingLiked(true);
      try {
        const response = await WatchService.getWantToWatchByUser({
          userId: user.id,
          page: 0, // pageNumber = 1 (0-indexed)
          pageSize: 6
        });
        
        // Transform the response to match the expected movie format
        const likedMovies = response.data?.map(movie => ({
          id: movie.movieId,
          title: movie.title,
          year: 'TBA', // API doesn't provide release date in this response
          poster: movie.poster || null, // Pass the poster object directly
          rating: 0 // API doesn't provide rating in this response
        })) || [];

        setRecentlyLiked(likedMovies);
      } catch (error) {
        console.error('Error fetching recently liked movies:', error);
        setRecentlyLiked([]);
      } finally {
        setLoadingLiked(false);
      }
    };

    fetchRecentlyLiked();
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
        const response = await WatchService.getWantToWatchByUser({
          userId: user.id,
          page: 0, // pageNumber = 1 (0-indexed)
          pageSize: 6
        });
        
        // Transform the response to match the expected movie format
        const watchedMovies = response.data?.map(movie => ({
          id: movie.movieId,
          title: movie.title,
          year: 'TBA', // API doesn't provide release date in this response
          poster: movie.poster || null, // Pass the poster object directly
          rating: 0 // API doesn't provide rating in this response
        })) || [];

        setRecentlyWatched(watchedMovies);
      } catch (error) {
        console.error('Error fetching recently watched movies:', error);
        setRecentlyWatched([]);
      } finally {
        setLoadingWatched(false);
      }
    };

    fetchRecentlyWatched();
  }, [isAuthenticated, user?.id]);

  return (
    <div>
      <div>
        <MovieGrid heading={"FOR YOU"} rows={2} itemsPerRow={6} movies={movies} CardComponent={SmallMovieCard} />
        <MovieGrid 
          heading={"WANT TO WATCH"} 
          rows={1} 
          itmesPerRow={6} 
          movies={recentlyWatched} 
          CardComponent={SmallMovieCard}
          loading={loadingWatched}
        />
        <MovieGrid 
          heading={"RECENTLY LIKED"} 
          rows={1} 
          itmesPerRow={6} 
          movies={recentlyLiked} 
          CardComponent={SmallMovieCard}
          loading={loadingLiked}
        />
        {!loadingWatched && recentlyWatched.length === 0 && isAuthenticated && (
          <div className="py-2">
            <div className="max-w-7xl mx-auto">
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">🎬</div>
                <p>No recently watched movies yet</p>
                <p className="text-sm text-gray-600 mt-1">Start watching movies to see them here!</p>
              </div>
            </div>
          </div>
        )}
        {!loadingLiked && recentlyLiked.length === 0 && isAuthenticated && (
          <div className="py-2">
            <div className="max-w-7xl mx-auto">
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">🎬</div>
                <p>No movies in your watchlist yet</p>
                <p className="text-sm text-gray-600 mt-1">Start adding movies to see them here!</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Movies;