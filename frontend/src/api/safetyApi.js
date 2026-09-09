import { get, post } from './client';

export const safetyApi = {
  runCheck: (patientId, force = false) => post('/safety/check', { patientId, force }),
  getCheck: (checkId) => get(`/safety/checks/${checkId}`),
  listFindings: (params) => get('/safety/findings', params),
  getFinding: (findingId) => get(`/safety/findings/${findingId}`),
};

export const reviewApi = {
  list: (findingId) => get(`/safety/findings/${findingId}/reviews`),
  create: (findingId, data) => post(`/safety/findings/${findingId}/reviews`, data),
};
