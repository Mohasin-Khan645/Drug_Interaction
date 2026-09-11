import axios from 'axios';
import { handleMockRequest } from './mock/mockAdapter';

// Determine backend URL and mock setting from environment variables
const API_URL = import.meta.env.VITE_API_URL || '/api';
const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === 'true';

// Create base Axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 20000,
});

// In-memory token storage synced with sessionStorage for persistent clinical sessions
let memoryToken = typeof window !== 'undefined' ? sessionStorage.getItem('drugsafe_auth_token') : null;

export function setAuthToken(token) {
  memoryToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      sessionStorage.setItem('drugsafe_auth_token', token);
    } else {
      sessionStorage.removeItem('drugsafe_auth_token');
    }
  }
}

export function getAuthToken() {
  if (!memoryToken && typeof window !== 'undefined') {
    memoryToken = sessionStorage.getItem('drugsafe_auth_token');
  }
  return memoryToken;
}

export function clearAuthToken() {
  memoryToken = null;
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('drugsafe_auth_token');
  }
}

// Request Interceptor: Attach bearer token and client audit headers
apiClient.interceptors.request.use(
  async (config) => {
    // If mock adapter is enabled, return mock handler response
    if (USE_MOCK) {
      // Axios adapter hook
      config.adapter = async (cfg) => {
        return handleMockRequest(cfg);
      };
    }

    if (memoryToken) {
      config.headers.Authorization = `Bearer ${memoryToken}`;
    }

    config.headers['X-DrugSafe-Client-Version'] = '1.0.0';
    config.headers['X-DrugSafe-Timestamp'] = new Date().toISOString();

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Friendly error normalization and automatic token refresh
apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized for Session Refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Attempt session refresh through backend endpoint
        const refreshResponse = await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });
        const newToken = refreshResponse.data?.token;
        if (newToken) {
          setAuthToken(newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshErr) {
        clearAuthToken();
        // Redirect to login if unauthenticated in production
        if (window.location.pathname !== '/login') {
          window.location.href = '/login?session_expired=true';
        }
        return Promise.reject(new Error('Your clinical session has expired. Please log in again.'));
      }
    }

    // Friendly sanitized error message (prevent stack trace leak)
    let friendlyMessage = 'Unable to complete request with clinical services.';
    if (error.response?.data?.message) {
      friendlyMessage = error.response.data.message;
    } else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      friendlyMessage = 'Clinical decision engine request timed out. Please try again.';
    } else if (!error.response) {
      friendlyMessage = 'Network connection error. Unable to reach clinical safety server.';
    }

    const sanitizedError = new Error(friendlyMessage);
    sanitizedError.statusCode = error.response?.status || 500;
    sanitizedError.originalError = error;

    return Promise.reject(sanitizedError);
  }
);

export default apiClient;
