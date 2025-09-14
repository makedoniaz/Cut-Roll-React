import api from './api.js';
import { API_ENDPOINTS, FollowType, ActivityType } from '../constants/follow.js';

export class FollowService {
    /**
     * Follow a user
     * @param {string} followerId - ID of the user who is following
     * @param {string} followingId - ID of the user being followed
     * @returns {Promise<Object>} Follow result
     */
    static async follow(followerId, followingId) {
        if (!followerId || !followingId) {
            throw new Error('Follower ID and Following ID are required');
        }

        const followData = {
            followerId,
            followingId
        };

        const response = await api.post(API_ENDPOINTS.FOLLOW, followData);
        
        if (!response.ok) {
            let errorMessage = await response.text();
            throw new Error(errorMessage || 'Failed to follow user');
        }

        return await response.json();
    }

    /**
     * Unfollow a user
     * @param {string} followerId - ID of the user who is unfollowing
     * @param {string} followingId - ID of the user being unfollowed
     * @returns {Promise<Object>} Unfollow result
     */
    static async unfollow(followerId, followingId) {
        if (!followerId || !followingId) {
            throw new Error('Follower ID and Following ID are required');
        }

        const unfollowData = {
            followerId,
            followingId
        };

        const response = await api.delete(API_ENDPOINTS.UNFOLLOW, unfollowData);
        
        if (!response.ok) {
            let errorMessage = await response.text();
            throw new Error(errorMessage || 'Failed to unfollow user');
        }

        return await response.json();
    }

    /**
     * Get followers or following list by user
     * @param {string} userId - User ID
     * @param {number} page - Page number
     * @param {number} pageSize - Page size
     * @param {FollowType} type - Follow type (Followers or Following)
     * @returns {Promise<Object>} Followers or following list
     */
    static async getFollowByUser(userId, page = 0, pageSize = 10, type = FollowType.FOLLOWERS) {
        if (!userId) {
            throw new Error('User ID is required');
        }

        const requestData = {
            userId,
            page,
            pageSize,
            type
        };

        const response = await api.post(API_ENDPOINTS.FOLLOW_BY_USER, requestData);
        
        if (!response.ok) {
            let errorMessage = await response.text();
            throw new Error(errorMessage || 'Failed to get follow data by user');
        }

        return await response.json();
    }

    /**
     * Get followers count for a user
     * @param {string|number} userId - User ID
     * @returns {Promise<number>} Followers count
     */
    static async getFollowersCount(userId) {
        if (!userId) {
            throw new Error('User ID is required');
        }

        const endpoint = API_ENDPOINTS.FOLLOWERS_COUNT.replace('{userId}', userId);
        const response = await api.get(endpoint);
        
        if (!response.ok) {
            let errorMessage = await response.text();
            throw new Error(errorMessage || 'Failed to fetch followers count');
        }

        const count = await response.text();
        return parseInt(count, 10);
    }

    /**
     * Get following count for a user
     * @param {string|number} userId - User ID
     * @returns {Promise<number>} Following count
     */
    static async getFollowingCount(userId) {
        if (!userId) {
            throw new Error('User ID is required');
        }

        const endpoint = API_ENDPOINTS.FOLLOWING_COUNT.replace('{userId}', userId);
        const response = await api.get(endpoint);
        
        if (!response.ok) {
            let errorMessage = await response.text();
            throw new Error(errorMessage || 'Failed to fetch following count');
        }

        const count = await response.text();
        return parseInt(count, 10);
    }

    /**
     * Get follow status between users
     * @param {string} userId - Current user ID
     * @param {string} targetUserId - Target user ID
     * @returns {Promise<Object>} Follow status
     */
    static async getFollowStatus(userId, targetUserId) {
        if (!userId || !targetUserId) {
            throw new Error('User ID and Target User ID are required');
        }

        const params = new URLSearchParams({
            userId,
            targetUserId
        });

        const response = await api.get(`${API_ENDPOINTS.STATUS}?${params}`);
        
        if (!response.ok) {
            let errorMessage = await response.text();
            throw new Error(errorMessage || 'Failed to fetch follow status');
        }

        return await response.json();
    }

    /**
     * Check if one user is following another
     * @param {string} followerId - ID of the follower
     * @param {string} followingId - ID of the user being followed
     * @returns {Promise<boolean>} True if following
     */
    static async isFollowing(followerId, followingId) {
        if (!followerId || !followingId) {
            throw new Error('Follower ID and Following ID are required');
        }

        const params = new URLSearchParams({
            followerId,
            followingId
        });

        const response = await api.get(`${API_ENDPOINTS.IS_FOLLOWING}?${params}`);
        
        if (!response.ok) {
            let errorMessage = await response.text();
            throw new Error(errorMessage || 'Failed to check follow status');
        }

        const result = await response.text();
        return result.toLowerCase() === 'true';
    }

    /**
     * Get follow feed for a user
     * @param {string} userId - User ID
     * @param {number} page - Page number
     * @param {number} pageSize - Page size
     * @param {ActivityType} filterByType - Activity type filter
     * @param {string} fromDate - From date (ISO string)
     * @returns {Promise<Object>} Follow feed data
     */
    static async getFollowFeed(userId, page = 0, pageSize = 10, filterByType = null, fromDate = null) {
        if (!userId) {
            throw new Error('User ID is required');
        }

        const feedData = {
            userId,
            page,
            pageSize,
            filterByType: filterByType !== null ? filterByType : 0,
            fromDate: fromDate || new Date().toISOString()
        };

        const response = await api.post(API_ENDPOINTS.FEED, feedData);
        
        if (!response.ok) {
            let errorMessage = await response.text();
            throw new Error(errorMessage || 'Failed to fetch follow feed');
        }

        return await response.json();
    }
}
