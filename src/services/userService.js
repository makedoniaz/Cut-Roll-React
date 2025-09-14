import api from './api.js';
import { API_ENDPOINTS } from '../constants/user.js';

export class UserService {
    /**
     * Get user by ID
     * @param {string|number} id - User ID
     * @returns {Promise<Object>} User data
     */
    static async getUserById(id) {
        if (!id) {
            throw new Error('User ID is required');
        }

        const endpoint = API_ENDPOINTS.GET_BY_ID.replace('{id}', id);
        const response = await api.get(endpoint);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('User not found');
            }
            let errorMessage = await response.text();
            throw new Error(errorMessage || 'Failed to fetch user');
        }

        return await response.json();
    }

    /**
     * Get user by username
     * @param {string} username - Username
     * @returns {Promise<Object>} User data
     */
    static async getUserByUsername(username) {
        if (!username) {
            throw new Error('Username is required');
        }

        const endpoint = API_ENDPOINTS.GET_BY_USERNAME.replace('{username}', username);
        const response = await api.get(endpoint);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('User not found');
            }
            let errorMessage = await response.text();
            throw new Error(errorMessage || 'Failed to fetch user by username');
        }

        return await response.json();
    }

    /**
     * Get user by email
     * @param {string} email - Email address
     * @returns {Promise<Object>} User data
     */
    static async getUserByEmail(email) {
        if (!email) {
            throw new Error('Email is required');
        }

        const endpoint = API_ENDPOINTS.GET_BY_EMAIL.replace('{email}', email);
        const response = await api.get(endpoint);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('User not found');
            }
            let errorMessage = await response.text();
            throw new Error(errorMessage || 'Failed to fetch user by email');
        }

        return await response.json();
    }

    /**
     * Search users
     * @param {Object} searchParams - Search parameters
     * @param {string} [searchParams.searchTerm] - Search term
     * @param {boolean} [searchParams.isBanned] - Filter by banned status
     * @param {boolean} [searchParams.isMuted] - Filter by muted status
     * @param {number} [searchParams.pageNumber=1] - Page number
     * @param {number} [searchParams.pageSize=10] - Page size
     * @returns {Promise<Object>} Search results
     */
    static async searchUsers(searchParams = {}) {
        const searchData = {
            searchTerm: searchParams.searchTerm || null,
            isBanned: searchParams.isBanned || null,
            isMuted: searchParams.isMuted || null,
            pageNumber: searchParams.pageNumber || 1,
            pageSize: searchParams.pageSize || 10
        };

        const response = await api.post(API_ENDPOINTS.SEARCH, searchData);
        
        if (!response.ok) {
            let errorMessage = await response.text();
            throw new Error(errorMessage || 'User search failed');
        }

        return await response.json();
    }

    /**
     * Check if username exists
     * @param {string} username - Username to check
     * @returns {Promise<boolean>} True if username exists
     */
    static async checkUsernameExists(username) {
        if (!username) {
            throw new Error('Username is required');
        }

        const endpoint = API_ENDPOINTS.EXISTS_USERNAME.replace('{username}', username);
        const response = await api.get(endpoint);
        
        if (!response.ok) {
            let errorMessage = await response.text();
            throw new Error(errorMessage || 'Failed to check username existence');
        }

        const result = await response.text();
        return result.toLowerCase() === 'true';
    }

    /**
     * Check if email exists
     * @param {string} email - Email to check
     * @returns {Promise<boolean>} True if email exists
     */
    static async checkEmailExists(email) {
        if (!email) {
            throw new Error('Email is required');
        }

        const endpoint = API_ENDPOINTS.EXISTS_EMAIL.replace('{email}', email);
        const response = await api.get(endpoint);
        
        if (!response.ok) {
            let errorMessage = await response.text();
            throw new Error(errorMessage || 'Failed to check email existence');
        }

        const result = await response.text();
        return result.toLowerCase() === 'true';
    }

    /**
     * Get review count for user
     * @param {string|number} userId - User ID
     * @returns {Promise<number>} Review count
     */
    static async getUserReviewCount(userId) {
        if (!userId) {
            throw new Error('User ID is required');
        }

        const endpoint = API_ENDPOINTS.REVIEW_COUNT.replace('{userId}', userId);
        const response = await api.get(endpoint);
        
        if (!response.ok) {
            let errorMessage = await response.text();
            throw new Error(errorMessage || 'Failed to fetch user review count');
        }

        const count = await response.text();
        return parseInt(count, 10);
    }

    /**
     * Get watched count for user
     * @param {string|number} userId - User ID
     * @returns {Promise<number>} Watched count
     */
    static async getUserWatchedCount(userId) {
        if (!userId) {
            throw new Error('User ID is required');
        }

        const endpoint = API_ENDPOINTS.WATCHED_COUNT.replace('{userId}', userId);
        const response = await api.get(endpoint);
        
        if (!response.ok) {
            let errorMessage = await response.text();
            throw new Error(errorMessage || 'Failed to fetch user watched count');
        }

        const count = await response.text();
        return parseInt(count, 10);
    }

    /**
     * Get movie like count for user
     * @param {string|number} userId - User ID
     * @returns {Promise<number>} Movie like count
     */
    static async getUserMovieLikeCount(userId) {
        if (!userId) {
            throw new Error('User ID is required');
        }

        const endpoint = API_ENDPOINTS.MOVIE_LIKE_COUNT.replace('{userId}', userId);
        const response = await api.get(endpoint);
        
        if (!response.ok) {
            let errorMessage = await response.text();
            throw new Error(errorMessage || 'Failed to fetch user movie like count');
        }

        const count = await response.text();
        return parseInt(count, 10);
    }

    /**
     * Get want to watch count for user
     * @param {string|number} userId - User ID
     * @returns {Promise<number>} Want to watch count
     */
    static async getUserWantToWatchCount(userId) {
        if (!userId) {
            throw new Error('User ID is required');
        }

        const endpoint = API_ENDPOINTS.WANT_TO_WATCH_COUNT.replace('{userId}', userId);
        const response = await api.get(endpoint);
        
        if (!response.ok) {
            let errorMessage = await response.text();
            throw new Error(errorMessage || 'Failed to fetch user want to watch count');
        }

        const count = await response.text();
        return parseInt(count, 10);
    }

    /**
     * Get list count for user
     * @param {string|number} userId - User ID
     * @returns {Promise<number>} List count
     */
    static async getUserListCount(userId) {
        if (!userId) {
            throw new Error('User ID is required');
        }

        const endpoint = API_ENDPOINTS.LIST_COUNT.replace('{userId}', userId);
        const response = await api.get(endpoint);
        
        if (!response.ok) {
            let errorMessage = await response.text();
            throw new Error(errorMessage || 'Failed to fetch user list count');
        }

        const count = await response.text();
        return parseInt(count, 10);
    }

    /**
     * Get average rating for user
     * @param {string|number} userId - User ID
     * @returns {Promise<number>} Average rating
     */
    static async getUserAverageRating(userId) {
        if (!userId) {
            throw new Error('User ID is required');
        }

        const endpoint = API_ENDPOINTS.AVERAGE_RATING.replace('{userId}', userId);
        const response = await api.get(endpoint);
        
        if (!response.ok) {
            let errorMessage = await response.text();
            throw new Error(errorMessage || 'Failed to fetch user average rating');
        }

        const rating = await response.text();
        return parseFloat(rating);
    }
}
