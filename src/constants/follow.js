export const API_ENDPOINTS = {
    BASE: 'users/Follow',
    FOLLOW: 'users/Follow',
    UNFOLLOW: 'users/Follow',
    FOLLOW_BY_USER: 'users/Follow/by-user',
    FOLLOWERS_COUNT: 'users/Follow/followers-count/{userId}',
    FOLLOWING_COUNT: 'users/Follow/following-count/{userId}',
    STATUS: 'users/Follow/status',
    IS_FOLLOWING: 'users/Follow/is-following',
    FEED: 'users/Follow/feed'
};

export const FollowType = {
    FOLLOWERS: 0,
    FOLLOWING: 1
};

export const ActivityType = {
    MOVIE_LIKE: 0,
    MOVIE_REVIEW: 1,
    MOVIE_WATCHED: 2,
    WANT_TO_WATCH: 3,
    LIST_CREATED: 4,
    LIST_LIKED: 5,
    REVIEW_LIKED: 6
};
