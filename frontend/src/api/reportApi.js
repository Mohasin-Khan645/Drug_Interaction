import { apiClient, get, post } from './client';

export const reportApi = {
  create: (safetyCheckId, status = 'DRAFT') => post('/reports', { safetyCheckId, status }),
  get: (reportId) => get(`/reports/${reportId}`),
  downloadPdf: async (reportId) => {
    const response = await apiClient({
      method: 'get',
      url: `/reports/${reportId}/pdf`,
      responseType: 'blob',
    });
    return response.data;
  },
};
