import api from './api.js';
import { API_ENDPOINTS, REVIEW_SORT_BY } from '../constants/review.js';

export class ReviewService {
    /**
     * Create a new review
     * @param {Object} reviewData - Review data
     * @param {string} reviewData.userId - User ID
     * @param {string} reviewData.movieId - Movie ID (UUID)
     * @param {string} reviewData.content - Review content
     * @param {number} reviewData.rating - Review rating (0-5)
     * @returns {Promise<Object>} Created review
     */
    static async createReview(reviewData) {
        if (!reviewData.userId || !reviewData.movieId || !reviewData.content || reviewData.rating === undefined) {
            throw new Error('userId, movieId, content, and rating are required');
        }

        if (reviewData.rating < 0 || reviewData.rating > 5) {
            throw new Error('Rating must be between 0 and 5');
        }

        const payload = {
            userId: reviewData.userId,
            movieId: reviewData.movieId,
            content: reviewData.content,
            rating: reviewData.rating
        };

        const response = await api.post(API_ENDPOINTS.CREATE, payload);
        
        if (!response.ok) {
            let errorMessage = await response.text();
            throw new Error(errorMessage || 'Failed to create review');
        }

        const data = await response.json();
        return data;
    }

    /**
     * Update an existing review
     * @param {Object} reviewData - Review data
     * @param {string} reviewData.id - Review ID (UUID)
     * @param {string} reviewData.userId - User ID
     * @param {string} reviewData.content - Review content
     * @param {number} reviewData.rating - Review rating (0-5)
     * @returns {Promise<Object>} Updated review
     */
    static async updateReview(reviewData) {
        if (!reviewData.id || !reviewData.userId || !reviewData.content || reviewData.rating === undefined) {
            throw new Error('id, userId, content, and rating are required');
        }

        if (reviewData.rating < 0 || reviewData.rating > 5) {
            throw new Error('Rating must be between 0 and 5');
        }

        const payload = {
            id: reviewData.id,
            userId: reviewData.userId,
            content: reviewData.content,
            rating: reviewData.rating
        };

        const response = await api.put(API_ENDPOINTS.UPDATE, payload);
        
        if (!response.ok) {
            let errorMessage = await response.text();
            throw new Error(errorMessage || 'Failed to update review');
        }

        const data = await response.json();
        return data;
    }

