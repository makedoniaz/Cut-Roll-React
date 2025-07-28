// src/hooks/useStores.js
import { useMovieStore } from '../stores/movieStore';
import { useAuthStore } from '../stores/authStore';
import { useUIStore } from '../stores/uiStore';

// Custom hook to access all stores
export const useStores = () => {
  const movieStore = useMovieStore();
  const authStore = useAuthStore();
  const uiStore = useUIStore();

  return {
    // Movie store
    movie: movieStore,
    
    // Auth store
    auth: authStore,
    
    // UI store
    ui: uiStore,
    
    // Quick access to commonly used states
    user: authStore.user,
    isAuthenticated: authStore.isAuthenticated,
    favorites: movieStore.favorites,
    watchlist: movieStore.watchlist,
    theme: uiStore.theme,
    
    // Quick access to commonly used actions
    login: authStore.login,
    logout: authStore.logout,
    addToFavorites: movieStore.addToFavorites,
    addToWatchlist: movieStore.addToWatchlist,
    rateMovie: movieStore.rateMovie,
    showSuccess: uiStore.showSuccess,
    showError: uiStore.showError,
    openModal: uiStore.openModal,
    closeModal: uiStore.closeModal
  };
};

// Individual selector hooks for performance optimization
export const useAuth = () => {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const isLoading = useAuthStore((state) => state.isLoading);
  const login = useAuthStore((state) => state.login);
  const loginGoogle = useAuthStore((state) => state.loginGoogle)
  const logout = useAuthStore((state) => state.logout);
  const register = useAuthStore((state) => state.register);
  const verifyToken = useAuthStore((state) => state.verifyToken);
  
  return { user, isAuthenticated, isLoading, login, loginGoogle, logout, register, verifyToken, refreshToken };
};

export const useMovies = () => {
  const movies = useMovieStore((state) => state.movies);
  const currentMovie = useMovieStore((state) => state.currentMovie);
  const favorites = useMovieStore((state) => state.favorites);
  const watchlist = useMovieStore((state) => state.watchlist);
  const userRatings = useMovieStore((state) => state.userRatings);
  const addToFavorites = useMovieStore((state) => state.addToFavorites);
  const removeFromFavorites = useMovieStore((state) => state.removeFromFavorites);
  const addToWatchlist = useMovieStore((state) => state.addToWatchlist);
  const removeFromWatchlist = useMovieStore((state) => state.removeFromWatchlist);
  const rateMovie = useMovieStore((state) => state.rateMovie);
  const isFavorite = useMovieStore((state) => state.isFavorite);
  const isInWatchlist = useMovieStore((state) => state.isInWatchlist);
  const getUserRating = useMovieStore((state) => state.getUserRating);
  
  return {
    movies, currentMovie, favorites, watchlist, userRatings,
    addToFavorites, removeFromFavorites, addToWatchlist, removeFromWatchlist,
    rateMovie, isFavorite, isInWatchlist, getUserRating
  };
};

export const useUI = () => {
  const theme = useUIStore((state) => state.theme);
  const modals = useUIStore((state) => state.modals);
  const notifications = useUIStore((state) => state.notifications);
  const searchQuery = useUIStore((state) => state.searchQuery);
  const searchResults = useUIStore((state) => state.searchResults);
  const movieFilters = useUIStore((state) => state.movieFilters);
  const viewMode = useUIStore((state) => state.viewMode);
  const setTheme = useUIStore((state) => state.setTheme);
  const openModal = useUIStore((state) => state.openModal);
  const closeModal = useUIStore((state) => state.closeModal);
  const addNotification = useUIStore((state) => state.addNotification);
  const showSuccess = useUIStore((state) => state.showSuccess);
  const showError = useUIStore((state) => state.showError);
  const setSearchQuery = useUIStore((state) => state.setSearchQuery);
  const setMovieFilter = useUIStore((state) => state.setMovieFilter);
  
  return {
    theme, modals, notifications, searchQuery, searchResults, movieFilters, viewMode,
    setTheme, openModal, closeModal, addNotification, showSuccess, showError,
    setSearchQuery, setMovieFilter
  };
};