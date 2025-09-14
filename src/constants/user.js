export const API_ENDPOINTS = {
    BASE: 'users/User/',
    GET_BY_ID: 'users/User/{id}',
    GET_BY_USERNAME: 'users/User/by-username/{username}',
    GET_BY_EMAIL: 'users/User/by-email/{email}',
    SEARCH: 'users/User/search',
    EXISTS_USERNAME: 'users/User/exists/username/{username}',
    EXISTS_EMAIL: 'users/User/exists/email/{email}',
    REVIEW_COUNT: 'users/User/review-count/{userId}',
    WATCHED_COUNT: 'users/User/watched-count/{userId}',
    MOVIE_LIKE_COUNT: 'users/User/movie-like-count/{userId}',
    WANT_TO_WATCH_COUNT: 'users/User/want-to-watch-count/{userId}',
    LIST_COUNT: 'users/User/list-count/{userId}',
    AVERAGE_RATING: 'users/User/average-rating/{userId}'
};
