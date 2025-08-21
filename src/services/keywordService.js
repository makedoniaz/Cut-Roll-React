import api from './api.js';
import { API_ENDPOINTS } from '../constants/keywords.js';

class KeywordService {
  /**
   * Search for keywords with pagination
   * @param {Object} searchParams - Search parameters
   * @param {string} searchParams.name - Keyword name to search for
   * @param {number} searchParams.pageNumber - Page number (0-based)
   * @param {number} searchParams.pageSize - Number of items per page
   * @returns {Promise<Response>} API response
   */
  async searchKeywords(searchParams) {
    const { name, pageNumber, pageSize } = searchParams;
    
    const requestBody = {
      name: name || '',
      pageNumber: pageNumber || 0,
      pageSize: pageSize || 20
    };

    return api.post(API_ENDPOINTS.SEARCH, requestBody);
  }
}

export default new KeywordService();
