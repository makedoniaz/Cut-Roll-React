
import api from './api.js';
import { API_ENDPOINTS } from '../constants/movies.js';
import { API_CONFIG } from '../constants/index.js';

export class MovieService {
    static async searchMovies(searchParams = {}) {
        const searchData = {
            page: searchParams.page || 1,
            pageSize: searchParams.pageSize || 10,
            sortDescending: searchParams.sortDescending !== undefined ? searchParams.sortDescending : true,
            title: searchParams.title || null,
            genres: searchParams.genres || null,
            actor: searchParams.actor || null,
            director: searchParams.director || null,
            keywords: searchParams.keyword || null,
            minYear: searchParams.minYear || 1950,
            maxYear: searchParams.maxYear || 2025,
            minRating: searchParams.minRating || null,
            maxRating: searchParams.maxRating || null,
            country: searchParams.country || null,
            language: searchParams.language || null,
            productionCompany: searchParams.productionCompany || null,
            sortBy: searchParams.sortBy || null
        };
        

        // Валидация параметров
        if (searchData.minYear && (searchData.minYear < 1950 || searchData.minYear > 2025)) {
            throw new Error('minYear must be between 1950 and 2025');
        }
        
        if (searchData.maxYear && (searchData.maxYear < 1950 || searchData.maxYear > 2025)) {
            throw new Error('maxYear must be between 1950 and 2025');
        }
        
        if (searchData.minYear && searchData.maxYear && searchData.minYear > searchData.maxYear) {
            throw new Error('minYear cannot be greater than maxYear');
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

        const response = await api.post(API_ENDPOINTS.SEARCH, searchData, { skipAuth: true });
        
        if (!response.ok) {
            let errorMessage = await response.text();
            throw new Error(errorMessage || 'Movie search failed');
        }

        const data = await response.json();
        return data;
    }

    static async getMovieById(movieId) {
        if (!movieId)
            throw new Error('Movie ID is required');

        const response = await api.get(API_ENDPOINTS.BASE + movieId, { skipAuth: true });
        
        if (!response.ok) {
            if (response.status === 404)
                throw new Error('Movie not found');

            let errorMessage = await response.text();
            throw new Error(errorMessage || 'Failed to fetch movie details');
        }

        const data = await response.json();
        return data;
    }

    static async getMoviesCount() {
        const response = await api.get(API_ENDPOINTS.COUNT, { skipAuth: true });
        
        if (!response.ok) {
            let errorMessage = await response.text();
            throw new Error(errorMessage || 'Failed to fetch movies count');
        }

        const count = await response.text();
        return parseInt(count, 10);
    }

    static async updateMovie(movieData) {
        if (!movieData.id)
            throw new Error('Movie ID is required');

        // Формируем объект с данными фильма, все поля кроме id могут быть null
        const moviePayload = {
            id: movieData.id,
            title: movieData.title || null,
            tagline: movieData.tagline || null,
            overview: movieData.overview || null,
            releaseDate: movieData.releaseDate || null,
            runtime: movieData.runtime || null,
            budget: movieData.budget || null,
            revenue: movieData.revenue || null,
            homepage: movieData.homepage || null,
            imdbId: movieData.imdbId || null
        };

        const response = await api.post(API_ENDPOINTS.BASE, moviePayload);
        
        if (!response.ok) {
            let errorMessage = await response.text();
            throw new Error(errorMessage || 'Failed to update movie data');
        }

        const updatedMovieId = await response.text();
        return parseInt(updatedMovieId, 10);
    }

    static async deleteMovie(movieId) {
        if (!movieId) {
            throw new Error('Movie ID is required');
        }

        const response = await api.delete(API_ENDPOINTS.BASE + movieId);
        
        if (!response.ok) {
            if (response.status === 404)
                throw new Error('Movie not found');

            let errorMessage = await response.text();
            throw new Error(errorMessage || 'Failed to delete movie');
        }

        const deletedMovieId = await response.text();
        return parseInt(deletedMovieId, 10);
    }

    static async searchMoviesByTitle(query, limit = 8) {
        if (!query || !query.trim()) {
            return [];
        }

        try {
            // Use the existing searchMovies method with minimal parameters for title search
            const searchParams = {
                page: 1,
                pageSize: limit,
                title: query.trim(),
                sortBy: 'title',
                sortDescending: false
            };

            const response = await this.searchMovies(searchParams);
            
            if (response && response.data) {
                console.log('Raw movie data from API:', response.data[0]); // Debug log
                return response.data.map(movie => {
                    // Try different possible ID fields
                    const movieId = movie.id || movie.movieId || movie.tmdbId || movie.externalId;
                    console.log('Movie ID found:', movieId, 'for movie:', movie.title); // Debug log
                    
                    return {
                        id: movieId,
                        name: movie.title,
                        title: movie.title,
                        description: movie.overview ? `${movie.title} (${movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : 'N/A'})` : movie.title,
                        image: movie.poster?.filePath ? `${API_CONFIG?.TMDB_IMAGE_BASE_URL}/w500${movie.poster.filePath}` : null,
                        type: 'movie'
                    };
                });
            }
            
            return [];
        } catch (error) {
            console.error('Movie title search error:', error);
            return [];
        }
    }
}