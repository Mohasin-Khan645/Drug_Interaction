import apiClient from './client';

export const normalizationApi = {
  normalizeDrug: async (rawName) => {
    return apiClient.post('/normalization/resolve', { rawName });
  },

  searchRxNorm: async (term) => {
    return apiClient.get('/normalization/rxnorm', { params: { term } });
  },

  getAtcClassification: async (code) => {
    return apiClient.get(`/normalization/atc/${code}`);
  },
};
