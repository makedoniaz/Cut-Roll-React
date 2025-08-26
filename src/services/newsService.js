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
                    throw new Error('Invalid reference format. Each reference must have referenceType (number), referencedId (string), and optional referenceName (string)');
                }
            }
        }

        // Create FormData for file upload with C# IFormFile
        const formData = new FormData();
        
        // Add text fields
        formData.append('title', newsData.title);
        formData.append('content', newsData.content);
        formData.append('authorId', newsData.authorId);
        
        // Add photo file if provided
        if (newsData.photo && newsData.photo instanceof File) {
            formData.append('photo', newsData.photo);
        }
        
        // Add references as JSON string since FormData doesn't handle complex objects well
        if (newsData.references && Array.isArray(newsData.references)) {
            // Transform references to the new format with capitalized properties and name in ReferenceUrl
            const transformedReferences = newsData.references.map(ref => ({
                ReferenceType: ref.referenceType,
                ReferencedId: ref.referencedId,
                ReferenceUrl: ref.referenceName || null
            }));
            formData.append('referencesJson', JSON.stringify(transformedReferences));
        }

        const response = await api.post(API_ENDPOINTS.CREATE, formData, {
            headers: {
                // Don't set Content-Type header - let the browser set it with boundary for FormData
            }
        });
        
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

    static async filterNews(filterParams = {}) {
        const filterData = {
            query: filterParams.query || null,
            authorId: filterParams.authorId || null,
            from: filterParams.from || null,
            to: filterParams.to || null,
            referenceToSearch: filterParams.referenceToSearch || [],
            page: filterParams.page || 0,
            pageSize: filterParams.pageSize || 10
        };

        // Validate parameters
        if (filterData.page < 0) {
            throw new Error('Page must be 0 or greater');
        }

        if (filterData.pageSize < 1 || filterData.pageSize > 100) {
            throw new Error('Page size must be between 1 and 100');
        }

        // Remove null values to avoid sending them in the request
        Object.keys(filterData).forEach(key => {
            if (filterData[key] === null) {
                delete filterData[key];
            }
        });

        const response = await api.post(API_ENDPOINTS.FILTER, filterData, { skipAuth: true });
        
        if (!response.ok) {
            let errorMessage = await response.text();
            throw new Error(errorMessage || 'News filter failed');
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

    static async getNewsByPagination(page = 0, pageSize = 10) {
        if (page < 0) {
            throw new Error('Page must be 0 or greater');
        }

        if (pageSize < 1 || pageSize > 100) {
            throw new Error('Page size must be between 1 and 100');
        }

        const paginationData = {
            page: page,
            pageSize: pageSize
        };

        const response = await api.post(API_ENDPOINTS.PAGINATION, paginationData, { skipAuth: true });
        
        if (!response.ok) {
            let errorMessage = await response.text();
            throw new Error(errorMessage || 'Failed to fetch news articles');
        }

        const data = await response.json();
        return data;
    }

    static async updateNewsArticle(newsId, newsData) {
        if (!newsId) {
            throw new Error('News ID is required');
        }

        if (!newsData.newTitle && !newsData.newContent) {
            throw new Error('At least one field (newTitle or newContent) must be provided for update');
        }

        const newsPayload = {
            newTitle: newsData.newTitle || null,
            newContent: newsData.newContent || null
        };

        // Remove null values to avoid sending them in the request
        Object.keys(newsPayload).forEach(key => {
            if (newsPayload[key] === null) {
                delete newsPayload[key];
            }
        });

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

        return this.filterNews({
            authorId: userId,
            page: page - 1, // Convert to 0-based indexing for filter API
            pageSize
        });
    }

    static async likeNewsArticle(newsId) {
        if (!newsId) {
            throw new Error('News ID is required');
        }

        // Replace the placeholder with actual newsId
        const endpoint = API_ENDPOINTS.LIKE.replace('{newsId}', newsId);
        console.log(endpoint)
        
        const response = await api.post(endpoint);
        
        if (!response.ok) {
            let errorMessage = await response.text();
            throw new Error(errorMessage || 'Failed to like news article');
        }

        const data = await response.json();
        return data;
    }
}
