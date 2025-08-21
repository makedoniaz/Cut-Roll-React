import api from './api.js';
import { API_ENDPOINTS } from '../constants/genres.js';

class GenreService {
  /**
   * Search for genres with pagination
   * @param {Object} searchParams - Search parameters
   * @param {string} searchParams.name - Genre name to search for
   * @param {number} searchParams.pageNumber - Page number (0-based)
   * @param {number} searchParams.pageSize - Number of items per page
   * @returns {Promise<Response>} API response
   */
  async searchGenres(searchParams) {
    const { name, pageNumber, pageSize } = searchParams;
    
    const requestBody = {
      name: name || '',
      pageNumber: pageNumber || 0,
      pageSize: pageSize || 20
    };

    return api.post(API_ENDPOINTS.SEARCH, requestBody);
  }
}

export default new GenreService();
