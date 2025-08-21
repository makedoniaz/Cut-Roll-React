export const API_CONFIG = {
  TMDB_BASE_URL: 'https://api.themoviedb.org/3',
  TMDB_IMAGE_BASE_URL: 'https://image.tmdb.org/t/p',
};

export const IMAGE_SIZES = {
  POSTER: {
    SMALL: 'w200',
    MEDIUM: 'w500',
    LARGE: 'w780',
    ORIGINAL: 'original'
  },
  BACKDROP: {
    SMALL: 'w300',
    MEDIUM: 'w780',
    LARGE: 'w1280',
    ORIGINAL: 'original'
  }
};

export const ROUTES = {
  HOME: '/',
  MOVIES: '/movies',
  MOVIE_DETAIL: '/movie/:id',
  PROFILE: '/profile/:username',
  LISTS: '/lists',
  REVIEWS: '/reviews',
  SEARCH: '/search',
  LOGIN: '/login',
  REGISTER: '/register',
  NEWS: '/news',
  NEWS_CREATE: '/news/create'
};

// Movie Genres (TMDB genre IDs)
export const GENRES = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Science Fiction',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western'
};

// Rating System
export const RATING_SYSTEM = {
  MIN: 0.5,
  MAX: 5,
  STEP: 0.5,
  STARS: 5
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100
};

// Local Storage Keys
export const STORAGE_KEYS = {
  USER_TOKEN: 'cutroll_token',
  USER_DATA: 'cutroll_user',
  THEME: 'cutroll_theme',
  FAVORITES: 'cutroll_favorites',
  WATCHLIST: 'cutroll_watchlist'
};

// Theme Colors
export const THEME = {
  COLORS: {
    PRIMARY: '#00d374',
    SECONDARY: '#ff8000',
    DARK: '#14181c',
    DARK_LIGHTER: '#2c3440',
    MAIN_GRAY: "#1E2939",
    ACCENT: '#40bcf4'
  }
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    VERIFY: '/auth/verify'
  },
  USER: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile',
    CHANGE_PASSWORD: '/user/change-password'
  }
};

// Export news constants
export * from './news.js';

// Export genres constants
export * from './genres.js';

// Export persons constants
export * from './persons.js';