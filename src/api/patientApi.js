import apiClient from './client';

export const patientApi = {
  getPatients: async (params = {}) => {
    return apiClient.get('/patients', { params });
  },

  getPatientById: async (id) => {
    return apiClient.get(`/patients/${id}`);
  },

  createPatient: async (data) => {
    return apiClient.post('/patients', data);
  },

  updatePatientProfile: async (id, data) => {
    return apiClient.put(`/patients/${id}`, data);
  },

  getPatientConditions: async (patientId) => {
    return apiClient.get(`/patients/${patientId}/conditions`);
  },

  addPatientCondition: async (patientId, condition) => {
    return apiClient.post(`/patients/${patientId}/conditions`, condition);
  },

  getPatientAllergies: async (patientId) => {
    return apiClient.get(`/patients/${patientId}/allergies`);
  },

  addPatientAllergy: async (patientId, allergy) => {
    return apiClient.post(`/patients/${patientId}/allergies`, allergy);
  },

  getPatientLabs: async (patientId) => {
    return apiClient.get(`/patients/${patientId}/labs`);
  },

  getPatientFactors: async (patientId) => {
    return apiClient.get(`/patients/${patientId}/factors`);
  },
};
