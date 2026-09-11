import apiClient from './client';

export const medicationApi = {
  getMedications: async (params = {}) => {
    return apiClient.get('/medications', { params });
  },

  getMedicationById: async (id) => {
    return apiClient.get(`/medications/${id}`);
  },

  addMedication: async (medicationData) => {
    return apiClient.post('/medications', medicationData);
  },

  updateMedication: async (id, medicationData) => {
    return apiClient.put(`/medications/${id}`, medicationData);
  },

  deleteMedication: async (id) => {
    return apiClient.delete(`/medications/${id}`);
  },
};
