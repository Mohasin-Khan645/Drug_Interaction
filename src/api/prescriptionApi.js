import apiClient from './client';

export const prescriptionApi = {
  uploadPrescription: async (formData) => {
    return apiClient.post('/prescriptions/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  getPrescriptions: async (params = {}) => {
    return apiClient.get('/prescriptions', { params });
  },

  getPrescriptionById: async (id) => {
    return apiClient.get(`/prescriptions/${id}`);
  },
};
