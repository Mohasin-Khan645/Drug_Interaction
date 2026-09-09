import { get, patch, post } from './client';

export const adminApi = {
  listUsers: (params) => get('/admin/users', params),
  createUser: (data) => post('/admin/users', data),
  updateUser: (userId, data) => patch(`/admin/users/${userId}`, data),
  suspendUser: (userId) => post(`/admin/users/${userId}/suspend`),

  createDrug: (data) => post('/admin/drugs', data),
  updateDrug: (drugId, data) => patch(`/admin/drugs/${drugId}`, data),
  deactivateDrug: (drugId) => post(`/admin/drugs/${drugId}/deactivate`),
  addAlias: (drugId, data) => post(`/admin/drugs/${drugId}/aliases`, data),
  addIdentifier: (drugId, data) => post(`/admin/drugs/${drugId}/identifiers`, data),

  listRules: (kind, params) => get(`/admin/rules/${kind}`, params),
  createRule: (kind, data) => post(`/admin/rules/${kind}`, data),
  // Updating a rule archives the current version and creates the next one.
  updateRule: (kind, ruleId, data) => patch(`/admin/rules/${kind}/${ruleId}`, data),
  deactivateRule: (kind, ruleId) => post(`/admin/rules/${kind}/${ruleId}/deactivate`),

  listSources: () => get('/admin/evidence/sources'),
  createSource: (data) => post('/admin/evidence/sources', data),
  updateSource: (sourceId, data) => patch(`/admin/evidence/sources/${sourceId}`, data),
  listDocuments: (params) => get('/admin/evidence/documents', params),
  createDocument: (data) => post('/admin/evidence/documents', data),

  analytics: (days) => get('/admin/analytics', days ? { days } : undefined),
};

export const userApi = {
  list: adminApi.listUsers,
  update: adminApi.updateUser,
};

export const auditApi = {
  list: (params) => get('/admin/audit', params),
};
