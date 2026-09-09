import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '/api';

/**
 * The access token lives in memory only. The refresh token is an HTTP-only
 * cookie issued by the backend, so nothing sensitive is written to storage.
 */
let accessToken = null;
let onUnauthenticated = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

export const setUnauthenticatedHandler = (handler) => {
  onUnauthenticated = handler;
};

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 30000,
});

apiClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

export class ApiError extends Error {
  constructor({ code, message, details, status }) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
    this.status = status;
  }
}

const FRIENDLY_MESSAGES = {
  NETWORK: 'Unable to reach the DrugSafe service. Check your connection and try again.',
  UNKNOWN: 'Something went wrong. Please try again.',
};

const toApiError = (error) => {
  if (error instanceof ApiError) return error;
  if (!error.response) {
    return new ApiError({ code: 'NETWORK_ERROR', message: FRIENDLY_MESSAGES.NETWORK, status: 0 });
  }
  const payload = error.response.data;
  const detail = payload && payload.error ? payload.error : {};
  return new ApiError({
    code: detail.code || 'UNKNOWN_ERROR',
    message: detail.message || FRIENDLY_MESSAGES.UNKNOWN,
    details: detail.details,
    status: error.response.status,
  });
};

let refreshPromise = null;

const refreshSession = async () => {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${baseURL}/auth/refresh`, {}, { withCredentials: true })
      .then((response) => response.data.data)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config || {};
    const status = error.response ? error.response.status : 0;
    const isAuthRoute = typeof original.url === 'string' && original.url.startsWith('/auth/');

    if (status === 401 && !original._retried && !isAuthRoute) {
      original._retried = true;
      try {
        const session = await refreshSession();
        setAccessToken(session.accessToken);
        original.headers = { ...original.headers, Authorization: `Bearer ${session.accessToken}` };
        return apiClient(original);
      } catch {
        setAccessToken(null);
        if (onUnauthenticated) onUnauthenticated();
      }
    }
    return Promise.reject(toApiError(error));
  }
);

export const request = async (config) => {
  const response = await apiClient(config);
  return response.data.data;
};

export const get = (url, params, config) => request({ method: 'get', url, params, ...config });
export const post = (url, data, config) => request({ method: 'post', url, data, ...config });
export const patch = (url, data, config) => request({ method: 'patch', url, data, ...config });
export const del = (url, config) => request({ method: 'delete', url, ...config });

export { refreshSession };
