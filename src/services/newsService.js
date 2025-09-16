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

        // Validate and format dates if provided
        if (filterData.from) {
            try {
                // Ensure the date is in ISO format and convert to UTC
                const fromDate = new Date(filterData.from);
                if (isNaN(fromDate.getTime())) {
                    throw new Error('Invalid from date format');
                }
                filterData.from = fromDate.toISOString();
            } catch (error) {
                throw new Error('Invalid from date format. Please use YYYY-MM-DD format.');
            }
        }

        if (filterData.to) {
            try {
                // Ensure the date is in ISO format and convert to UTC
                const toDate = new Date(filterData.to);
                if (isNaN(toDate.getTime())) {
                    throw new Error('Invalid to date format');
                }
                filterData.to = toDate.toISOString();
            } catch (error) {
                throw new Error('Invalid to date format. Please use YYYY-MM-DD format.');
            }
        }

        // Validate that from date is before to date if both are provided
        if (filterData.from && filterData.to) {
            const fromDate = new Date(filterData.from);
            const toDate = new Date(filterData.to);
            if (fromDate >= toDate) {
                throw new Error('From date must be before to date');
            }
        }

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

    static async getIsLikedArticle(newsId) {
        if (!newsId) {
            throw new Error('News ID is required');
        }

        // Replace the placeholder with actual newsId
        const endpoint = API_ENDPOINTS.LIKE.replace('{newsId}', newsId);
        console.log('Checking if article is liked:', endpoint);
        
        const response = await api.get(endpoint);
        
        if (!response.ok) {
            let errorMessage = await response.text();
            throw new Error(errorMessage || 'Failed to check if article is liked');
        }

        // The endpoint returns true/false directly, not in JSON format
        const isLiked = await response.text();
        return isLiked === 'true';
    }

    static async searchMovieReference(searchParams = {}) {
        const searchData = {
            page: searchParams.page || 1,
            pageSize: searchParams.pageSize || 10,
            sortDescending: searchParams.sortDescending !== undefined ? searchParams.sortDescending : true,
            title: searchParams.title || null,
            genres: searchParams.genres || null,
            actor: searchParams.actor || null,
            director: searchParams.director || null,
            keywords: searchParams.keyword || null,
            year: searchParams.year || null,
            minRating: searchParams.minRating || null,
            maxRating: searchParams.maxRating || null,
            country: searchParams.country || null,
            language: searchParams.language || null,
            productionCompany: searchParams.productionCompany || null,
            sortBy: searchParams.sortBy || null
        };

        // Validation parameters
        if (searchData.year && (searchData.year < 1950 || searchData.year > 2025)) {
            throw new Error('Year must be between 1950 and 2025');
        }
        
        if (searchData.minRating && (searchData.minRating < 0 || searchData.minRating > 10)) {
            throw new Error('minRating must be between 0 and 5');
        }
        
        if (searchData.maxRating && (searchData.maxRating < 0 || searchData.maxRating > 10)) {
            throw new Error('maxRating must be between 0 and 5');
        }

        if (searchData.sortBy && !['title', 'rating', 'releasedate', 'revenue'].includes(searchData.sortBy)) {
            throw new Error('sortBy must be one of: title, rating, releasedate, revenue');
        }

        const response = await api.post(API_ENDPOINTS.REFERENCE_MOVIE, searchData, { skipAuth: true });
        
        if (!response.ok) {
            let errorMessage = await response.text();
            throw new Error(errorMessage || 'Movie search failed');
        }

        const data = await response.json();
        return data;
    }

    static async searchPersonReference(searchParams = {}) {
        const { name, role, pageNumber, pageSize } = searchParams;
        
        const requestBody = {
            name: name || '',
            role: role !== undefined ? role : 0, // Default to cast (0) if not specified
            pageNumber: pageNumber || 0,
            pageSize: pageSize || 20
        };

        const response = await api.post(API_ENDPOINTS.REFERENCE_PERSON, requestBody);
        
        if (!response.ok) {
            let errorMessage = await response.text();
            throw new Error(errorMessage || 'Person search failed');
        }

        const data = await response.json();
        return data;
    }

    static async searchGenreReference(searchParams = {}) {
        const { name, pageNumber, pageSize } = searchParams;
        
        const requestBody = {
            name: name || '',
            pageNumber: pageNumber || 0,
            pageSize: pageSize || 20
        };

        const response = await api.post(API_ENDPOINTS.REFERENCE_GENRE, requestBody);
        
        if (!response.ok) {
            let errorMessage = await response.text();
            throw new Error(errorMessage || 'Genre search failed');
        }

        const data = await response.json();
        return data;
    }

    static async searchProductionCompanyReference(searchParams = {}) {
        const { name, countryCode, pageNumber, pageSize } = searchParams;
        
        const requestBody = {
            name: name || '',
            countryCode: null, // Always set to null for name-only search
            pageNumber: pageNumber || 1,
            pageSize: pageSize || 20
        };

        const response = await api.post(API_ENDPOINTS.REFERENCE_PRODUCTION_COMPANY, requestBody);
        
        if (!response.ok) {
            let errorMessage = await response.text();
            throw new Error(errorMessage || 'Production company search failed');
        }

        const data = await response.json();
        return data;
    }

    static async searchKeywordReference(searchParams = {}) {
        const { name, pageNumber, pageSize } = searchParams;
        
        const requestBody = {
            name: name || '',
            pageNumber: pageNumber || 0,
            pageSize: pageSize || 20
        };

        const response = await api.post(API_ENDPOINTS.REFERENCE_KEYWORD, requestBody);
        
        if (!response.ok) {
            let errorMessage = await response.text();
            throw new Error(errorMessage || 'Keyword search failed');
        }

        const data = await response.json();
        return data;
    }

    static async getLikedNews(page = 1, pageSize = 10) {
        if (page < 1) {
            throw new Error('Page must be 1 or greater');
        }

        if (pageSize < 1 || pageSize > 100) {
            throw new Error('Page size must be between 1 and 100');
        }

        const paginationData = {
            page: page - 1, // Convert to 0-based indexing
            pageSize: pageSize
        };

        const response = await api.post(API_ENDPOINTS.LIKED_NEWS, paginationData);
        
        if (!response.ok) {
            let errorMessage = await response.text();
            throw new Error(errorMessage || 'Failed to fetch liked news articles');
        }

        const data = await response.json();
        return data;
    }

    static async updateArticlePhoto(newsId, photoFile) {
        if (!newsId) {
            throw new Error('News ID is required');
        }

        if (!photoFile || !(photoFile instanceof File)) {
            throw new Error('Photo file is required');
        }

        // Validate file type (only JPG and PNG)
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedTypes.includes(photoFile.type)) {
            throw new Error('Please select a JPG or PNG image file');
        }

        // Validate file size (max 5MB)
        if (photoFile.size > 5 * 1024 * 1024) {
            throw new Error('File size must be less than 5MB');
        }

        // Create FormData for file upload
        const formData = new FormData();
        formData.append('photo', photoFile);

        const response = await api.patch(`news/news/${newsId}/photo`, formData, {
            headers: {
                // Don't set Content-Type header - let the browser set it with boundary for FormData
            }
        });
        
        if (!response.ok) {
            let errorMessage = await response.text();
            throw new Error(errorMessage || 'Failed to update article photo');
        }

        const data = await response.json();
        return data;
    }
}
