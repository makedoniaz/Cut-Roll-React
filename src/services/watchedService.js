import api from './api.js';
import { API_ENDPOINTS } from '../constants/watched.js';

export class WatchedService {
    /**
     * Mark a movie as watched
     * @param {Object} data - The request data
     * @param {string} data.userId - The user ID
     * @param {string} data.movieId - The movie ID (GUID format)
     * @returns {Promise<Object>} The response data
     */
    static async markAsWatched(data) {
        if (!data.userId || !data.movieId) {
            throw new Error('userId and movieId are required');
        }

        const response = await api.post(API_ENDPOINTS.MARK_WATCHED, data);
        
        if (!response.ok) {
            let errorMessage = await response.text();
            throw new Error(errorMessage || 'Failed to mark movie as watched');
        }

        const responseData = await response.json();
        return responseData;
    }

    /**
     * Remove a movie from watched list
     * @param {Object} data - The request data
     * @param {string} data.userId - The user ID
     * @param {string} data.movieId - The movie ID (GUID format)
     * @returns {Promise<Object>} The response data
     */
    static async removeFromWatched(data) {
        if (!data.userId || !data.movieId) {
            throw new Error('userId and movieId are required');
        }

        const response = await api.post(API_ENDPOINTS.REMOVE_WATCHED, data);
        
        if (!response.ok) {
            let errorMessage = await response.text();
            throw new Error(errorMessage || 'Failed to remove movie from watched list');
        }

        const responseData = await response.json();
        return responseData;
    }

    /**
     * Get movies watched by user with pagination
     * @param {Object} data - The request data
     * @param {string} data.userId - The user ID
     * @param {number} data.page - The page number (0-based)
     * @param {number} data.pageSize - The number of items per page
     * @returns {Promise<Object>} The paginated response data
     */
    static async getWatchedByUser(data) {
        if (!data.userId) {
            throw new Error('userId is required');
        }

        const response = await api.post(API_ENDPOINTS.BY_USER, data);
        
        if (!response.ok) {
            let errorMessage = await response.text();
            throw new Error(errorMessage || 'Failed to fetch watched movies');
        }

        const responseData = await response.json();
        return responseData;
    }

    /**
     * Check if a movie is watched by user
     * @param {string} userId - The user ID
     * @param {string} movieId - The movie ID (GUID format)
     * @returns {Promise<boolean>} True if movie is watched
     */
    static async isWatched(userId, movieId) {
        if (!userId || !movieId) {
            throw new Error('userId and movieId are required');
        }

        const endpoint = `${API_ENDPOINTS.IS_WATCHED}?userId=${encodeURIComponent(userId)}&movieId=${encodeURIComponent(movieId)}`;
        const response = await api.get(endpoint);
        
        if (!response.ok) {
            let errorMessage = await response.text();
            throw new Error(errorMessage || 'Failed to check watched status');
        }

        const responseData = await response.json();
        console.log('Raw API response for isWatched:', responseData); // Debug log
        
        // Handle different possible response formats
        if (typeof responseData === 'boolean') {
            return responseData;
        } else if (responseData.isWatched !== undefined) {
            return responseData.isWatched;
        } else if (responseData.status !== undefined) {
            return responseData.status === true || responseData.status === 'true';
        } else if (responseData.result !== undefined) {
            return responseData.result === true || responseData.result === 'true';
        }
        
        // Default fallback
        return false;
    }

    /**
     * Get the count of watched movies for a specific user
     * @param {string} userId - The user ID
     * @returns {Promise<number>} The count of watched movies
     */
    static async getWatchedCount(userId) {
        if (!userId) {
            throw new Error('userId is required');
        }

        const endpoint = `${API_ENDPOINTS.COUNT}/${userId}`;
        const response = await api.get(endpoint);
        
        if (!response.ok) {
            let errorMessage = await response.text();
            throw new Error(errorMessage || 'Failed to fetch watched count');
        }

        const responseData = await response.json();
        return responseData.count || 0;
    }
}