    /**
     * Get a review by ID
     * @param {string} reviewId - Review ID (UUID)
     * @returns {Promise<Object>} Review data
     */
    static async getReviewById(reviewId) {
        if (!reviewId) {
            throw new Error('Review ID is required');
        }

        const response = await api.get(API_ENDPOINTS.GET_BY_ID + reviewId);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Review not found');
            }
            let errorMessage = await response.text();
            throw new Error(errorMessage || 'Failed to fetch review');
        }

        const data = await response.json();
        return data;
    }

    /**
     * Delete a review by ID
     * @param {string} reviewId - Review ID (UUID)
     * @returns {Promise<boolean>} Success status
     */
    static async deleteReview(reviewId) {
        if (!reviewId) {
            throw new Error('Review ID is required');
        }

        const response = await api.delete(API_ENDPOINTS.DELETE + reviewId);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Review not found');
            }
            let errorMessage = await response.text();
            throw new Error(errorMessage || 'Failed to delete review');
        }

        return true;
    }

    /**
     * Get a review by user ID and movie ID
     * @param {string} userId - User ID
     * @param {string} movieId - Movie ID (UUID)
     * @returns {Promise<Object>} Review data
     */
    static async getReviewByUserAndMovie(userId, movieId) {
        if (!userId || !movieId) {
            throw new Error('userId and movieId are required');
        }

        const queryParams = new URLSearchParams({
            userId: userId,
            movieId: movieId
        });

        const response = await api.get(`${API_ENDPOINTS.GET_BY_USER_AND_MOVIE}?${queryParams}`);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Review not found');
            }
            let errorMessage = await response.text();
            throw new Error(errorMessage || 'Failed to fetch review');
        }

        const data = await response.json();
        return data;
    }

    /**
     * Get reviews by movie ID with pagination
     * @param {Object} params - Search parameters
     * @param {string} params.movieId - Movie ID (UUID)
     * @param {number} params.page - Page number (0-based)
     * @param {number} params.pageSize - Number of items per page
     * @returns {Promise<Object>} Paginated reviews data
     */
    static async getReviewsByMovie(params) {
        if (!params.movieId || params.page === undefined || params.pageSize === undefined) {
            throw new Error('movieId, page, and pageSize are required');
        }

        if (params.page < 0) {
            throw new Error('Page must be 0 or greater');
        }

        if (params.pageSize <= 0) {
            throw new Error('Page size must be greater than 0');
        }

        const payload = {
            movieId: params.movieId,
            page: params.page,
            pageSize: params.pageSize
        };

        const response = await api.post(API_ENDPOINTS.GET_BY_MOVIE, payload);
        
        if (!response.ok) {
            let errorMessage = await response.text();
            throw new Error(errorMessage || 'Failed to fetch reviews by movie');
        }

        const data = await response.json();
        return data;
    }

    /**
     * Get reviews by user ID with pagination
     * @param {Object} params - Search parameters
     * @param {string} params.userId - User ID
     * @param {number} params.page - Page number (0-based)
     * @param {number} params.pageSize - Number of items per page
     * @returns {Promise<Object>} Paginated reviews data
     */
    static async getReviewsByUser(params) {
        if (!params.userId || params.page === undefined || params.pageSize === undefined) {
            throw new Error('userId, page, and pageSize are required');
        }

        if (params.page < 0) {
            throw new Error('Page must be 0 or greater');
        }

        if (params.pageSize <= 0) {
            throw new Error('Page size must be greater than 0');
        }

        const payload = {
            userId: params.userId,
            page: params.page,
            pageSize: params.pageSize
        };

        const response = await api.post(API_ENDPOINTS.GET_BY_USER, payload);
        
        if (!response.ok) {
            let errorMessage = await response.text();
            throw new Error(errorMessage || 'Failed to fetch reviews by user');
        }

        const data = await response.json();
        return data;
    }

    /**
     * Get average rating for a movie
     * @param {string} movieId - Movie ID (UUID)
     * @returns {Promise<number>} Average rating
     */
    static async getAverageRating(movieId) {
        if (!movieId) {
            throw new Error('Movie ID is required');
        }

        const response = await api.get(API_ENDPOINTS.GET_AVERAGE_RATING + movieId);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Movie not found');
            }
            let errorMessage = await response.text();
            throw new Error(errorMessage || 'Failed to fetch average rating');
        }

        const data = await response.json();
        return data;
    }

    /**
     * Get review count for a movie
     * @param {string} movieId - Movie ID (UUID)
     * @returns {Promise<number>} Review count
     */
    static async getReviewCount(movieId) {
        if (!movieId) {
            throw new Error('Movie ID is required');
        }

        const response = await api.get(API_ENDPOINTS.GET_COUNT + movieId);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Movie not found');
            }
            let errorMessage = await response.text();
            throw new Error(errorMessage || 'Failed to fetch review count');
        }

        const data = await response.json();
        return data;
    }

    /**
     * Search reviews with filters
     * @param {Object} searchParams - Search parameters
     * @param {string} [searchParams.userId] - User ID (optional)
     * @param {string} [searchParams.movieId] - Movie ID (UUID, optional)
     * @param {number} [searchParams.minRating] - Minimum rating (optional)
     * @param {number} [searchParams.maxRating] - Maximum rating (optional)
     * @param {string} [searchParams.createdAfter] - Created after date (ISO string, optional)
     * @param {string} [searchParams.createdBefore] - Created before date (ISO string, optional)
     * @param {number} [searchParams.sortBy] - Sort by field (0=CreatedAt, 1=Rating, 2=Likes, optional)
     * @param {boolean} [searchParams.sortDescending] - Sort descending (optional)
     * @param {number} [searchParams.page=1] - Page number (1-based, defaults to 1)
     * @param {number} [searchParams.pageSize=10] - Page size (defaults to 10)
     * @returns {Promise<Object>} Paginated search results
     */
    static async searchReview(searchParams = {}) {
        // Set default values for page and pageSize
        const page = searchParams.page !== undefined ? searchParams.page : 1;
        const pageSize = searchParams.pageSize !== undefined ? searchParams.pageSize : 10;

        // Validate page and pageSize
        if (page < 1) {
            throw new Error('Page must be 1 or greater');
        }

        if (pageSize <= 0) {
            throw new Error('Page size must be greater than 0');
        }

        // Validate sortBy if provided
        if (searchParams.sortBy !== undefined && searchParams.sortBy !== null) {
            const validSortValues = Object.values(REVIEW_SORT_BY);
            if (!validSortValues.includes(searchParams.sortBy)) {
                throw new Error(`Invalid sortBy value. Must be one of: ${validSortValues.join(', ')}`);
            }
        }

        // Validate rating range if provided
        if (searchParams.minRating !== undefined && searchParams.minRating !== null) {
            if (searchParams.minRating < 0 || searchParams.minRating > 5) {
                throw new Error('minRating must be between 0 and 5');
            }
        }

        if (searchParams.maxRating !== undefined && searchParams.maxRating !== null) {
            if (searchParams.maxRating < 0 || searchParams.maxRating > 5) {
                throw new Error('maxRating must be between 0 and 5');
            }
        }

        // Build the payload with only non-null/undefined values
        const payload = {
            page: page,
            pageSize: pageSize
        };

        // Add optional fields only if they have values
        if (searchParams.userId !== undefined && searchParams.userId !== null) {
            payload.userId = searchParams.userId;
        }

        if (searchParams.movieId !== undefined && searchParams.movieId !== null) {
            payload.movieId = searchParams.movieId;
        }

        if (searchParams.minRating !== undefined && searchParams.minRating !== null) {
            payload.minRating = searchParams.minRating;
        }

        if (searchParams.maxRating !== undefined && searchParams.maxRating !== null) {
            payload.maxRating = searchParams.maxRating;
        }

        if (searchParams.createdAfter !== undefined && searchParams.createdAfter !== null) {
            payload.createdAfter = searchParams.createdAfter;
        }

        if (searchParams.createdBefore !== undefined && searchParams.createdBefore !== null) {
            payload.createdBefore = searchParams.createdBefore;
        }

        if (searchParams.sortBy !== undefined && searchParams.sortBy !== null) {
            payload.sortBy = searchParams.sortBy;
        }

        if (searchParams.sortDescending !== undefined && searchParams.sortDescending !== null) {
            payload.sortDescending = searchParams.sortDescending;
        }

        const response = await api.post(API_ENDPOINTS.SEARCH, payload);
        
        if (!response.ok) {
            let errorMessage = await response.text();
            throw new Error(errorMessage || 'Failed to search reviews');
        }

        const data = await response.json();
        return data;
    }

    /**
     * Search movies for reviews
     * @param {Object} searchParams - Search parameters
     * @param {string} [searchParams.title] - Movie title to search for (optional)
     * @param {number} [searchParams.pageNumber=1] - Page number (1-based, defaults to 1)
     * @param {number} [searchParams.pageSize=10] - Page size (defaults to 10)
     * @returns {Promise<Object>} Search results
     */
    static async searchReviewMovies(searchParams = {}) {
        // Set default values
        const pageNumber = searchParams.page !== undefined ? searchParams.page : 1;
        const pageSize = searchParams.pageSize !== undefined ? searchParams.pageSize : 10;

        // Validate page and pageSize
        if (pageNumber < 1) {
            throw new Error('Page number must be 1 or greater');
        }

        if (pageSize <= 0) {
            throw new Error('Page size must be greater than 0');
        }

        // Build the payload
        const payload = {
            page: pageNumber, // Max value as specified
            pageSize: pageSize,
            title: searchParams.title || null,
            genres: null,
            actor: null,
            director: null,
            keywords: null,
            year: null,
            minRating: null,
            maxRating: null,
            country: null,
            language: null,
            sortBy: null,
            sortDescending: true
        };

        // Remove null values
        Object.keys(payload).forEach(key => {
            if (payload[key] === null) {
                delete payload[key];
            }
        });

        const response = await api.post(API_ENDPOINTS.SEARCH_MOVIES, payload);
        
        if (!response.ok) {
            let errorMessage = await response.text();
            throw new Error(errorMessage || 'Failed to search movies');
        }

        const data = await response.json();
        return data;
    }

    /**
     * Search users for reviews
     * @param {Object} searchParams - Search parameters
     * @param {string} [searchParams.searchTerm] - Search term for users (optional)
     * @param {number} [searchParams.pageNumber=1] - Page number (1-based, defaults to 1)
     * @param {number} [searchParams.pageSize=10] - Page size (defaults to 10)
     * @returns {Promise<Object>} Search results
     */
    static async searchReviewUsers(searchParams = {}) {
        // Set default values
        const pageNumber = searchParams.pageNumber !== undefined ? searchParams.pageNumber : 1;
        const pageSize = searchParams.pageSize !== undefined ? searchParams.pageSize : 10;

        // Validate page and pageSize
        if (pageNumber < 1) {
            throw new Error('Page number must be 1 or greater');
        }

        if (pageSize <= 0) {
            throw new Error('Page size must be greater than 0');
        }

        // Build the payload
        const payload = {
            searchTerm: searchParams.searchTerm || null,
            isBanned: null,
            isMuted: null,
            pageNumber: pageNumber,
            pageSize: pageSize
        };

        // Remove null values
        Object.keys(payload).forEach(key => {
            if (payload[key] === null) {
                delete payload[key];
            }
        });

        const response = await api.post(API_ENDPOINTS.SEARCH_USERS, payload);
        
        if (!response.ok) {
            let errorMessage = await response.text();
            throw new Error(errorMessage || 'Failed to search users');
        }

        const data = await response.json();
        return data;
    }
}
