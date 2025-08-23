import api from './api.js';
import { API_ENDPOINTS } from '../constants/countries.js';

class CountryService {
  /**
   * Search for countries with pagination
   * @param {Object} searchParams - Search parameters
   * @param {string} searchParams.name - Country name to search for
   * @param {number} searchParams.pageNumber - Page number (1-based)
   * @param {number} searchParams.pageSize - Number of items per page
   * @returns {Promise<Response>} API response
   */
  async searchCountries(searchParams) {
    const { name, pageNumber, pageSize } = searchParams;
    
    const requestBody = {
      name: name || '',
      pageNumber: pageNumber || 1,
      pageSize: pageSize || 10
    };

    return api.post(API_ENDPOINTS.SEARCH, requestBody);
  }
}

export default new CountryService();
