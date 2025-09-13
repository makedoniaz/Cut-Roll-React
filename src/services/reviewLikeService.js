import api from './api.js';
import { API_ENDPOINTS } from '../constants/reviewLike.js';

export class ReviewLikeService {
    /**
     * Like a review
     * @param {Object} data - The request data
     * @param {string} data.userId - The user ID
     * @param {string} data.reviewId - The review ID (GUID format)
     * @returns {Promise<Object>} The response data
     */
    static async likeReview(data) {
        if (!data.userId || !data.reviewId) {
            throw new Error('userId and reviewId are required');
        }

        const response = await api.post(API_ENDPOINTS.LIKE, data);
        
        if (!response.ok) {
            let errorMessage = await response.text();
            throw new Error(errorMessage || 'Failed to like review');
        }

        const responseData = await response.json();
        return responseData;
    }

    /**
     * Unlike a review
     * @param {Object} data - The request data
     * @param {string} data.userId - The user ID
     * @param {string} data.reviewId - The review ID (GUID format)
     * @returns {Promise<Object>} The response data
     */
    static async unlikeReview(data) {
        if (!data.userId || !data.reviewId) {
            throw new Error('userId and reviewId are required');
        }

        const response = await api.post(API_ENDPOINTS.UNLIKE, data);
        
        if (!response.ok) {
            let errorMessage = await response.text();
            throw new Error(errorMessage || 'Failed to unlike review');
        }

        const responseData = await response.json();
        return responseData;
    }

    /**
     * Check if a review is liked by user
     * @param {string} userId - The user ID
     * @param {string} reviewId - The review ID (GUID format)
     * @returns {Promise<boolean>} True if review is liked, false otherwise
     */
    static async isLiked(userId, reviewId) {
        if (!userId || !reviewId) {
            throw new Error('userId and reviewId are required');
        }

        const endpoint = `${API_ENDPOINTS.IS_LIKED}?userId=${encodeURIComponent(userId)}&reviewId=${encodeURIComponent(reviewId)}`;
        const response = await api.get(endpoint);
        
        if (!response.ok) {
            let errorMessage = await response.text();
            throw new Error(errorMessage || 'Failed to check like status');
        }

        const responseData = await response.json();
        
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
     * Get reviews liked by user with pagination
     * @param {Object} data - The request data
     * @param {string} data.userId - The user ID
     * @param {number} [data.page=1] - The page number (defaults to 1)
     * @param {number} [data.pageSize=10] - The number of items per page (defaults to 10)
     * @returns {Promise<Object>} The paginated response data
     * @returns {Promise<Object>} Returns JSON object with structure:
     * {
     *   "data": [],
     *   "totalCount": 0,
     *   "page": 1,
     *   "pageSize": 10,
     *   "totalPages": 0,
     *   "hasNextPage": false,
     *   "hasPreviousPage": false
     * }
     */
    static async getLikedByUser(data) {
        if (!data.userId) {
            throw new Error('userId is required');
        }

        // Set default values
        const page = data.page !== undefined ? data.page : 1;
        const pageSize = data.pageSize !== undefined ? data.pageSize : 10;

        // Validate page and pageSize
        if (page < 1) {
            throw new Error('Page must be 1 or greater');
        }

        if (pageSize <= 0) {
            throw new Error('Page size must be greater than 0');
        }

        const payload = {
            userId: data.userId,
            page: page,
            pageSize: pageSize
        };

        const response = await api.post(API_ENDPOINTS.LIKED_BY_USER, payload);
        
        if (!response.ok) {
            let errorMessage = await response.text();
            throw new Error(errorMessage || 'Failed to fetch liked reviews');
        }

        const responseData = await response.json();
        return responseData;
    }
}
