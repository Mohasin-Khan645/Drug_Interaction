import { del, get, patch, post } from './client';

export const patientApi = {
  list: (params) => get('/patients', params),
  get: (patientId) => get(`/patients/${patientId}`),
  update: (patientId, data) => patch(`/patients/${patientId}`, data),

  listConditions: (patientId) => get(`/patients/${patientId}/conditions`),
  addCondition: (patientId, data) => post(`/patients/${patientId}/conditions`, data),

  listAllergies: (patientId) => get(`/patients/${patientId}/allergies`),
  addAllergy: (patientId, data) => post(`/patients/${patientId}/allergies`, data),

  listLabResults: (patientId) => get(`/patients/${patientId}/lab-results`),
  addLabResult: (patientId, data) => post(`/patients/${patientId}/lab-results`, data),

  listCareTeam: (patientId) => get(`/patients/${patientId}/care-team`),
  addCareTeamMember: (patientId, clinicianId) =>
    post(`/patients/${patientId}/care-team`, { clinicianId }),
  removeCareTeamMember: (patientId, clinicianId) =>
    del(`/patients/${patientId}/care-team/${clinicianId}`),

  listSafetyChecks: (patientId, params) => get(`/patients/${patientId}/safety-checks`, params),
  listReports: (patientId, params) => get(`/patients/${patientId}/reports`, params),
};
