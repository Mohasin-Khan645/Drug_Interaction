import apiClient from './client';

export const drugApi = {
  searchDrugs: async (params = {}) => {
    return apiClient.get('/drugs', { params });
  },

  getDrugById: async (id) => {
    return apiClient.get(`/drugs/${id}`);
  },

  getDrugClasses: async () => {
    return apiClient.get('/drugs/classes');
  },

  getDrugInteractions: async (drugId) => {
    return apiClient.get(`/drugs/${drugId}/interactions`);
  },
};
