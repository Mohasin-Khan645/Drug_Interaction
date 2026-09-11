import { describe, it, expect } from 'vitest';
import { pdfService } from '../../src/services/pdf.service.js';

describe('PDFService Unit Tests', () => {
  it('should generate a valid PDF binary buffer', async () => {
    const mockReport = {
      reportNumber: 'DS-RPT-89412',
    };
    const mockPatient = {
      name: 'Sarah Jenkins',
      mrn: 'MRN-84920',
      age: 67,
      gender: 'Female',
      weightKg: 64.5,
      egfr: 48,
    };
    const mockSafetyCheck = {
      evaluatedMedications: ['Warfarin Sodium 5mg', 'Bayer Aspirin 81mg'],
      findings: [
        {
          severity: 'CRITICAL',
          title: 'Severe Gastrointestinal & Major Hemorrhage Risk',
          clinicalEffect: 'Marked potentiation of bleeding.',
          mechanism: 'Synergistic VKA and COX-1 inhibition.',
          management: 'Avoid concurrent use.',
        },
      ],
    };

    const buffer = await pdfService.generateSafetyReportPdf({
      report: mockReport,
      patient: mockPatient,
      safetyCheck: mockSafetyCheck,
    });

    expect(buffer).toBeDefined();
    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(buffer.length).toBeGreaterThan(500);

    // Verify PDF header magic bytes %PDF-
    const header = buffer.subarray(0, 5).toString('utf-8');
    expect(header).toBe('%PDF-');
  });
});

