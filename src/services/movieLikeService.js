import api from './api.js';
import { API_ENDPOINTS } from '../constants/movieLike.js';

export class MovieLikeService {
    /**
     * Like a movie
     * @param {Object} data - The request data
     * @param {string} data.userId - The user ID
     * @param {string} data.movieId - The movie ID (GUID format)
     * @returns {Promise<Object>} The response data
     */
    static async likeMovie(data) {
        if (!data.userId || !data.movieId) {
            throw new Error('userId and movieId are required');
        }

        const response = await api.post(API_ENDPOINTS.LIKE, data);
        
        if (!response.ok) {
            let errorMessage = await response.text();
            throw new Error(errorMessage || 'Failed to like movie');
        }

        const responseData = await response.json();
        return responseData;
    }

    /**
     * Unlike a movie
     * @param {Object} data - The request data
     * @param {string} data.userId - The user ID
     * @param {string} data.movieId - The movie ID (GUID format)
     * @returns {Promise<Object>} The response data
     */
    static async unlikeMovie(data) {
        if (!data.userId || !data.movieId) {
            throw new Error('userId and movieId are required');
        }

        const response = await api.post(API_ENDPOINTS.UNLIKE, data);
        
        if (!response.ok) {
            let errorMessage = await response.text();
            throw new Error(errorMessage || 'Failed to unlike movie');
        }

        const responseData = await response.json();
        return responseData;
    }

    /**
     * Get movies liked by user with pagination
     * @param {Object} data - The request data
     * @param {string} data.userId - The user ID
     * @param {number} data.page - The page number (0-based)
     * @param {number} data.pageSize - The number of items per page
     * @returns {Promise<Object>} The paginated response data
     */
    static async getLikedByUser(data) {
        if (!data.userId) {
            throw new Error('userId is required');
        }

        console.log('MovieLikeService.getLikedByUser called with:', data); // Debug log
        console.log('Using endpoint:', API_ENDPOINTS.LIKED_BY_USER); // Debug log
        console.log('Full URL will be: https://cutnroll.it.com/api/' + API_ENDPOINTS.LIKED_BY_USER); // Debug log
        
        const response = await api.post(API_ENDPOINTS.LIKED_BY_USER, data);
        
        console.log('API response status:', response.status); // Debug log
        
        if (!response.ok) {
            let errorMessage = await response.text();
            throw new Error(errorMessage || 'Failed to fetch liked movies');
        }

        const responseData = await response.json();
        console.log('API response data:', responseData); // Debug log
        return responseData;
    }

    /**
     * Check if a movie is liked by user
     * @param {string} userId - The user ID
     * @param {string} movieId - The movie ID (GUID format)
     * @returns {Promise<boolean>} True if movie is liked
     */
    static async isLiked(userId, movieId) {
        if (!userId || !movieId) {
            throw new Error('userId and movieId are required');
        }

        const endpoint = `${API_ENDPOINTS.IS_LIKED}?userId=${encodeURIComponent(userId)}&movieId=${encodeURIComponent(movieId)}`;
        const response = await api.get(endpoint);
        
        if (!response.ok) {
            let errorMessage = await response.text();
            throw new Error(errorMessage || 'Failed to check like status');
        }

        const responseData = await response.json();
        console.log('Raw API response for isLiked:', responseData); // Debug log
        
        // Handle different possible response formats
        if (typeof responseData === 'boolean') {
            return responseData;
        } else if (responseData.isLiked !== undefined) {
            return responseData.isLiked;
        } else if (responseData.status !== undefined) {
            return responseData.status === true || responseData.status === 'true';
        } else if (responseData.result !== undefined) {
            return responseData.result === true || responseData.result === 'true';
        }
        
        // Default fallback
        return false;
    }

    /**
     * Get the count of likes for a specific movie
     * @param {string} movieId - The movie ID (GUID format)
     * @returns {Promise<number>} The count of likes
     */
    static async getLikeCount(movieId) {
        if (!movieId) {
            throw new Error('movieId is required');
        }

        const endpoint = `${API_ENDPOINTS.COUNT}/${movieId}`;
        const response = await api.get(endpoint);
        
        if (!response.ok) {
            let errorMessage = await response.text();
            throw new Error(errorMessage || 'Failed to fetch like count');
        }

        const responseData = await response.json();
        return responseData.count || 0;
    }
}
