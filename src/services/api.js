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
        ...options.headers,
      },
    };

    // Only set Content-Type to application/json if not FormData
    if (!(options.body instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }

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
    const body = data instanceof FormData ? data : JSON.stringify(data);
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body,
    });
  }

  put(endpoint, data, options) {
    const body = data instanceof FormData ? data : JSON.stringify(data);
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body,
    });
  }

  patch(endpoint, data, options) {
    const body = data instanceof FormData ? data : JSON.stringify(data);
    return this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body,
    });
  }

  delete(endpoint, data, options) {
    const body = data instanceof FormData ? data : JSON.stringify(data);
    return this.request(endpoint, {
      ...options,
      method: 'DELETE',
      body,
    });
  }
}

export default new ApiService();