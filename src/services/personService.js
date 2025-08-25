import api from './api.js';
import { API_ENDPOINTS } from '../constants/persons.js';

class PersonService {
  /**
   * Search for people with pagination
   * @param {Object} searchParams - Search parameters
   * @param {string} searchParams.name - Person name to search for
   * @param {number} searchParams.role - Role type (0 for cast, 1 for crew)
   * @param {number} searchParams.pageNumber - Page number (0-based)
   * @param {number} searchParams.pageSize - Number of items per page
   * @returns {Promise<Response>} API response
   */
  async searchPeople(searchParams) {
    const { name, role, pageNumber, pageSize } = searchParams;
    
    const requestBody = {
      name: name || '',
      role: role !== undefined ? role : 0, // Default to cast (0) if not specified
      pageNumber: pageNumber || 0,
      pageSize: pageSize || 20
    };

    return api.post(API_ENDPOINTS.SEARCH, requestBody);
  }
}

export default new PersonService();
