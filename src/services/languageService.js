import apiService from './api.js';
import { API_ENDPOINTS } from '../constants/language.js';

class LanguageService {
  /**
   * Search for languages by name with pagination
   * @param {string} name - Language name to search for
   * @param {number} pageNumber - Page number (default: 1)
   * @param {number} pageSize - Page size (default: 10)
   * @returns {Promise<Response>} API response
   */
  async searchLanguage(name, pageNumber = 1, pageSize = 10) {
    const requestBody = {
      name: name,
      pageNumber: pageNumber,
      pageSize: pageSize
    };

    return apiService.post(API_ENDPOINTS.SEARCH, requestBody);
  }
}

export default new LanguageService();
