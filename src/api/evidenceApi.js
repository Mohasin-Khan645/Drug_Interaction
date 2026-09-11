import apiClient from './client';

export const evidenceApi = {
  getEvidenceSources: async () => {
    return apiClient.get('/evidence');
  },

  getEvidenceByDrug: async (drugId) => {
    return apiClient.get(`/evidence/drugs/${drugId}`);
  },

  syncSource: async (sourceId) => {
    return apiClient.post(`/evidence/${sourceId}/sync`);
  },
};
