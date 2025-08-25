import apiService from './api.js';
import { API_ENDPOINTS } from '../constants/cast.js';

class CastService {
  /**
   * Search for actors/actresses by name and optionally by character name
   * @param {string} name - Actor/actress name to search for
   * @param {string|null} characterName - Character name to filter by (optional)
   * @param {number} pageNumber - Page number (default: 1)
   * @param {number} pageSize - Page size (default: 10)
   * @returns {Promise<Response>} API response
   */
  async searchActor(name, characterName = null, pageNumber = 1, pageSize = 10) {
    const requestBody = {
      name: name,
      characterName: characterName,
      pageNumber: pageNumber,
      pageSize: pageSize
    };

    return apiService.post(API_ENDPOINTS.SEARCH, requestBody);
  }
}

export default new CastService();
