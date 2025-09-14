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
    
    const updatedUser = await response.json();
    return updatedUser;
  }

  static async updateAvatar(avatarFile) {
    const formData = new FormData();
    formData.append('avatar', avatarFile);

    const response = await api.patch('/identity/api/User/Avatar', formData, {
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