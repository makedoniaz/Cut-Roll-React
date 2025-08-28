import api from './api.js';
import { API_ENDPOINTS } from '../constants/lists.js';

export class ListsService {
    /**
     * Create a new list
     * @param {Object} listData - The list data
     * @param {string} listData.userId - The user ID
     * @param {string} listData.title - The list title
     * @param {string} listData.description - The list description
     * @returns {Promise<string>} The created list ID
     */
    static async createList(listData) {
        if (!listData.userId || !listData.title || !listData.description) {
            throw new Error('userId, title, and description are required');
        }

        const response = await api.post(API_ENDPOINTS.CREATE, listData);
        
        if (!response.ok) {
            let errorMessage = await response.text();
            throw new Error(errorMessage || 'Failed to create list');
        }

        const data = await response.json();
        return data.id || data.createdListId || data;
    }

    /**
     * Get a list by ID
     * @param {string} listId - The list ID
     * @returns {Promise<Object>} The list data
     */
    static async getListById(listId) {
        if (!listId) {
            throw new Error('List ID is required');
        }

        const response = await api.get(API_ENDPOINTS.GET_BY_ID + listId);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('List not found');
            }

            let errorMessage = await response.text();
            throw new Error(errorMessage || 'Failed to fetch list');
        }

        const data = await response.json();
        return data;
    }

    /**
     * Update an existing list
     * @param {Object} updateData - The data to update
     * @param {string} updateData.id - The list ID (GUID format)
     * @param {string} updateData.title - The new title
     * @param {string} updateData.description - The new description
     * @returns {Promise<Object>} The updated list data
     */
    static async updateList(updateData) {
        if (!updateData || !updateData.id || !updateData.title || !updateData.description) {
            throw new Error('id, title, and description are required');
        }

        const response = await api.put(API_ENDPOINTS.UPDATE, updateData);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('List not found');
            }

            let errorMessage = await response.text();
            throw new Error(errorMessage || 'Failed to update list');
        }

        const data = await response.json();
        return data;
    }

    /**
     * Delete a list
     * @param {string} listId - The list ID
     * @returns {Promise<boolean>} True if deletion was successful
     */
    static async deleteList(listId) {
        if (!listId) {
            throw new Error('List ID is required');
        }

        const response = await api.delete(API_ENDPOINTS.DELETE + listId);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('List not found');
            }

            let errorMessage = await response.text();
            throw new Error(errorMessage || 'Failed to delete list');
        }

        return true;
    }

    /**
     * Search lists with filters
     * @param {Object} searchParams - Search parameters
     * @param {string} searchParams.userId - User ID to filter by
     * @param {string} [searchParams.title] - Title to search for
     * @param {Date|string} [searchParams.fromDate] - Start date for filtering
     * @param {Date|string} [searchParams.toDate] - End date for filtering
     * @param {number} [searchParams.page] - Page number (0-based)
     * @param {number} [searchParams.pageSize] - Page size
     * @returns {Promise<Object>} Search results with pagination
     */
    static async searchLists(searchParams) {
        if (!searchParams.userId) {
            throw new Error('userId is required');
        }

        const searchData = {
            userId: searchParams.userId,
            title: searchParams.title || null,
            fromDate: searchParams.fromDate || null,
            toDate: searchParams.toDate || null,
            page: searchParams.page || 0,
            pageSize: searchParams.pageSize || 10
        };

        // Validate and format dates if provided
        if (searchData.fromDate) {
            try {
                const fromDate = new Date(searchData.fromDate);
                if (isNaN(fromDate.getTime())) {
                    throw new Error('Invalid fromDate format');
                }
                searchData.fromDate = fromDate.toISOString();
            } catch (error) {
                throw new Error('Invalid fromDate format');
            }
        }

        if (searchData.toDate) {
            try {
                const toDate = new Date(searchData.toDate);
                if (isNaN(toDate.getTime())) {
                    throw new Error('Invalid toDate format');
                }
                searchData.toDate = toDate.toISOString();
            } catch (error) {
                throw new Error('Invalid toDate format');
            }
        }

        const response = await api.post(API_ENDPOINTS.SEARCH, searchData);
        
        if (!response.ok) {
            let errorMessage = await response.text();
            throw new Error(errorMessage || 'Failed to search lists');
        }

        const data = await response.json();
        return data;
    }

    /**
     * Get lists by user with pagination
     * @param {Object} params - Parameters
     * @param {string} params.userId - User ID to get lists for
     * @param {number} [params.page] - Page number (0-based)
     * @param {number} [params.pageSize] - Page size
     * @returns {Promise<Object>} User lists with pagination
     */
    static async getListsByUser(params) {
        if (!params.userId) {
            throw new Error('userId is required');
        }

        const requestData = {
            userId: params.userId,
            page: params.page || 0,
            pageSize: params.pageSize || 10
        };

        const response = await api.post(API_ENDPOINTS.GET_BY_USER, requestData);
        
        if (!response.ok) {
            let errorMessage = await response.text();
            throw new Error(errorMessage || 'Failed to get user lists');
        }

        const data = await response.json();
        return data;
    }
}
