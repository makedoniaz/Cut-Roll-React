import api from './api.js';
import { API_ENDPOINTS } from '../constants/recommendations.js';

export class RecommendationsService {
    static async getFriendRecommendations(params = {}) {
        const {
            userId1,
            userId2,
            limit = 10,
            preferredGenres = [],
            minRating = 0,
            minVoteCount = 0,
            minReleaseDate = null,
            maxReleaseDate = null
        } = params;

        // Validate required parameters
        if (!userId1 || !userId2) {
            throw new Error('userId1 and userId2 are required');
        }

        // Validate limit
        if (limit < 0 || limit > 100) {
            throw new Error('limit must be between 0 and 100');
        }

        // Validate rating (allow null)
        if (minRating !== null && (minRating < 0 || minRating > 10)) {
            throw new Error('minRating must be between 0 and 10');
        }

        // Validate vote count (allow null)
        if (minVoteCount !== null && minVoteCount < 0) {
            throw new Error('minVoteCount must be non-negative');
        }

        // Validate date format if provided
        if (minReleaseDate && !this.isValidDate(minReleaseDate)) {
            throw new Error('minReleaseDate must be a valid ISO date string');
        }

        if (maxReleaseDate && !this.isValidDate(maxReleaseDate)) {
            throw new Error('maxReleaseDate must be a valid ISO date string');
        }

        // Validate date range
        if (minReleaseDate && maxReleaseDate && new Date(minReleaseDate) > new Date(maxReleaseDate)) {
            throw new Error('minReleaseDate must be before maxReleaseDate');
        }

        const requestData = {
            userId1,
            userId2,
            limit,
            preferredGenres,
            minRating,
            minVoteCount,
            minReleaseDate,
            maxReleaseDate
        };

        const response = await api.post(API_ENDPOINTS.FRIEND_RECOMMENDATIONS, requestData);
        
        if (!response.ok) {
            let errorMessage = await response.text();
            throw new Error(errorMessage || 'Failed to get friend recommendations');
        }

        const data = await response.json();
        return data;
    }

    static async getUserRecommendations(params = {}) {
        const {
            limit = 10,
            excludeMovieIds = []
        } = params;

        // Validate limit
        if (limit < 0 || limit > 100) {
            throw new Error('limit must be between 0 and 100');
        }

        const requestData = {
            limit,
            excludeMovieIds
        };

        const response = await api.post(API_ENDPOINTS.USER_RECOMMENDATIONS, requestData);
        
        if (!response.ok) {
            let errorMessage = await response.text();
            throw new Error(errorMessage || 'Failed to get user recommendations');
        }

        const data = await response.json();
        return data;
    }

    static isValidDate(dateString) {
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date);
    }
}
