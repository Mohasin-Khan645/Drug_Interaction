import { get } from './client';

export const evidenceApi = {
  listSources: () => get('/evidence/sources'),
  listDocuments: (params) => get('/evidence/documents', params),
  getDocument: (documentId) => get(`/evidence/documents/${documentId}`),
};
