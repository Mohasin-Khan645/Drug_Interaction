import apiClient from './client';

export const interactionApi = {
  checkInteractions: async (drugs) => {
    return apiClient.post('/interactions/check', { drugs });
  },

  getPairwiseInteraction: async (drugA, drugB) => {
    return apiClient.get('/interactions/pairwise', { params: { drugA, drugB } });
  },
};
