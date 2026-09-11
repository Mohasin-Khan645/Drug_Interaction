import apiClient from './client';

export const ocrApi = {
  extractPrescription: async (formData) => {
    return apiClient.post('/prescriptions/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  confirmOcrCandidate: async (candidateId, normalizedData) => {
    return apiClient.post(`/ocr/candidates/${candidateId}/confirm`, normalizedData);
  },

  rejectOcrCandidate: async (candidateId, reason) => {
    return apiClient.post(`/ocr/candidates/${candidateId}/reject`, { reason });
  },
};
