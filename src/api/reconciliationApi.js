import apiClient from './client';

export const reconciliationApi = {
  runReconciliation: async (data) => {
    return apiClient.post('/reconciliation', data);
  },

  resolveDiscrepancy: async (id, resolution) => {
    return apiClient.post(`/reconciliation/discrepancies/${id}/resolve`, resolution);
  },
};
