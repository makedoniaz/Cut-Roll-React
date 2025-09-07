import api from './api.js';
import { API_ENDPOINTS } from '../constants/listMovie.js';

/**
 * Service for managing movies in lists
 * 
 * Usage Examples:
 * 
 * // Add a single movie to a list
 * await ListMovieService.addMovieToList({
 *   listId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
 *   movieId: "3fa85f64-5717-4562-b3fc-2c963f66afa6"
 * });
 * 
 * // Remove a single movie from a list
 * await ListMovieService.removeMovieFromList({
 *   listId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
 *   movieId: "3fa85f64-5717-4562-b3fc-2c963f66afa6"
 * });
 * 
 * // Add multiple movies to a list (uses bulk operation)
 * await ListMovieService.addMultipleMoviesToList({
 *   listId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
 *   movieIds: ["movie1-uuid", "movie2-uuid", "movie3-uuid"]
 * });
 * 
 * // Bulk add movies to multiple lists
 * await ListMovieService.bulkAddMoviesToList([
 *   { listId: "list1-uuid", movieId: "movie1-uuid" },
 *   { listId: "list2-uuid", movieId: "movie2-uuid" }
 * ]);
 * 
 * // Check if a movie is in a list
 * const isInList = await ListMovieService.isMovieInList({
 *   listId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
 *   movieId: "3fa85f64-5717-4562-b3fc-2c963f66afa6"
 * });
 */
export class ListMovieService {
  /**
   * Add a movie to a list
   * @param {Object} params - The parameters for adding a movie to list
   * @param {string} params.listId - The UUID of the list
   * @param {string} params.movieId - The UUID of the movie
   * @returns {Promise<Response>} The API response
   */
  static async addMovieToList({ listId, movieId }) {
    try {
      const requestBody = {
        listId,
        movieId
      };

      console.log('Adding movie to list:', requestBody);

      const response = await api.post(API_ENDPOINTS.ADD, requestBody);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to add movie to list');
      }

      return response;
    } catch (error) {
      console.error('Error adding movie to list:', error);
      throw error;
    }
  }

  /**
   * Remove a movie from a list
   * @param {Object} params - The parameters for removing a movie from list
   * @param {string} params.listId - The UUID of the list
   * @param {string} params.movieId - The UUID of the movie
   * @returns {Promise<Response>} The API response
   */
  static async removeMovieFromList({ listId, movieId }) {
    try {
      const requestBody = {
        listId,
        movieId
      };

      console.log('Removing movie from list:', requestBody);

      const response = await api.post(API_ENDPOINTS.REMOVE, requestBody);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to remove movie from list');
      }

      return response;
    } catch (error) {
      console.error('Error removing movie from list:', error);
      throw error;
    }
  }

  /**
   * Add movies to a list in bulk using a single API call
   * @param {Object} params - The parameters for bulk adding movies
   * @param {Array<Object>} params.movies - Array of movie objects with listId and movieId
   * @returns {Promise<Response>} The API response
   */
  static async bulkAddMoviesToList(movies) {
    try {
      console.log('Bulk adding movies to lists:', movies);

      const response = await api.post(API_ENDPOINTS.BULK_ADD, movies);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to bulk add movies to lists');
      }

      return response;
    } catch (error) {
      console.error('Error bulk adding movies to lists:', error);
      throw error;
    }
  }

  /**
   * Add multiple movies to a list using bulk operation
   * @param {Object} params - The parameters for adding multiple movies
   * @param {string} params.listId - The UUID of the list
   * @param {Array<string>} params.movieIds - Array of movie UUIDs
   * @returns {Promise<Response>} The API response
   */
  static async addMultipleMoviesToList({ listId, movieIds }) {
    try {
      console.log('Adding multiple movies to list:', { listId, movieIds });

      // Transform movieIds into the required format for bulk operation
      const movies = movieIds.map(movieId => ({
        listId,
        movieId
      }));

      return await this.bulkAddMoviesToList(movies);
    } catch (error) {
      console.error('Error adding multiple movies to list:', error);
      throw error;
    }
  }

  /**
   * Remove movies from lists in bulk using a single API call
   * @param {Array<Object>} movies - Array of movie objects with listId and movieId
   * @returns {Promise<Response>} The API response
   */
  static async bulkRemoveMoviesFromList(movies) {
    try {
      console.log('Bulk removing movies from lists:', movies);

      const response = await api.post(API_ENDPOINTS.BULK_REMOVE, movies);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to bulk remove movies from lists');
      }

      return response;
    } catch (error) {
      console.error('Error bulk removing movies from lists:', error);
      throw error;
    }
  }

  /**
   * Remove multiple movies from a list using bulk operation
   * @param {Object} params - The parameters for removing multiple movies
   * @param {string} params.listId - The UUID of the list
   * @param {Array<string>} params.movieIds - Array of movie UUIDs
   * @returns {Promise<Response>} The API response
   */
  static async removeMultipleMoviesFromList({ listId, movieIds }) {
    try {
      console.log('Removing multiple movies from list:', { listId, movieIds });

      // Transform movieIds into the required format for bulk operation
      const movies = movieIds.map(movieId => ({
        listId,
        movieId
      }));

      return await this.bulkRemoveMoviesFromList(movies);
    } catch (error) {
      console.error('Error removing multiple movies from list:', error);
      throw error;
    }
  }

  /**
   * Check if a movie is in a specific list
   * @param {Object} params - The parameters for checking movie in list
   * @param {string} params.listId - The UUID of the list
   * @param {string} params.movieId - The UUID of the movie
   * @returns {Promise<boolean>} True if movie is in list, false otherwise
   */
  static async isMovieInList({ listId, movieId }) {
    try {
      console.log('Checking if movie is in list:', { listId, movieId });

      const response = await api.get(`${API_ENDPOINTS.IS_IN_LIST}?listId=${listId}&movieId=${movieId}`);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to check if movie is in list');
      }

      // Assuming the API returns a boolean or an object with a boolean property
      const result = await response.json();
      return typeof result === 'boolean' ? result : result.isInList || false;
    } catch (error) {
      console.error('Error checking if movie is in list:', error);
      throw error;
    }
  }
}
