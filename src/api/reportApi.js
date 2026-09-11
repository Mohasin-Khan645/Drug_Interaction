import apiClient from './client';

export const reportApi = {
  getReports: async (params = {}) => {
    return apiClient.get('/reports', { params });
  },

  getReportById: async (id) => {
    return apiClient.get(`/reports/${id}`);
  },

  generateReport: async (payload) => {
    return apiClient.post('/reports/generate', payload);
  },

  shareReport: async (id, recipientEmail) => {
    return apiClient.post(`/reports/${id}/share`, { recipientEmail });
  },
};
