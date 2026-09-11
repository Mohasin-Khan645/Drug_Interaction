/**
 * DRUGSAFE - Mock API Service Layer
 * Cleanly separated mock API for offline testing, demos, and standalone development.
 */

import {
  MOCK_USERS,
  MOCK_PATIENTS,
  MOCK_MEDICATIONS,
  MOCK_DRUGS,
  MOCK_INTERACTIONS_RULES,
  MOCK_ALERTS,
  MOCK_AUDIT_LOGS,
  MOCK_EVIDENCE_SOURCES,
} from '../api/mock/mockData';

// Simulated latency helper
const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockApiService = {
  // Authentication
  auth: {
    login: async (credentials: { email?: string; password?: string }) => {
      await delay();
      const user = MOCK_USERS.find((u) => u.email.toLowerCase() === credentials.email?.toLowerCase()) || MOCK_USERS[0];
      return { success: true, user, token: 'mock-jwt-token-demo' };
    },
    getCurrentUser: async () => {
      await delay(50);
      return { success: true, user: MOCK_USERS[0] };
    },
  },

  // Patients
  patients: {
    getAll: async (params: { search?: string; risk?: string } = {}) => {
      await delay();
      let results = [...MOCK_PATIENTS];
      if (params.search) {
        const q = params.search.toLowerCase();
        results = results.filter((p) => p.name.toLowerCase().includes(q) || p.mrn.toLowerCase().includes(q));
      }
      if (params.risk && params.risk !== 'ALL') {
        results = results.filter((p) => p.status === params.risk);
      }
      return { success: true, data: results, count: results.length };
    },
    getById: async (id: string) => {
      await delay();
      const patient = MOCK_PATIENTS.find((p) => p.id === id) || MOCK_PATIENTS[0];
      return { success: true, data: patient };
    },
  },

  // Medications
  medications: {
    getAll: async (patientId?: string) => {
      await delay();
      let meds = [...MOCK_MEDICATIONS];
      if (patientId) {
        meds = meds.filter((m) => m.patientId === patientId);
      }
      return { success: true, data: meds, count: meds.length };
    },
    getById: async (id: string) => {
      await delay();
      const med = MOCK_MEDICATIONS.find((m) => m.id === id);
      return { success: true, data: med };
    },
  },

  // Drug Catalog & Global Search
  drugs: {
    search: async (query = '') => {
      await delay();
      const q = query.trim().toLowerCase();
      if (!q) return { success: true, data: MOCK_DRUGS };
      const filtered = MOCK_DRUGS.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.genericName.toLowerCase().includes(q) ||
          (d.brandNames && d.brandNames.some((b) => b.toLowerCase().includes(q))) ||
          (d.drugClass && d.drugClass.toLowerCase().includes(q))
      );
      return { success: true, data: filtered };
    },
    getById: async (id: string) => {
      await delay();
      const drug = MOCK_DRUGS.find((d) => d.id === id || d.name.toLowerCase() === id.toLowerCase());
      return { success: true, data: drug };
    },
  },

  // Safety & Interactions
  safety: {
    checkInteractions: async (drugs: string[] = []) => {
      await delay(250);
      const drugNames = drugs.map((d) => (typeof d === 'string' ? d.toLowerCase() : (d as any).name?.toLowerCase()));
      
      const matched = (MOCK_INTERACTIONS_RULES || []).filter((item: any) => {
        const d1 = (item.primaryDrugId || item.drugA || '').toLowerCase();
        const d2 = (item.secondaryEntity || item.drugB || '').toLowerCase();
        return drugNames.includes(d1) && drugNames.includes(d2);
      });

      const findings = matched.map((m: any, idx: number) => ({
        id: `finding-${idx + 1}`,
        title: `${m.primaryDrugId || m.drugA} + ${m.secondaryEntity || m.drugB} Hazard Assessment`,
        severity: m.severity || 'MAJOR',
        medications: [m.primaryDrugId || m.drugA, m.secondaryEntity || m.drugB],
        summary: m.clinicalEffect || m.summary,
        clinicalEffect: m.clinicalEffect || m.summary,
        mechanism: m.mechanism || 'Pharmacological synergism or clearance reduction.',
        management: m.management || 'Clinical review recommended.',
        evidenceSources: [
          {
            id: `ev-${idx}`,
            title: m.evidence || 'FDA Approved Prescribing Information & Compendium',
            source: m.source || 'DailyMed / FDA CDER',
            evidenceLevel: 'Level 1 - High Certainty Systematic Guideline',
          },
        ],
        source: m.source || 'DailyMed',
        lastVerified: m.lastVerified || '2026-03-01',
        status: 'PENDING',
      }));

      return {
        success: true,
        data: {
          checkedCount: drugs.length,
          severitySummary: {
            critical: findings.filter((f) => f.severity === 'CRITICAL').length,
            major: findings.filter((f) => f.severity === 'MAJOR').length,
            monitor: findings.filter((f) => f.severity === 'MONITOR').length,
            noFinding: Math.max(0, drugs.length * 2 - findings.length),
          },
          findings,
          overallRisk: findings.some((f) => f.severity === 'CRITICAL')
            ? 'CRITICAL'
            : findings.some((f) => f.severity === 'MAJOR')
            ? 'MAJOR'
            : 'SAFE',
          disclaimer: 'Clinical decision-support only. Confirm findings against patient renal profile and physician oversight.',
        },
      };
    },
  },

  // Prescriptions & Dispensing Queue
  prescriptions: {
    getAll: async () => {
      await delay();
      return {
        success: true,
        data: [
          {
            id: 'RX-9821',
            prescriptionNumber: 'RX-9821',
            patientId: 'pt-101',
            patientName: 'Sarah Jenkins',
            prescriber: 'Dr. Marcus Chen, MD',
            submittedAt: 'Today, 08:05 AM',
            status: 'SAFETY_CONCERN',
            riskLevel: 'CRITICAL',
            medications: [
              { id: 'm-1', name: 'Warfarin', dosage: '5mg', frequency: 'Daily', route: 'Oral', confidence: 'High', normalizedName: 'Warfarin' },
              { id: 'm-2', name: 'Aspirin', dosage: '81mg', frequency: 'Daily', route: 'Oral', confidence: 'High', normalizedName: 'Aspirin' },
            ],
          },
        ],
      };
    },
    getById: async (id: string) => {
      await delay();
      return {
        success: true,
        data: {
          id: id || 'RX-9821',
          prescriptionNumber: id || 'RX-9821',
          patientId: 'pt-101',
          patientName: 'Sarah Jenkins',
          prescriber: 'Dr. Marcus Chen, MD',
          submittedAt: 'Today, 08:05 AM',
          status: 'SAFETY_CONCERN',
          riskLevel: 'CRITICAL',
          medications: [
            { id: 'm-1', name: 'Warfarin', dosage: '5mg', frequency: 'Daily', route: 'Oral', confidence: 'High', normalizedName: 'Warfarin' },
            { id: 'm-2', name: 'Aspirin', dosage: '81mg', frequency: 'Daily', route: 'Oral', confidence: 'High', normalizedName: 'Aspirin' },
          ],
        },
      };
    },
  },

  // Alerts
  alerts: {
    getAll: async () => {
      await delay();
      return { success: true, data: MOCK_ALERTS };
    },
  },

  // Admin Suite
  admin: {
    getUsers: async () => {
      await delay();
      return { success: true, data: MOCK_USERS };
    },
    getAuditLogs: async (params: { userRole?: string } = {}) => {
      await delay();
      let logs = [...MOCK_AUDIT_LOGS];
      if (params.userRole) {
        logs = logs.filter((l) => l.userRole === params.userRole);
      }
      return { success: true, data: logs };
    },
    getRules: async () => {
      await delay();
      return { success: true, data: MOCK_INTERACTIONS_RULES || [] };
    },
    getDataSources: async () => {
      await delay();
      return { success: true, data: MOCK_EVIDENCE_SOURCES || [] };
    },
    getAnalytics: async (timeframe = '30d') => {
      await delay();
      return {
        success: true,
        data: {
          timeframe,
          totals: {
            totalUsers: 248,
            activePatients: 142,
            doctors: 28,
            pharmacists: 14,
            safetyChecksToday: 184,
            criticalFindings: 7,
            prescriptionsProcessed: 96,
            systemHealth: '100% Operational',
          },
        },
      };
    },
  },
};

export default mockApiService;

