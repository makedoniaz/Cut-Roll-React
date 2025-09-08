export const API_ENDPOINTS = {
    CREATE: 'users/Review',
    UPDATE: 'users/Review',
    GET_BY_ID: 'users/Review/',
    DELETE: 'users/Review/',
    GET_BY_USER_AND_MOVIE: 'users/Review/by-user-and-movie',
    GET_BY_MOVIE: 'users/Review/by-movie',
    GET_BY_USER: 'users/Review/by-user',
    GET_AVERAGE_RATING: 'users/Review/average-rating/',
    GET_COUNT: 'users/Review/count/',
    SEARCH: 'users/Review/search',
    SEARCH_MOVIES: 'users/Movie/search',
    SEARCH_USERS: 'users/User/search'
};

// Sort enum for review search
export const REVIEW_SORT_BY = {
    CREATED_AT: 0,
    RATING: 1,
    LIKES: 2
};
