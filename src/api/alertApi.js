import apiClient from './client';

export const alertApi = {
  getAlerts: async (params = {}) => {
    return apiClient.get('/alerts', { params });
  },

  markAsRead: async (id) => {
    return apiClient.put(`/alerts/${id}`, { status: 'READ' });
  },

  markAllAsRead: async () => {
    return apiClient.put('/alerts/mark-all-read');
  },

  archiveAlert: async (id) => {
    return apiClient.put(`/alerts/${id}`, { status: 'ARCHIVED' });
  },
};
