import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useMovieStore = create(
  persist(
    (set, get) => ({
      // State
      movies: [],
      currentMovie: null,
      favorites: [],
      watchlist: [],
      userRatings: {}, // { movieId: { rating, review, date } }
      watchedMovies: new Set(),
      movieLists: [], // Custom user lists
      loading: false,
      error: null,

      // Movie Actions
      setMovies: (movies) => set({ movies }),
      setCurrentMovie: (movie) => set({ currentMovie: movie }),
      addMovie: (movie) => set((state) => ({
        movies: [...state.movies, movie]
      })),

      // Favorites
      addToFavorites: (movie) => set((state) => {
        const isAlreadyFavorite = state.favorites.some(fav => fav.id === movie.id);
        if (isAlreadyFavorite) return state;
        
        return {
          favorites: [...state.favorites, { ...movie, addedAt: new Date().toISOString() }]
        };
      }),

      removeFromFavorites: (movieId) => set((state) => ({
        favorites: state.favorites.filter(movie => movie.id !== movieId)
      })),

      isFavorite: (movieId) => {
        return get().favorites.some(movie => movie.id === movieId);
      },

      // Watchlist
      addToWatchlist: (movie) => set((state) => {
        const isAlreadyInWatchlist = state.watchlist.some(item => item.id === movie.id);
        if (isAlreadyInWatchlist) return state;
        
        return {
          watchlist: [...state.watchlist, { ...movie, addedAt: new Date().toISOString() }]
        };
      }),

      removeFromWatchlist: (movieId) => set((state) => ({
        watchlist: state.watchlist.filter(movie => movie.id !== movieId)
      })),

      isInWatchlist: (movieId) => {
        return get().watchlist.some(movie => movie.id === movieId);
      },

      // Ratings & Reviews
      rateMovie: (movieId, rating, review = '') => set((state) => ({
        userRatings: {
          ...state.userRatings,
          [movieId]: {
            rating,
            review,
            date: new Date().toISOString()
          }
        },
        watchedMovies: new Set([...state.watchedMovies, movieId])
      })),

      updateReview: (movieId, review) => set((state) => ({
        userRatings: {
          ...state.userRatings,
          [movieId]: {
            ...state.userRatings[movieId],
            review,
            date: new Date().toISOString()
          }
        }
      })),

      removeRating: (movieId) => set((state) => {
        const newRatings = { ...state.userRatings };
        delete newRatings[movieId];
        const newWatched = new Set(state.watchedMovies);
        newWatched.delete(movieId);
        
        return {
          userRatings: newRatings,
          watchedMovies: newWatched
        };
      }),

      getUserRating: (movieId) => {
        return get().userRatings[movieId] || null;
      },

      isWatched: (movieId) => {
        return get().watchedMovies.has(movieId);
      },

      // Custom Lists
      createList: (listName, description = '') => set((state) => ({
        movieLists: [
          ...state.movieLists,
          {
            id: Date.now().toString(),
            name: listName,
            description,
            movies: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]
      })),

      addMovieToList: (listId, movie) => set((state) => ({
        movieLists: state.movieLists.map(list =>
          list.id === listId
            ? {
                ...list,
                movies: [...list.movies, movie],
                updatedAt: new Date().toISOString()
              }
            : list
        )
      })),

      removeMovieFromList: (listId, movieId) => set((state) => ({
        movieLists: state.movieLists.map(list =>
          list.id === listId
            ? {
                ...list,
                movies: list.movies.filter(movie => movie.id !== movieId),
                updatedAt: new Date().toISOString()
              }
            : list
        )
      })),

      deleteList: (listId) => set((state) => ({
        movieLists: state.movieLists.filter(list => list.id !== listId)
      })),

      // Loading & Error states
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      // Stats & Analytics
      getStats: () => {
        const state = get();
        return {
          totalMoviesWatched: state.watchedMovies.size,
          totalFavorites: state.favorites.length,
          totalWatchlist: state.watchlist.length,
          totalLists: state.movieLists.length,
          averageRating: Object.values(state.userRatings).length > 0
            ? Object.values(state.userRatings).reduce((sum, rating) => sum + rating.rating, 0) / Object.values(state.userRatings).length
            : 0
        };
      },

      // Clear all data (useful for logout)
      clearMovieData: () => set({
        favorites: [],
        watchlist: [],
        userRatings: {},
        watchedMovies: new Set(),
        movieLists: []
      })
    }),
    {
      name: 'movie-storage',
      // Only persist user-specific data
      partialize: (state) => ({
        favorites: state.favorites,
        watchlist: state.watchlist,
        userRatings: state.userRatings,
        watchedMovies: Array.from(state.watchedMovies), // Convert Set to Array for storage
        movieLists: state.movieLists
      }),
      // Custom serialization for Set
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.watchedMovies = new Set(state.watchedMovies || []);
        }
      }
    }
  )
);