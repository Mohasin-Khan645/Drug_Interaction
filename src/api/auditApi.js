import apiClient from './client';

export const auditApi = {
  getAuditLogs: async (params = {}) => {
    return apiClient.get('/admin/audit', { params });
  },

  exportAuditLogs: async (params = {}) => {
    return apiClient.get('/admin/audit/export', { params });
  },
};
