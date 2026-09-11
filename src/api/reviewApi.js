import apiClient from './client';

export const reviewApi = {
  getPendingReviews: async (params = {}) => {
    return apiClient.get('/reviews/pending', { params });
  },

  getReviewById: async (id) => {
    return apiClient.get(`/reviews/${id}`);
  },

  submitClinicianReview: async (reviewPayload) => {
    return apiClient.post('/reviews', reviewPayload);
  },
};
