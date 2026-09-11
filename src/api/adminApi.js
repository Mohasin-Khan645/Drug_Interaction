import apiClient from './client';

export const adminApi = {
  getSystemAnalytics: async () => {
    return apiClient.get('/admin/analytics');
  },

  getRules: async (params = {}) => {
    return apiClient.get('/admin/rules', { params });
  },

  createRule: async (ruleData) => {
    return apiClient.post('/admin/rules', ruleData);
  },

  updateRule: async (id, ruleData) => {
    return apiClient.put(`/admin/rules/${id}`, ruleData);
  },

  toggleRuleStatus: async (id, status) => {
    return apiClient.put(`/admin/rules/${id}/status`, { status });
  },

  getSystemSettings: async () => {
    return apiClient.get('/admin/settings');
  },

  updateSystemSettings: async (settings) => {
    return apiClient.put('/admin/settings', settings);
  },
};
