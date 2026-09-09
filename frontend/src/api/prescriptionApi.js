import { get, patch, post, request } from './client';

export const prescriptionApi = {
  upload: ({ patientId, file, notes, onUploadProgress }) => {
    const form = new FormData();
    form.append('image', file);
    form.append('patientId', patientId);
    if (notes) form.append('notes', notes);
    return request({
      method: 'post',
      url: '/prescriptions',
      data: form,
      onUploadProgress,
    });
  },
  get: (prescriptionId) => get(`/prescriptions/${prescriptionId}`),
  listItems: (prescriptionId) => get(`/prescriptions/${prescriptionId}/items`),
};

export const ocrApi = {
  process: (prescriptionId) => post(`/prescriptions/${prescriptionId}/process`),
  // OCR candidates are never auto-confirmed; a human decides here.
  confirmItem: (itemId, data) => patch(`/prescriptions/items/${itemId}`, data),
};

export const reconciliationApi = {
  previewFromPrescription: (prescriptionId) =>
    post(`/prescriptions/${prescriptionId}/reconciliation/preview`),
  preview: (patientId, items) => post(`/patients/${patientId}/reconciliation/preview`, { items }),
  apply: (patientId, payload) => post(`/patients/${patientId}/reconciliation/apply`, payload),
};
