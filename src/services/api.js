import { useAuthStore } from '../stores/authStore';

const API_BASE_URL = 'https://cutnroll.it.com/api/';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const authStore = useAuthStore.getState();
    const token = authStore.token;

    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    // Add auth token if available
    if (token && !options.skipAuth) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);

      // Handle token refresh if needed
      if (response.status === 401 && !options.skipAuth) {
        const refreshed = await authStore.refreshAccessToken();
        if (refreshed) {
          // Retry original request with new token
          config.headers.Authorization = `Bearer ${useAuthStore.getState().token}`;
          return fetch(url, config);
        } else {
          // Redirect to login if refresh fails
          authStore.logout();
          window.location.href = '/login';
          throw new Error('Authentication failed');
        }
      }

      return response;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Convenience methods
  get(endpoint, options) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, data, options) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  put(endpoint, data, options) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  delete(endpoint, options) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

export default new ApiService();