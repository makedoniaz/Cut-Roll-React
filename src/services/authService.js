import api from './api.js';
import { API_ENDPOINTS } from '../constants/auth.js';
import { parseJWT, isTokenExpired } from '../utils/jwt.js';

export class AuthService {
  static async login(credentials) {
    const loginData = {
      loginIdentifier: credentials.loginIdentifier || credentials.email,
      password: credentials.password
    };

    const response = await api.post(API_ENDPOINTS.LOGIN, loginData, { skipAuth: true });
    
    if (!response.ok) {
      let errorMessage = await response.text();
      
      // Try to parse as JSON first, if it fails, use as plain text
      try {
        const errorJson = JSON.parse(errorMessage);
        errorMessage = errorJson.message || errorMessage;
      } catch {
        // If parsing fails, errorMessage remains as plain text
      }
      
      throw new Error(errorMessage || 'Login failed');
    }

    const data = await response.json();
    
    const userInfo = parseJWT(data.jwt) || {
      username: credentials.loginIdentifier,
      email: credentials.loginIdentifier.includes('@') ? credentials.loginIdentifier : null
    };

    return { data, userInfo };
  }

  static async loginGoogle(credentials) {
    const userInfo = parseJWT(credentials.jwt) || {
      username: credentials.loginIdentifier,
      email: credentials.loginIdentifier.includes('@') ? credentials.loginIdentifier : null
    };

    return userInfo
  }

  static async register(userData) {
    const registrationData = {
      name: userData.username || userData.name,
      email: userData.email,
      password: userData.password
    };

    const response = await api.post(API_ENDPOINTS.REGISTER, registrationData, { skipAuth: true });
    if (!response.ok) {
      let errorMessage = await response.text();
      
      // Try to parse as JSON first, if it fails, use as plain text
      try {
        const errorJson = JSON.parse(errorMessage);
        errorMessage = errorJson.message || errorMessage;
      } catch {
        // If parsing fails, errorMessage remains as plain text
      }
      
      throw new Error(errorMessage || 'Registration failed');
    }

    return await response;
  }

  static async refreshToken(refreshToken) {
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    // Note: Using skipAuth: true to avoid circular dependency during token refresh
    const response = await api.put(API_ENDPOINTS.REFRESH_TOKEN, refreshToken);
    
    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    return data;
  }

  static async updateProfile(profileData) {
    // This will automatically use the token from the store via your api.js
    const response = await api.put(API_ENDPOINTS.UPDATE_PROFILE, profileData);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Profile update failed');
    }
    
    // Handle successful responses (200, 204) - some may not have JSON content
    if (response.status === 204 || response.status === 200) {
      // For 204 No Content or 200 OK without JSON, return success
      return { success: true, message: 'Profile updated successfully' };
    }
    
    // Try to parse JSON for other successful responses
    try {
      const updatedUser = await response.json();
      return updatedUser;
    } catch (error) {
      // If JSON parsing fails but response was successful, return success
      return { success: true, message: 'Profile updated successfully' };
    }
  }

  static async updateAvatar(avatarFile) {
    const formData = new FormData();
    formData.append('avatar', avatarFile);

    const response = await api.put('identity/api/User/Avatar', formData, {
      headers: {
        // Don't set Content-Type header - let the browser set it with boundary for FormData
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Avatar update failed');
    }
    
    const updatedUser = await response.json();
    return updatedUser;
  }

  static isTokenExpired(token) {
    return isTokenExpired(token);
  }
}