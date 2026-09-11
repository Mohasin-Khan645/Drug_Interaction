/**
 * DRUGSAFE - Live API Service Layer
 * Production bridge communicating with Express /api endpoints
 */

import { authApi } from '../api/authApi';
import { medicationApi } from '../api/medicationApi';
import { drugApi } from '../api/drugApi';
import { interactionApi } from '../api/interactionApi';
import { safetyApi } from '../api/safetyApi';
import { patientApi } from '../api/patientApi';
import { prescriptionApi } from '../api/prescriptionApi';
import { alertApi } from '../api/alertApi';
import { reportApi } from '../api/reportApi';
import { adminApi } from '../api/adminApi';

export const liveApiService = {
  // Authentication
  auth: {
    login: (credentials) => authApi.login(credentials),
    register: (userData) => authApi.register(userData),
    logout: () => authApi.logout(),
    getCurrentUser: () => authApi.getCurrentUser(),
    refreshSession: () => authApi.refreshSession(),
  },

  // Patients
  patients: {
    getAll: (params) => patientApi.getPatients(params),
    getById: (id) => patientApi.getPatientById(id),
    create: (data) => patientApi.createPatient(data),
    update: (id, data) => patientApi.updatePatient(id, data),
  },

  // Medications
  medications: {
    getAll: (patientId) => medicationApi.getMedications(patientId),
    getById: (id) => medicationApi.getMedicationById(id),
    create: (data) => medicationApi.createMedication(data),
    update: (id, data) => medicationApi.updateMedication(id, data),
    delete: (id) => medicationApi.deleteMedication(id),
  },

  // Drug Catalog
  drugs: {
    search: (query, filters) => drugApi.searchDrugs(query, filters),
    getById: (id) => drugApi.getDrugById(id),
  },

  // Safety & Interactions
  safety: {
    checkInteractions: (drugs, patientId) => interactionApi.checkInteractions(drugs, patientId),
    runSafetyEngine: (payload) => safetyApi.runSafetyEngine(payload),
    streamExplain: (finding, question, callbacks) => safetyApi.streamExplainFinding(finding, question, callbacks),
  },

  // Prescriptions & OCR
  prescriptions: {
    getAll: () => prescriptionApi.getPrescriptions(),
    getById: (id) => prescriptionApi.getPrescriptionById(id),
    upload: (formData) => prescriptionApi.uploadPrescription(formData),
    reconcile: (id, decisions) => prescriptionApi.reconcilePrescription(id, decisions),
  },

  // Alerts & Notifications
  alerts: {
    getAll: () => alertApi.getAlerts(),
    markRead: (id) => alertApi.markAlertRead(id),
    markAllRead: () => alertApi.markAllAlertsRead(),
  },

  // Reports
  reports: {
    getAll: () => reportApi.getReports(),
    getById: (id) => reportApi.getReportById(id),
    downloadPdf: (id) => reportApi.downloadReportPdf(id),
  },

  // Admin
  admin: {
    getUsers: () => adminApi.getUsers(),
    getAuditLogs: (params) => adminApi.getAuditLogs(params),
    getAnalytics: (timeframe) => adminApi.getAnalytics(timeframe),
    getRules: () => adminApi.getRules(),
    getDataSources: () => adminApi.getDataSources(),
    toggleUserStatus: (id, status) => adminApi.toggleUserStatus(id, status),
  },
};

export default liveApiService;

