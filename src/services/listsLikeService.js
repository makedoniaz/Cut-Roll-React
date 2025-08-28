import api from './api.js';
import { API_ENDPOINTS } from '../constants/listsLike.js';

export class ListsLikeService {
    /**
     * Like a list
     * @param {Object} likeData - The like data
     * @param {string} likeData.userId - The user ID
     * @param {string} likeData.listId - The list ID (GUID format)
     * @returns {Promise<boolean>} True if like was successful
     */
    static async likeList(likeData) {
        if (!likeData.userId || !likeData.listId) {
            throw new Error('userId and listId are required');
        }

        const response = await api.post(API_ENDPOINTS.LIKE, likeData);
        
        if (!response.ok) {
            let errorMessage = await response.text();
            throw new Error(errorMessage || 'Failed to like list');
        }

        return true;
    }

    /**
     * Unlike a list
     * @param {Object} unlikeData - The unlike data
     * @param {string} unlikeData.userId - The user ID
     * @param {string} unlikeData.listId - The list ID (GUID format)
     * @returns {Promise<boolean>} True if unlike was successful
     */
    static async unlikeList(unlikeData) {
        if (!unlikeData.userId || !unlikeData.listId) {
            throw new Error('userId and listId are required');
        }

        const response = await api.post(API_ENDPOINTS.UNLIKE, unlikeData);
        
        if (!response.ok) {
            let errorMessage = await response.text();
            throw new Error(errorMessage || 'Failed to unlike list');
        }

        return true;
    }

    /**
     * Check if a list is liked by a user
     * @param {string} userId - The user ID
     * @param {string} listId - The list ID (GUID format)
     * @returns {Promise<boolean>} True if the list is liked by the user
     */
    static async isListLiked(userId, listId) {
        if (!userId || !listId) {
            throw new Error('userId and listId are required');
        }

        const queryParams = new URLSearchParams({
            userId: userId,
            listId: listId
        });

        const response = await api.get(`${API_ENDPOINTS.IS_LIKED}?${queryParams}`);
        
        if (!response.ok) {
            let errorMessage = await response.text();
            throw new Error(errorMessage || 'Failed to check if list is liked');
        }

        const isLiked = await response.json();
        return isLiked;
    }

    /**
     * Get the like count for a list
     * @param {string} listId - The list ID (GUID format)
     * @returns {Promise<number>} The number of likes for the list
     */
    static async getListLikeCount(listId) {
        if (!listId) {
            throw new Error('listId is required');
        }

        const response = await api.get(API_ENDPOINTS.COUNT + listId);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('List not found');
            }

            let errorMessage = await response.text();
            throw new Error(errorMessage || 'Failed to get list like count');
        }

        const count = await response.json();
        return count;
    }
}
