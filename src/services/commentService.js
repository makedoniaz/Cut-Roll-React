import api from './api.js';
import { API_ENDPOINTS } from '../constants/comment.js';

export class CommentService {
    /**
     * Create a new comment
     * @param {Object} commentData - Comment data
     * @param {string} commentData.userId - User ID
     * @param {string} commentData.reviewId - Review ID (UUID)
     * @param {string} commentData.content - Comment content
     * @returns {Promise<Object>} Created comment
     */
    static async createComment(commentData) {
        if (!commentData.userId || !commentData.reviewId || !commentData.content) {
            throw new Error('userId, reviewId, and content are required');
        }

        const payload = {
            userId: commentData.userId,
            reviewId: commentData.reviewId,
            content: commentData.content
        };

        const response = await api.post(API_ENDPOINTS.CREATE, payload);
        
        if (!response.ok) {
            let errorMessage = await response.text();
            throw new Error(errorMessage || 'Failed to create comment');
        }

        const data = await response.json();
        return data;
    }

    /**
     * Update an existing comment
     * @param {Object} commentData - Comment data
     * @param {string} commentData.userId - User ID
     * @param {string} commentData.reviewId - Review ID (UUID)
     * @param {string} commentData.content - Comment content
     * @returns {Promise<Object>} Updated comment
     */
    static async updateComment(commentData) {
        if (!commentData.userId || !commentData.reviewId || !commentData.content) {
            throw new Error('userId, reviewId, and content are required');
        }

        const payload = {
            userId: commentData.userId,
            reviewId: commentData.reviewId,
            content: commentData.content
        };

        const response = await api.put(API_ENDPOINTS.UPDATE, payload);
        
        if (!response.ok) {
            let errorMessage = await response.text();
            throw new Error(errorMessage || 'Failed to update comment');
        }

        const data = await response.json();
        return data;
    }

    /**
     * Delete a comment by review ID
     * @param {string} reviewId - Review ID (UUID)
     * @returns {Promise<boolean>} Success status
     */
    static async deleteComment(reviewId) {
        if (!reviewId) {
            throw new Error('Review ID is required');
        }

        const response = await api.delete(API_ENDPOINTS.DELETE + reviewId);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Comment not found');
            }
            let errorMessage = await response.text();
            throw new Error(errorMessage || 'Failed to delete comment');
        }

        return true;
    }

    /**
     * Get comments by review ID with pagination
     * @param {Object} params - Search parameters
     * @param {string} params.reviewId - Review ID (UUID)
     * @param {number} [params.page=1] - Page number (defaults to 1)
     * @param {number} [params.pageSize=10] - Page size (defaults to 10)
     * @returns {Promise<Object>} Paginated comments data
     */
    static async getCommentsByReview(params) {
        if (!params.reviewId) {
            throw new Error('reviewId is required');
        }

        // Set default values
        const page = params.page !== undefined ? params.page : 1;
        const pageSize = params.pageSize !== undefined ? params.pageSize : 10;

        // Validate page and pageSize
        if (page < 1) {
            throw new Error('Page must be 1 or greater');
        }

        if (pageSize <= 0) {
            throw new Error('Page size must be greater than 0');
        }

        const payload = {
            reviewId: params.reviewId,
            page: page,
            pageSize: pageSize
        };

        const response = await api.post(API_ENDPOINTS.GET_BY_REVIEW, payload);
        
        if (!response.ok) {
            let errorMessage = await response.text();
            throw new Error(errorMessage || 'Failed to fetch comments by review');
        }

        const data = await response.json();
        return data;
    }

    /**
     * Get comments by user ID with pagination
     * @param {Object} params - Search parameters
     * @param {string} params.userId - User ID
     * @param {number} [params.page=1] - Page number (defaults to 1)
     * @param {number} [params.pageSize=10] - Page size (defaults to 10)
     * @returns {Promise<Object>} Paginated comments data
     */
    static async getCommentsByUser(params) {
        if (!params.userId) {
            throw new Error('userId is required');
        }

        // Set default values
        const page = params.page !== undefined ? params.page : 1;
        const pageSize = params.pageSize !== undefined ? params.pageSize : 10;

        // Validate page and pageSize
        if (page < 1) {
            throw new Error('Page must be 1 or greater');
        }

        if (pageSize <= 0) {
            throw new Error('Page size must be greater than 0');
        }

        const payload = {
            userId: params.userId,
            page: page,
            pageSize: pageSize
        };

        const response = await api.post(API_ENDPOINTS.GET_BY_USER, payload);
        
        if (!response.ok) {
            let errorMessage = await response.text();
            throw new Error(errorMessage || 'Failed to fetch comments by user');
        }

        const data = await response.json();
        return data;
    }
}
