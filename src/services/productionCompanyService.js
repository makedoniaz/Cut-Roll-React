import api from './api.js';
import { API_ENDPOINTS } from '../constants/productionCompanies.js';

class ProductionCompanyService {
  /**
   * Search for production companies with pagination
   * @param {Object} searchParams - Search parameters
   * @param {string} searchParams.name - Production company name to search for
   * @param {string} searchParams.countryCode - Country code (set to null for name-only search)
   * @param {number} searchParams.pageNumber - Page number (0-based)
   * @param {number} searchParams.pageSize - Number of items per page
   * @returns {Promise<Response>} API response
   */
  async searchProductionCompanies(searchParams) {
    const { name, countryCode, pageNumber, pageSize } = searchParams;
    
    const requestBody = {
      name: name || '',
      countryCode: null, // Always set to null for name-only search
      pageNumber: pageNumber || 1,
      pageSize: pageSize || 20
    };

    return api.post(API_ENDPOINTS.SEARCH, requestBody);
  }
}

export default new ProductionCompanyService();
