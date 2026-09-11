import {
  MOCK_USERS,
  MOCK_PATIENTS,
  MOCK_DRUGS,
  MOCK_MEDICATIONS_PATIENT_1,
  MOCK_INTERACTIONS_RULES,
  MOCK_EVIDENCE_SOURCES,
  MOCK_ALERTS,
  MOCK_AUDIT_LOGS,
} from './mockData';

// Local in-memory state for mock sessions
let mockMedications = [...MOCK_MEDICATIONS_PATIENT_1];
let mockAlerts = [...MOCK_ALERTS];
let mockAuditLogs = [...MOCK_AUDIT_LOGS];
let mockRules = [...MOCK_INTERACTIONS_RULES];
let mockUsers = [...MOCK_USERS];
let mockDrugs = [...MOCK_DRUGS];
let mockPatients = [...MOCK_PATIENTS];

export function handleMockRequest(config) {
  const { url, method, data, params } = config;
  const cleanUrl = url.split('?')[0].replace(/^\/api/, '');
  const parsedData = typeof data === 'string' ? JSON.parse(data || '{}') : data || {};

  // Artificial clinical API latency
  const delay = 180;

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        // AUTHENTICATION
        if (cleanUrl === '/auth/login' && method.toLowerCase() === 'post') {
          const user = mockUsers.find((u) => u.email.toLowerCase() === (parsedData.email || '').toLowerCase()) || mockUsers[0];
          return resolve({
            status: 200,
            data: {
              success: true,
              token: 'mock-jwt-token-drugsafe-' + user.role.toLowerCase(),
              user,
            },
          });
        }

        if (cleanUrl === '/auth/me' && method.toLowerCase() === 'get') {
          return resolve({
            status: 200,
            data: {
              success: true,
              user: mockUsers[0],
            },
          });
        }

        if (cleanUrl === '/auth/refresh' && method.toLowerCase() === 'post') {
          return resolve({
            status: 200,
            data: {
              success: true,
              token: 'refreshed-mock-jwt-token',
            },
          });
        }

        if (cleanUrl === '/auth/register' && method.toLowerCase() === 'post') {
          if (parsedData.role === 'ADMIN') {
            return reject({
              response: {
                status: 403,
                data: { message: 'Administrator registration is prohibited via public registration.' },
              },
            });
          }
          const newUser = {
            id: 'usr-' + Date.now(),
            name: parsedData.fullName,
            email: parsedData.email,
            role: parsedData.role || 'PATIENT',
            status: 'ACTIVE',
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
          };
          mockUsers.push(newUser);
          return resolve({
            status: 201,
            data: { success: true, user: newUser, token: 'mock-jwt-registered' },
          });
        }

        if (cleanUrl === '/auth/forgot-password' || cleanUrl === '/auth/reset-password' || cleanUrl === '/auth/verify-email') {
          return resolve({
            status: 200,
            data: { success: true, message: 'Operation completed successfully.' },
          });
        }

        // DRUG SEARCH & DETAILS
        if (cleanUrl === '/drugs' && method.toLowerCase() === 'get') {
          const q = (params?.search || '').toLowerCase().trim();
          let results = [...mockDrugs];
          if (q) {
            results = results.filter(
              (d) =>
                d.name.toLowerCase().includes(q) ||
                d.genericName.toLowerCase().includes(q) ||
                d.activeIngredient.toLowerCase().includes(q) ||
                d.drugClass.toLowerCase().includes(q) ||
                (d.rxNormCode && d.rxNormCode.includes(q))
            );
          }
          if (params?.drugClass) {
            results = results.filter((d) => d.drugClass === params.drugClass);
          }
          return resolve({
            status: 200,
            data: {
              success: true,
              data: results,
              total: results.length,
              page: params?.page || 1,
            },
          });
        }

        if (cleanUrl.startsWith('/drugs/') && method.toLowerCase() === 'get') {
          const id = cleanUrl.replace('/drugs/', '');
          const drug = mockDrugs.find((d) => d.id === id || d.name.toLowerCase() === id.toLowerCase()) || mockDrugs[0];
          return resolve({
            status: 200,
            data: { success: true, data: drug },
          });
        }

        // MEDICATIONS
        if (cleanUrl === '/medications' && method.toLowerCase() === 'get') {
          return resolve({
            status: 200,
            data: { success: true, data: mockMedications },
          });
        }

        if (cleanUrl === '/medications' && method.toLowerCase() === 'post') {
          const newMed = {
            id: 'med-' + Date.now(),
            status: 'Active',
            addedDate: new Date().toISOString().split('T')[0],
            ...parsedData,
          };
          mockMedications.unshift(newMed);
          return resolve({
            status: 201,
            data: { success: true, data: newMed },
          });
        }

        if (cleanUrl.startsWith('/medications/') && method.toLowerCase() === 'put') {
          const id = cleanUrl.replace('/medications/', '');
          const idx = mockMedications.findIndex((m) => m.id === id);
          if (idx !== -1) {
            mockMedications[idx] = { ...mockMedications[idx], ...parsedData };
            return resolve({ status: 200, data: { success: true, data: mockMedications[idx] } });
          }
        }

        if (cleanUrl.startsWith('/medications/') && method.toLowerCase() === 'delete') {
          const id = cleanUrl.replace('/medications/', '');
          mockMedications = mockMedications.filter((m) => m.id !== id);
          return resolve({
            status: 200,
            data: { success: true, message: 'Medication removed successfully' },
          });
        }

        // PRESCRIPTION OCR EXTRACTION
        if (cleanUrl === '/prescriptions/upload' && method.toLowerCase() === 'post') {
          // Simulate OCR recognition
          const candidates = [
            {
              id: 'ocr-cand-1',
              detectedName: 'Amoxicillin 500mg',
              normalizedName: 'Amoxicillin',
              genericName: 'Amoxicillin',
              strength: '500 mg',
              form: 'Capsule',
              frequency: 'Three times daily (TID)',
              route: 'Oral',
              confidence: 'High',
              confidenceScore: 0.96,
              rxNormCode: '723',
              normalizationStatus: 'VERIFIED_MATCH',
              flagWarning: 'Patient profile indicates severe Penicillin allergy. Verify cross-reactivity!',
            },
            {
              id: 'ocr-cand-2',
              detectedName: 'Atorvastatin 20mg tab',
              normalizedName: 'Atorvastatin Calcium',
              genericName: 'Atorvastatin',
              strength: '20 mg',
              form: 'Tablet',
              frequency: 'Once daily at bedtime',
              route: 'Oral',
              confidence: 'Medium',
              confidenceScore: 0.81,
              rxNormCode: '83367',
              normalizationStatus: 'VERIFIED_MATCH',
              flagWarning: null,
            },
            {
              id: 'ocr-cand-3',
              detectedName: 'Lisinoprl 10mg?',
              normalizedName: 'Lisinopril',
              genericName: 'Lisinopril',
              strength: '10 mg',
              form: 'Tablet',
              frequency: 'Once daily',
              route: 'Oral',
              confidence: 'Low',
              confidenceScore: 0.54,
              rxNormCode: '29046',
              normalizationStatus: 'NEEDS_VERIFICATION',
              flagWarning: 'Please verify this medication manually. Low OCR character clarity.',
            },
          ];

          return resolve({
            status: 200,
            data: {
              success: true,
              prescriptionId: 'rx-upload-' + Date.now(),
              detectedMedications: candidates,
              processedAt: new Date().toISOString(),
            },
          });
        }

        // MEDICATION RECONCILIATION
        if (cleanUrl === '/reconciliation' && method.toLowerCase() === 'post') {
          const discrepancies = [
            {
              id: 'rec-disc-1',
              type: 'DUPLICATE_THERAPY',
              title: 'Active Duplicate Therapy Detected',
              primaryMedication: 'Tylenol Extra Strength 500mg',
              conflictingMedication: 'Vicodin (Hydrocodone/Acetaminophen 5/300mg)',
              reason: 'Both products contain Acetaminophen. Cumulative daily ingestion may exceed the 4,000 mg liver safety threshold.',
              recommendation: 'Reconcile total daily acetaminophen dosage or substitute non-acetaminophen analgesic.',
            },
            {
              id: 'rec-disc-2',
              type: 'DOSAGE_CONFLICT',
              title: 'Conflicting Medication Instructions',
              primaryMedication: 'Zestril (Lisinopril) 20mg',
              conflictingMedication: 'Lisinopril 10mg (Discharge Summary)',
              reason: 'Outpatient electronic record specifies 20mg daily, while hospital discharge order lists 10mg daily.',
              recommendation: 'Confirm target blood pressure and verify intended dose with attending cardiologist.',
            },
          ];

          return resolve({
            status: 200,
            data: {
              success: true,
              reconciliationId: 'recon-' + Date.now(),
              status: 'ACTION_REQUIRED',
              discrepancies,
              reconciledAt: new Date().toISOString(),
            },
          });
        }

        // SAFETY CHECK ENGINE
        if ((cleanUrl === '/safety/check' || cleanUrl === '/interactions/check') && method.toLowerCase() === 'post') {
          const requestedDrugs = parsedData.drugs || [];
          const drugNames = requestedDrugs.map((d) => (typeof d === 'string' ? d : d.name || d.medicationName || ''));

          // Match clinical rules
          const findings = [];

          // Warfarin + Aspirin
          if (
            drugNames.some((n) => /warfarin|coumadin/i.test(n)) &&
            drugNames.some((n) => /aspirin|bayer/i.test(n))
          ) {
            findings.push({
              ...mockRules[0],
              id: 'fnd-wf-asp',
              reviewStatus: 'PENDING_REVIEW',
            });
          }

          // Simvastatin + Clarithromycin
          if (
            drugNames.some((n) => /simvastatin|zocor/i.test(n)) &&
            drugNames.some((n) => /clarithromycin|biaxin/i.test(n))
          ) {
            findings.push({
              ...mockRules[1],
              id: 'fnd-sim-cla',
              reviewStatus: 'PENDING_REVIEW',
            });
          }

          // Lisinopril + Spironolactone
          if (
            drugNames.some((n) => /lisinopril|zestril/i.test(n)) &&
            drugNames.some((n) => /spironolactone|aldactone/i.test(n))
          ) {
            findings.push({
              ...mockRules[2],
              id: 'fnd-lis-spi',
              reviewStatus: 'PENDING_REVIEW',
            });
          }

          // Patient Factor: Metformin in CKD
          if (drugNames.some((n) => /metformin|glucophage/i.test(n))) {
            findings.push({
              ...mockRules[4],
              id: 'fnd-met-ckd',
              reviewStatus: 'ACKNOWLEDGED',
            });
          }

          // Allergy: Amoxicillin with Penicillin Allergy
          if (drugNames.some((n) => /amoxicillin|amoxil|penicillin/i.test(n))) {
            findings.push({
              ...mockRules[3],
              id: 'fnd-amox-all',
              reviewStatus: 'REQUIRES_INVESTIGATION',
            });
          }

          // NSAID in CKD
          if (drugNames.some((n) => /ibuprofen|advil|naproxen/i.test(n))) {
            findings.push({
              ...mockRules[5],
              id: 'fnd-nsaid-ckd',
              reviewStatus: 'PENDING_REVIEW',
            });
          }

          // Default fallback findings if simple query
          if (findings.length === 0 && drugNames.length > 1) {
            findings.push({
              id: 'fnd-info-combo',
              severity: 'INFORMATIONAL',
              title: 'No Severe Pharmacodynamic Conflicts Detected',
              affectedDrugs: drugNames,
              clinicalEffect: 'The evaluated medication regimen demonstrates acceptable co-administration compatibility under standard dosing parameters.',
              mechanism: 'No competitive metabolic pathway or receptor antagonism identified in standard pharmacopeia.',
              recommendation: 'Continue standard clinical and routine laboratory monitoring.',
              evidence: 'Standard pharmacokinetics compendium reference.',
              source: 'DailyMed / openFDA',
              reviewStatus: 'VERIFIED',
            });
          }

          // Group by severity
          const grouped = {
            CRITICAL: findings.filter((f) => f.severity === 'CRITICAL'),
            MAJOR: findings.filter((f) => f.severity === 'MAJOR'),
            MODERATE: findings.filter((f) => f.severity === 'MODERATE'),
            MINOR: findings.filter((f) => f.severity === 'MINOR'),
            INFORMATIONAL: findings.filter((f) => f.severity === 'INFORMATIONAL'),
          };

          const overallSafetyStatus =
            grouped.CRITICAL.length > 0
              ? 'CRITICAL_CONCERN'
              : grouped.MAJOR.length > 0
              ? 'MAJOR_CONCERN'
              : grouped.MODERATE.length > 0
              ? 'MODERATE_PRECAUTION'
              : 'VERIFIED_SAFE';

          return resolve({
            status: 200,
            data: {
              success: true,
              checkId: 'chk-' + Date.now(),
              overallSafetyStatus,
              totalFindings: findings.length,
              findings,
              groupedFindings: grouped,
              evaluatedMedications: drugNames,
              analyzedAt: new Date().toISOString(),
            },
          });
        }

        // SAFETY EXPLAIN (AI DECISION SUPPORT)
        if (cleanUrl === '/safety/explain' && method.toLowerCase() === 'post') {
          const finding = parsedData.finding || {};
          const affected = Array.isArray(finding.affectedDrugs) ? finding.affectedDrugs : ['Selected Medications'];

          return resolve({
            status: 200,
            data: {
              success: true,
              data: {
                success: true,
                explanation:
                  `### [CLINICAL SAFETY ASSESSMENT]\n` +
                  `**Medications Evaluated**: ${affected.join(' and ')}\n` +
                  `**Severity**: ${finding.severity || 'MAJOR'}\n` +
                  `**Pharmacological Mechanism**: ${finding.mechanism || 'Competitive enzyme inhibition or receptor synergism.'}\n` +
                  `**Clinical Risk**: ${finding.clinicalEffect || 'Altered serum concentrations.'}\n` +
                  `**Prescribing Protocol**: ${finding.management || finding.recommendation || 'Monitor patient parameters.'}`,
                groundedEvidence: finding.evidence || 'FDA Approved Package Labeling & DailyMed.',
                source: finding.source || 'DailyMed / NIH RxNorm / FDA CDER',
                disclaimer:
                  'AI-generated explanation synthesized strictly from verified evidence. For clinical decision-support only.',
              },
            },
          });
        }

        // PATIENTS
        if (cleanUrl === '/patients' && method.toLowerCase() === 'get') {
          return resolve({
            status: 200,
            data: { success: true, data: mockPatients },
          });
        }

        if (cleanUrl === '/patients' && method.toLowerCase() === 'post') {
          const newPat = {
            id: 'pat-' + Date.now(),
            mrn: parsedData.mrn || 'MRN-' + Math.floor(100000 + Math.random() * 900000),
            name: parsedData.name || 'New Patient',
            age: Number(parsedData.age) || 45,
            gender: parsedData.gender || 'Female',
            dob: parsedData.dob || '1980-01-01',
            bloodGroup: parsedData.bloodGroup || 'O+',
            primaryPhysician: parsedData.primaryPhysician || 'Dr. Eleanor Vance, MD',
            renalFunction: {
              egfr: Number(parsedData.egfr) || 90,
              stage: parsedData.stage || (Number(parsedData.egfr) < 60 ? 'CKD Stage 3' : 'Normal Renal Function'),
              serumCreatinine: parsedData.serumCreatinine || 0.9,
              lastMeasured: new Date().toISOString().split('T')[0],
            },
            allergies: Array.isArray(parsedData.allergies) ? parsedData.allergies : [],
            conditions: Array.isArray(parsedData.conditions) ? parsedData.conditions : [],
            status: 'ACTIVE',
            activeMedicationsCount: 0,
            ...parsedData,
          };
          mockPatients.unshift(newPat);
          return resolve({
            status: 201,
            data: { success: true, data: newPat },
          });
        }

        if (cleanUrl.startsWith('/patients/') && method.toLowerCase() === 'put') {
          const id = cleanUrl.replace('/patients/', '');
          const pat = mockPatients.find((p) => p.id === id);
          if (pat) Object.assign(pat, parsedData);
          return resolve({
            status: 200,
            data: { success: true, data: pat || parsedData },
          });
        }

        if (cleanUrl.startsWith('/patients/') && method.toLowerCase() === 'get') {
          const id = cleanUrl.replace('/patients/', '');
          const patient = mockPatients.find((p) => p.id === id) || mockPatients[0];
          return resolve({
            status: 200,
            data: { success: true, data: patient },
          });
        }

        // ALERTS
        if (cleanUrl === '/alerts' && method.toLowerCase() === 'get') {
          return resolve({
            status: 200,
            data: { success: true, data: mockAlerts },
          });
        }

        if (cleanUrl.startsWith('/alerts/') && method.toLowerCase() === 'put') {
          const id = cleanUrl.replace('/alerts/', '');
          const alert = mockAlerts.find((a) => a.id === id);
          if (alert) Object.assign(alert, parsedData);
          return resolve({
            status: 200,
            data: { success: true, data: alert },
          });
        }

        // CLINICAL REVIEWS
        if (cleanUrl === '/reviews' && method.toLowerCase() === 'post') {
          const newReview = {
            id: 'rev-' + Date.now(),
            ...parsedData,
            status: 'COMPLETED',
          };
          mockAuditLogs.unshift({
            id: 'aud-' + Date.now(),
            timestamp: new Date().toISOString(),
            user: parsedData.reviewerName || 'Clinician',
            role: parsedData.reviewerRole || 'DOCTOR',
            action: 'CLINICAL_DECISION_SIGN_OFF',
            resource: `Finding #${parsedData.findingId}`,
            status: 'SUCCESS',
            details: `Decision: ${parsedData.decision}. Note: ${parsedData.clinicalNote}`,
          });
          return resolve({
            status: 201,
            data: { success: true, data: newReview },
          });
        }

        // EVIDENCE SOURCES
        if (cleanUrl === '/evidence' && method.toLowerCase() === 'get') {
          return resolve({
            status: 200,
            data: { success: true, data: MOCK_EVIDENCE_SOURCES },
          });
        }

        // ADMIN AUDIT LOGS
        if (cleanUrl === '/admin/audit' && method.toLowerCase() === 'get') {
          return resolve({
            status: 200,
            data: { success: true, data: mockAuditLogs },
          });
        }

        // ADMIN USERS
        if (cleanUrl === '/admin/users' && method.toLowerCase() === 'get') {
          return resolve({
            status: 200,
            data: { success: true, data: mockUsers },
          });
        }

        if (cleanUrl.startsWith('/admin/users/') && method.toLowerCase() === 'put') {
          const id = cleanUrl.replace('/admin/users/', '');
          const usr = mockUsers.find((u) => u.id === id);
          if (usr) Object.assign(usr, parsedData);
          return resolve({
            status: 200,
            data: { success: true, data: usr },
          });
        }

        if (cleanUrl === '/admin/users' && method.toLowerCase() === 'post') {
          const newUser = {
            id: 'usr-' + Date.now(),
            name: parsedData.name || 'New Staff User',
            email: parsedData.email || 'user@hospital.org',
            role: parsedData.role || 'DOCTOR',
            status: parsedData.status || 'ACTIVE',
            department: parsedData.department || 'Clinical Practice',
            licenseNumber: parsedData.licenseNumber || 'LIC-' + Math.floor(10000 + Math.random() * 90000),
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            ...parsedData,
          };
          mockUsers.unshift(newUser);
          return resolve({
            status: 201,
            data: { success: true, data: newUser },
          });
        }

        if (cleanUrl.match(/\/admin\/users\/[^/]+\/reset-password/) && method.toLowerCase() === 'post') {
          return resolve({
            status: 200,
            data: { success: true, message: 'Password reset link sent to user email.' },
          });
        }

        // ADMIN RULES
        if (cleanUrl === '/admin/rules' && method.toLowerCase() === 'get') {
          return resolve({
            status: 200,
            data: { success: true, data: mockRules },
          });
        }

        if (cleanUrl === '/admin/rules' && method.toLowerCase() === 'post') {
          const newRule = { id: 'rule-dd-' + Date.now(), ...parsedData };
          mockRules.unshift(newRule);
          return resolve({ status: 201, data: { success: true, data: newRule } });
        }

        // ADMIN ANALYTICS
        if (cleanUrl === '/admin/analytics' && method.toLowerCase() === 'get') {
          return resolve({
            status: 200,
            data: {
              success: true,
              data: {
                totalChecks: 14820,
                checksOverTime: [
                  { month: 'Apr', checks: 1420, criticalAlerts: 48 },
                  { month: 'May', checks: 1890, criticalAlerts: 62 },
                  { month: 'Jun', checks: 2340, criticalAlerts: 71 },
                  { month: 'Jul', checks: 2780, criticalAlerts: 85 },
                  { month: 'Aug', checks: 3120, criticalAlerts: 94 },
                  { month: 'Sep', checks: 3270, criticalAlerts: 88 },
                ],
                severityDistribution: [
                  { name: 'Critical', value: 142, color: '#dc2626' },
                  { name: 'Major', value: 388, color: '#ea580c' },
                  { name: 'Moderate', value: 812, color: '#d97706' },
                  { name: 'Minor', value: 1240, color: '#2563eb' },
                  { name: 'Informational', value: 2450, color: '#64748b' },
                ],
                topSearchedDrugs: [
                  { name: 'Warfarin', count: 1840 },
                  { name: 'Metformin', count: 1520 },
                  { name: 'Lisinopril', count: 1390 },
                  { name: 'Aspirin', count: 1210 },
                  { name: 'Simvastatin', count: 980 },
                  { name: 'Amoxicillin', count: 870 },
                ],
                ruleCategories: [
                  { category: 'Drug-Drug', count: 482 },
                  { category: 'Drug-Disease', count: 215 },
                  { category: 'Drug-Allergy', count: 174 },
                  { category: 'Duplication', count: 96 },
                  { category: 'Patient Factor', count: 128 },
                ],
              },
            },
          });
        }

        // Default not found
        return resolve({
          status: 200,
          data: { success: true, message: 'OK', data: [] },
        });
      } catch (err) {
        return reject(err);
      }
    }, delay);
  });
}
