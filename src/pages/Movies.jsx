import MovieGrid from "../components/ui/movies/MovieGrid";
import SmallMovieCard from '../components/ui/movies/SmallMovieCard';
import { WatchService } from '../services/watchService';
import { MovieLikeService } from '../services/movieLikeService';
import { WatchedService } from '../services/watchedService';
import { useAuthStore } from '../stores/authStore';
import { useState, useEffect } from 'react';

const Movies = () => {
  const { isAuthenticated, user } = useAuthStore();
  const [recentlyLiked, setRecentlyLiked] = useState([]);
  const [wantToWatch, setWantToWatch] = useState([]);
  const [recentlyWatched, setRecentlyWatched] = useState([]);
  const [loadingLiked, setLoadingLiked] = useState(false);
  const [loadingWantToWatch, setLoadingWantToWatch] = useState(false);
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
      } catch (error) {
        console.error('Error fetching recently liked movies:', error);
        setRecentlyLiked([]);
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
      } catch (error) {
        console.error('Error fetching want to watch movies:', error);
        setWantToWatch([]);
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
          itemsPerRow={6} 
          movies={wantToWatch} 
          CardComponent={SmallMovieCard}
          loading={loadingWantToWatch}
        />
        <MovieGrid 
          heading={"RECENTLY WATCHED"} 
          rows={1} 
          itemsPerRow={6} 
          movies={recentlyWatched} 
          CardComponent={SmallMovieCard}
          loading={loadingWatched}
        />
        <MovieGrid 
          heading={"RECENTLY LIKED"} 
          rows={1} 
          itemsPerRow={6} 
          movies={recentlyLiked} 
          CardComponent={SmallMovieCard}
          loading={loadingLiked}
        />
        {!loadingWantToWatch && wantToWatch.length === 0 && isAuthenticated && (
          <div className="py-2">
            <div className="max-w-7xl mx-auto">
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📋</div>
                <p>No movies in your watchlist yet</p>
                <p className="text-sm text-gray-600 mt-1">Add movies to your watchlist to see them here!</p>
              </div>
            </div>
          </div>
        )}

        {!loadingLiked && recentlyLiked.length === 0 && isAuthenticated && (
          <div className="py-2">
            <div className="max-w-7xl mx-auto">
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">💚</div>
                <p>No liked movies yet</p>
                <p className="text-sm text-gray-600 mt-1">Like some movies to see them here!</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Movies;