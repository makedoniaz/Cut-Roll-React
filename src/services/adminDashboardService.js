import api from './api.js';
import { ADMIN_DASHBOARD_ENDPOINTS, ADMIN_DASHBOARD_DEFAULTS } from '../constants/adminDashboard.js';

export class AdminDashboardService {
  /**
   * Get filtered users for admin dashboard
   * @param {Object} filterParams - Filter parameters for users
   * @param {string|null} filterParams.searchTerm - Search term for username/email
   * @param {number|null} filterParams.role - User role filter
   * @param {boolean} filterParams.isBanned - Filter by banned status
   * @param {boolean} filterParams.isMuted - Filter by muted status
   * @param {string} filterParams.registeredAfter - Filter users registered after this date
   * @param {string} filterParams.registeredBefore - Filter users registered before this date
   * @param {number} filterParams.pageNumber - Page number for pagination
   * @param {number} filterParams.pageSize - Number of users per page
   * @returns {Promise<Object>} Filtered users data
   */
  static async getUsersFiltered(filterParams = {}) {
    // Build request body with defaults
    const requestBody = {
      searchTerm: filterParams.searchTerm ?? ADMIN_DASHBOARD_DEFAULTS.SEARCH_TERM,
      role: filterParams.role ?? ADMIN_DASHBOARD_DEFAULTS.ROLE,
      isBanned: filterParams.isBanned ?? ADMIN_DASHBOARD_DEFAULTS.IS_BANNED,
      isMuted: filterParams.isMuted ?? ADMIN_DASHBOARD_DEFAULTS.IS_MUTED,
      registeredAfter: filterParams.registeredAfter ?? ADMIN_DASHBOARD_DEFAULTS.REGISTERED_AFTER,
      registeredBefore: filterParams.registeredBefore ?? ADMIN_DASHBOARD_DEFAULTS.REGISTERED_BEFORE,
      pageNumber: filterParams.pageNumber ?? ADMIN_DASHBOARD_DEFAULTS.PAGE_NUMBER,
      pageSize: filterParams.pageSize ?? ADMIN_DASHBOARD_DEFAULTS.PAGE_SIZE
    };

    // Validate parameters
    if (requestBody.pageNumber < 1) {
      throw new Error('Page number must be greater than 0');
    }

    if (requestBody.pageSize < 1 || requestBody.pageSize > 100) {
      throw new Error('Page size must be between 1 and 100');
    }

    if (requestBody.role !== null && ![0, 1, 2].includes(requestBody.role)) {
      throw new Error('Role must be 0 (User), 1 (Admin), or 2 (Moderator)');
    }

    // Validate date format if provided
    if (requestBody.registeredAfter && isNaN(Date.parse(requestBody.registeredAfter))) {
      throw new Error('Invalid registeredAfter date format');
    }

    if (requestBody.registeredBefore && isNaN(Date.parse(requestBody.registeredBefore))) {
      throw new Error('Invalid registeredBefore date format');
    }

    try {
      const response = await api.post(ADMIN_DASHBOARD_ENDPOINTS.GET_USERS_FILTERED, requestBody);
      
      if (!response.ok) {
        let errorMessage = await response.text();
        throw new Error(errorMessage || 'Failed to fetch filtered users');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Admin dashboard service error:', error);
      throw error;
    }
  }

  /**
   * Get filtered users count for admin dashboard
   * @param {Object} filterParams - Filter parameters for users
   * @param {string|null} filterParams.searchTerm - Search term for username/email
   * @param {number|null} filterParams.role - User role filter
   * @param {boolean} filterParams.isBanned - Filter by banned status
   * @param {boolean} filterParams.isMuted - Filter by muted status
   * @param {string} filterParams.registeredAfter - Filter users registered after this date
   * @param {string} filterParams.registeredBefore - Filter users registered before this date
   * @param {number} filterParams.pageNumber - Page number for pagination
   * @param {number} filterParams.pageSize - Number of users per page
   * @returns {Promise<string>} Filtered users count as plain text
   */
  static async getUsersFilteredCount(filterParams = {}) {
    // Build request body with defaults (same as getUsersFiltered)
    const requestBody = {
      searchTerm: filterParams.searchTerm ?? ADMIN_DASHBOARD_DEFAULTS.SEARCH_TERM,
      role: filterParams.role ?? ADMIN_DASHBOARD_DEFAULTS.ROLE,
      isBanned: filterParams.isBanned ?? ADMIN_DASHBOARD_DEFAULTS.IS_BANNED,
      isMuted: filterParams.isMuted ?? ADMIN_DASHBOARD_DEFAULTS.IS_MUTED,
      registeredAfter: filterParams.registeredAfter ?? ADMIN_DASHBOARD_DEFAULTS.REGISTERED_AFTER,
      registeredBefore: filterParams.registeredBefore ?? ADMIN_DASHBOARD_DEFAULTS.REGISTERED_BEFORE,
      pageNumber: filterParams.pageNumber ?? ADMIN_DASHBOARD_DEFAULTS.PAGE_NUMBER,
      pageSize: filterParams.pageSize ?? ADMIN_DASHBOARD_DEFAULTS.PAGE_SIZE
    };

    // Validate parameters (same validation as getUsersFiltered)
    if (requestBody.pageNumber < 1) {
      throw new Error('Page number must be greater than 0');
    }

    if (requestBody.pageSize < 1 || requestBody.pageSize > 100) {
      throw new Error('Page size must be between 1 and 100');
    }

    if (requestBody.role !== null && ![0, 1, 2].includes(requestBody.role)) {
      throw new Error('Role must be 0 (User), 1 (Admin), or 2 (Moderator)');
    }

    // Validate date format if provided
    if (requestBody.registeredAfter && isNaN(Date.parse(requestBody.registeredAfter))) {
      throw new Error('Invalid registeredAfter date format');
    }

    if (requestBody.registeredBefore && isNaN(Date.parse(requestBody.registeredBefore))) {
      throw new Error('Invalid registeredBefore date format');
    }

    try {
      const response = await api.post(ADMIN_DASHBOARD_ENDPOINTS.GET_FILTERED_USER_COUNT, requestBody);
      
      if (!response.ok) {
        let errorMessage = await response.text();
        throw new Error(errorMessage || 'Failed to fetch filtered users count');
      }

      // Return plain text as specified
      const count = await response.text();
      return count;
    } catch (error) {
      console.error('Admin dashboard service error:', error);
      throw error;
    }
  }

  /**
   * Assign role to a user
   * @param {string} userId - The ID of the user to assign role to
   * @param {number} role - The role to assign (0=Admin, 1=User, 2=Moderator)
   * @returns {Promise<Object>} Response from the server
   */
  static async assignRole(userId, role) {
    // Validate parameters
    if (!userId || typeof userId !== 'string') {
      throw new Error('User ID is required and must be a string');
    }

    if (typeof role !== 'number' || ![0, 1, 2].includes(role)) {
      throw new Error('Role must be 0 (Admin), 1 (User), or 2 (Moderator)');
    }

    const requestBody = {
      userId: userId,
      role: role
    };

    try {
      const response = await api.post(ADMIN_DASHBOARD_ENDPOINTS.ASSIGN_ROLE, requestBody);
      
      if (!response.ok) {
        let errorMessage = await response.text();
        throw new Error(errorMessage || 'Failed to assign role to user');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Admin dashboard service error:', error);
      throw error;
    }
  }

  /**
   * Remove role from a user
   * @param {string} userId - The ID of the user to remove role from
   * @param {number} role - The role to remove (0=Admin, 1=User, 2=Moderator)
   * @returns {Promise<Object>} Response from the server
   */
  static async removeRole(userId, role) {
    // Validate parameters
    if (!userId || typeof userId !== 'string') {
      throw new Error('User ID is required and must be a string');
    }

    if (typeof role !== 'number' || ![0, 1, 2].includes(role)) {
      throw new Error('Role must be 0 (Admin), 1 (User), or 2 (Moderator)');
    }

    const requestBody = {
      userId: userId,
      role: role
    };

    try {
      const response = await api.post(ADMIN_DASHBOARD_ENDPOINTS.REMOVE_ROLE, requestBody);
      
      if (!response.ok) {
        let errorMessage = await response.text();
        throw new Error(errorMessage || 'Failed to remove role from user');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Admin dashboard service error:', error);
      throw error;
    }
  }

  /**
   * Toggle ban status for a user
   * @param {string} userId - The ID of the user to toggle ban status for
   * @returns {Promise<Object>} Response from the server
   */
  static async toggleBan(userId) {
    // Validate parameters
    if (!userId || typeof userId !== 'string') {
      throw new Error('User ID is required and must be a string');
    }

    try {
      const response = await api.post(`${ADMIN_DASHBOARD_ENDPOINTS.TOGGLE_BAN}/${userId}`);
      
      if (!response.ok) {
        let errorMessage = await response.text();
        throw new Error(errorMessage || 'Failed to toggle ban status for user');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Admin dashboard service error:', error);
      throw error;
    }
  }

  /**
   * Toggle mute status for a user
   * @param {string} userId - The ID of the user to toggle mute status for
   * @returns {Promise<Object>} Response from the server
   */
  static async toggleMute(userId) {
    // Validate parameters
    if (!userId || typeof userId !== 'string') {
      throw new Error('User ID is required and must be a string');
    }

    try {
      const response = await api.post(`${ADMIN_DASHBOARD_ENDPOINTS.TOGGLE_MUTE}/${userId}`);
      
      if (!response.ok) {
        let errorMessage = await response.text();
        throw new Error(errorMessage || 'Failed to toggle mute status for user');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Admin dashboard service error:', error);
      throw error;
    }
  }
}
