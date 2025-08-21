import api from './api.js';
import { API_ENDPOINTS, REFERENCE_TYPES } from '../constants/news.js';

export class NewsService {
    static async createNewsArticle(newsData) {
        if (!newsData.title || !newsData.content || !newsData.authorId) {
            throw new Error('Title, content, and authorId are required');
        }

        // Validate references if provided
        if (newsData.references && Array.isArray(newsData.references)) {
            for (const reference of newsData.references) {
                if (typeof reference.referenceType !== 'number' || 
                    !reference.referencedId || 
                    typeof reference.referencedId !== 'string') {
                    throw new Error('Invalid reference format. Each reference must have referenceType (number), referencedId (string), and optional referenceUrl (string)');
                }
            }
        }

        const newsPayload = {
            title: newsData.title,
            content: newsData.content,
            authorId: newsData.authorId,
            references: newsData.references || []
        };

        const response = await api.post(API_ENDPOINTS.CREATE, newsPayload);
        
        if (!response.ok) {
            let errorMessage = await response.text();
            throw new Error(errorMessage || 'Failed to create news article');
        }

        const createdNewsId = await response.text();
        return createdNewsId;
    }

    static async getNewsById(newsId) {
        if (!newsId) {
            throw new Error('News ID is required');
        }

        const response = await api.get(API_ENDPOINTS.BASE + newsId, { skipAuth: true });
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('News article not found');
            }

            let errorMessage = await response.text();
            throw new Error(errorMessage || 'Failed to fetch news article');
        }

        const data = await response.json();
        return data;
    }

    static async searchNews(searchParams = {}) {
        const searchData = {
            page: searchParams.page || 1,
            pageSize: searchParams.pageSize || 10,
            sortDescending: searchParams.sortDescending !== undefined ? searchParams.sortDescending : true,
            title: searchParams.title || null,
            authorId: searchParams.authorId || null,
            keyword: searchParams.keyword || null,
            sortBy: searchParams.sortBy || null
        };

        // Validate parameters
        if (searchData.page < 1) {
            throw new Error('Page must be greater than 0');
        }

        if (searchData.pageSize < 1 || searchData.pageSize > 100) {
            throw new Error('Page size must be between 1 and 100');
        }

        if (searchData.sortBy && !['title', 'createdAt', 'updatedAt'].includes(searchData.sortBy)) {
            throw new Error('sortBy must be one of: title, createdAt, updatedAt');
        }

        const response = await api.post(API_ENDPOINTS.SEARCH, searchData, { skipAuth: true });
        
        if (!response.ok) {
            let errorMessage = await response.text();
            throw new Error(errorMessage || 'News search failed');
        }

        const data = await response.json();
        return data;
    }

    static async getNewsCount() {
        const response = await api.get(API_ENDPOINTS.COUNT, { skipAuth: true });
        
        if (!response.ok) {
            let errorMessage = await response.text();
            throw new Error(errorMessage || 'Failed to fetch news count');
        }

        const count = await response.text();
        return parseInt(count, 10);
    }

    static async updateNewsArticle(newsId, newsData) {
        if (!newsId) {
            throw new Error('News ID is required');
        }

        if (!newsData.title && !newsData.content && !newsData.references) {
            throw new Error('At least one field (title, content, or references) must be provided for update');
        }

        const newsPayload = {
            id: newsId,
            title: newsData.title || null,
            content: newsData.content || null,
            references: newsData.references || null
        };

        const response = await api.put(API_ENDPOINTS.BASE + newsId, newsPayload);
        
        if (!response.ok) {
            let errorMessage = await response.text();
            throw new Error(errorMessage || 'Failed to update news article');
        }

        const updatedNewsId = await response.text();
        return updatedNewsId;
    }

    static async deleteNewsArticle(newsId) {
        if (!newsId) {
            throw new Error('News ID is required');
        }

        const response = await api.delete(API_ENDPOINTS.BASE + newsId);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('News article not found');
            }

            let errorMessage = await response.text();
            throw new Error(errorMessage || 'Failed to delete news article');
        }

        const deletedNewsId = await response.text();
        return deletedNewsId;
    }

    static async getUserNews(userId, page = 1, pageSize = 10) {
        if (!userId) {
            throw new Error('User ID is required');
        }

        return this.searchNews({
            authorId: userId,
            page,
            pageSize,
            sortBy: 'createdAt',
            sortDescending: true
        });
    }
}
