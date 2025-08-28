import api from './api.js';
import { API_ENDPOINTS } from '../constants/watch.js';

export class WatchService {
    /**
     * Add a movie to user's want to watch list
     * @param {Object} data - The request data
     * @param {string} data.userId - The user ID
     * @param {string} data.movieId - The movie ID (GUID format)
     * @returns {Promise<Object>} The response data
     */
    static async addToWantToWatch(data) {
        if (!data.userId || !data.movieId) {
            throw new Error('userId and movieId are required');
        }

        const response = await api.post(API_ENDPOINTS.ADD_TO_WANT_TO_WATCH, data);
        
        if (!response.ok) {
            let errorMessage = await response.text();
            throw new Error(errorMessage || 'Failed to add movie to want to watch list');
        }

        const responseData = await response.json();
        return responseData;
    }

    /**
     * Remove a movie from user's want to watch list
     * @param {Object} data - The request data
     * @param {string} data.userId - The user ID
     * @param {string} data.movieId - The movie ID (GUID format)
     * @returns {Promise<Object>} The response data
     */
    static async removeFromWantToWatch(data) {
        if (!data.userId || !data.movieId) {
            throw new Error('userId and movieId are required');
        }

        const response = await api.post(API_ENDPOINTS.REMOVE_FROM_WANT_TO_WATCH, data);
        
        if (!response.ok) {
            let errorMessage = await response.text();
            throw new Error(errorMessage || 'Failed to remove movie from want to watch list');
        }

        const responseData = await response.json();
        return responseData;
    }

    /**
     * Get user's want to watch movies with pagination
     * @param {Object} data - The request data
     * @param {string} data.userId - The user ID
     * @param {number} data.page - The page number (0-based)
     * @param {number} data.pageSize - The number of items per page
     * @returns {Promise<Object>} The paginated response data
     */
    static async getWantToWatchByUser(data) {
        if (!data.userId) {
            throw new Error('userId is required');
        }

        const response = await api.post(API_ENDPOINTS.GET_WANT_TO_WATCH_BY_USER, data);
        
        if (!response.ok) {
            let errorMessage = await response.text();
            throw new Error(errorMessage || 'Failed to fetch want to watch movies');
        }

        const responseData = await response.json();
        return responseData;
    }

    /**
     * Check if a movie is in user's want to watch list
     * @param {string} userId - The user ID
     * @param {string} movieId - The movie ID (GUID format)
     * @returns {Promise<boolean>} True if movie is in want to watch list
     */
    static async isInWantToWatch(userId, movieId) {
        if (!userId || !movieId) {
            throw new Error('userId and movieId are required');
        }

        const endpoint = `${API_ENDPOINTS.CHECK_IS_IN_WANT_TO_WATCH}?userId=${encodeURIComponent(userId)}&movieId=${encodeURIComponent(movieId)}`;
        const response = await api.get(endpoint);
        
        if (!response.ok) {
            let errorMessage = await response.text();
            throw new Error(errorMessage || 'Failed to check want to watch status');
        }

        const responseData = await response.json();
        console.log('Raw API response for isInWantToWatch:', responseData); // Debug log
        
        // Handle different possible response formats
        if (typeof responseData === 'boolean') {
            return responseData;
        } else if (responseData.isInWantToWatch !== undefined) {
            return responseData.isInWantToWatch;
        } else if (responseData.status !== undefined) {
            return responseData.status === true || responseData.status === 'true';
        } else if (responseData.result !== undefined) {
            return responseData.result === true || responseData.result === 'true';
        }
        
        // Default fallback
        return false;
    }

    /**
     * Get the count of movies in user's want to watch list
     * @param {string} userId - The user ID
     * @returns {Promise<number>} The count of want to watch movies
     */
    static async getWantToWatchCount(userId) {
        if (!userId) {
            throw new Error('userId is required');
        }

        // For external URLs, we need to make a direct fetch since api.js adds base URL
        const url = `${API_ENDPOINTS.GET_WANT_TO_WATCH_COUNT}/${userId}`;
        
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                let errorMessage = await response.text();
                throw new Error(errorMessage || 'Failed to fetch want to watch count');
            }

            const responseData = await response.json();
            return responseData.count || 0;
        } catch (error) {
            console.error('Failed to fetch want to watch count:', error);
            throw error;
        }
    }
}
