import apiClient, { setAuthToken, clearAuthToken } from './client';

export const authApi = {
  login: async (credentials) => {
    const res = await apiClient.post('/auth/login', credentials);
    const token = res.token || res.data?.token;
    const user = res.user || res.data?.user;
    if (token) {
      setAuthToken(token);
    }
    return { ...res, token, user };
  },

  register: async (registrationData) => {
    const res = await apiClient.post('/auth/register', registrationData);
    const token = res.token || res.data?.token;
    const user = res.user || res.data?.user;
    if (token) {
      setAuthToken(token);
    }
    return { ...res, token, user };
  },

  getCurrentUser: async () => {
    const res = await apiClient.get('/auth/me');
    const user = res.user || res.data?.user || res.data;
    return { ...res, user };
  },

  refreshSession: async () => {
    const res = await apiClient.post('/auth/refresh');
    const token = res.token || res.data?.token;
    if (token) {
      setAuthToken(token);
    }
    return { ...res, token };
  },

  forgotPassword: async (data) => {
    return apiClient.post('/auth/forgot-password', data);
  },

  resetPassword: async (data) => {
    return apiClient.post('/auth/reset-password', data);
  },

  verifyEmail: async (data) => {
    return apiClient.post('/auth/verify-email', data);
  },

  verifyMfa: async ({ mfaTicket, code }) => {
    const res = await apiClient.post('/auth/mfa/verify', { mfaTicket, code });
    const token = res.token || res.data?.token;
    const user = res.user || res.data?.user;
    if (token) {
      setAuthToken(token);
    }
    return { ...res, token, user };
  },

  toggleMfa: async (enabled) => {
    return apiClient.post('/auth/mfa/toggle', { enabled });
  },

  getSessions: async () => {
    return apiClient.get('/auth/sessions');
  },

  revokeSession: async (sessionId) => {
    return apiClient.delete(`/auth/sessions/${sessionId}`);
  },

  revokeAllSessions: async () => {
    return apiClient.post('/auth/sessions/revoke-all');
  },

  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      clearAuthToken();
    }
  },
};
