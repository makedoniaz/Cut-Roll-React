export const API_ENDPOINTS = {
    BASE: 'news/news/',
    CREATE: 'news/news/',
    SEARCH: 'news/news/search/',
    FILTER: 'news/news/filter/',
    COUNT: 'news/news/count/',
    PAGINATION: 'news/news/pagination/',
    LIKE: 'news/news/{newsId}/likes/',
    REFERENCE_MOVIE: 'news/Movie/search/',
    REFERENCE_PEOPLE: 'news/People/search/',
    REFERENCE_GENRE: 'news/Genre/search/',
    REFERENCE_PRODUCTION_COMPANY: 'news/ProductionCompany/search/',
    REFERENCE_KEYWORD: 'news/Keyword/search/',
};

export const REFERENCE_TYPES = {
    MOVIE: 0,
    PEOPLE: 1,
    GENRE: 2,
    PRODUCTION_COMPANY: 3,
    KEYWORD: 4,
    NEWS: 5
};