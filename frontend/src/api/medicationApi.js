import { get, patch, post } from './client';

export const medicationApi = {
  list: (patientId, params) => get(`/patients/${patientId}/medications`, params),
  create: (patientId, data) => post(`/patients/${patientId}/medications`, data),
  update: (medicationId, data) => patch(`/medications/${medicationId}`, data),
  // Medication history is never deleted; stopping is a status change.
  stop: (medicationId, notes) => post(`/medications/${medicationId}/stop`, { notes }),
};
