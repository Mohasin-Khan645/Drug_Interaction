import { describe, it, expect } from 'vitest';
import { MedicationSafetyEngine } from '../../src/services/safety/medicationSafetyEngine.js';
import { SeverityLevel } from '../../src/constants/severity.js';

describe('MedicationSafetyEngine Core Scenarios', () => {
  it('Scenario 1: 0 medications provided', async () => {
    const res = await MedicationSafetyEngine.runSafetyCheck({
      drugs: [],
      saveRecord: false,
    });
    expect(res.totalFindings).toBe(0);
    expect(res.findings).toHaveLength(0);
    expect(res.overallSafetyStatus).toBe('VERIFIED_SAFE');
  });

  it('Scenario 2: 1 medication provided without contraindication', async () => {
    const res = await MedicationSafetyEngine.runSafetyCheck({
      drugs: ['Metformin'],
      patientFactors: { egfr: 90 },
      saveRecord: false,
    });
    expect(res.overallSafetyStatus).toBe('VERIFIED_SAFE');
  });

  it('Scenario 3: 2 medications provided with known interaction (Warfarin + Aspirin)', async () => {
    const res = await MedicationSafetyEngine.runSafetyCheck({
      drugs: ['Warfarin', 'Aspirin'],
      saveRecord: false,
    });
    expect(res.totalFindings).toBeGreaterThan(0);
    expect(res.overallSafetyStatus).toBe('CRITICAL_CONCERN');
    expect(res.findings.some((f) => f.severity === SeverityLevel.CRITICAL)).toBe(true);
  });

  it('Scenario 4: 3 medications provided (Triple therapy: Warfarin + Aspirin + Lisinopril)', async () => {
    const res = await MedicationSafetyEngine.runSafetyCheck({
      drugs: ['Warfarin', 'Aspirin', 'Lisinopril'],
      saveRecord: false,
    });
    expect(res.totalFindings).toBeGreaterThan(0);
    expect(res.evaluatedMedications).toHaveLength(3);
    expect(res.findings.some((f) => f.severity === SeverityLevel.CRITICAL)).toBe(true);
  });

  it('Scenario 5: Duplicate medication detection', async () => {
    const res = await MedicationSafetyEngine.runSafetyCheck({
      drugs: ['Tylenol', 'Tylenol Extra Strength'],
      saveRecord: false,
    });
    expect(res.findings.some((f) => f.category === 'DUPLICATION')).toBe(true);
  });

  it('Scenario 6: Unknown / unlisted drug handling', async () => {
    const res = await MedicationSafetyEngine.runSafetyCheck({
      drugs: ['UnknownExperimentalDrugXYZ123'],
      saveRecord: false,
    });
    expect(res.overallSafetyStatus).toBe('VERIFIED_SAFE');
    expect(res.evaluatedMedications).toContain('UnknownExperimentalDrugXYZ123');
  });

  it('Scenario 7: Same drug reversed pair consistency Check(A, B) === Check(B, A)', async () => {
    const resAB = await MedicationSafetyEngine.runSafetyCheck({
      drugs: ['Simvastatin', 'Clarithromycin'],
      saveRecord: false,
    });
    const resBA = await MedicationSafetyEngine.runSafetyCheck({
      drugs: ['Clarithromycin', 'Simvastatin'],
      saveRecord: false,
    });

    expect(resAB.totalFindings).toBe(resBA.totalFindings);
    expect(resAB.overallSafetyStatus).toBe(resBA.overallSafetyStatus);
    expect(resAB.findings[0].title).toBe(resBA.findings[0].title);
  });

  it('Scenario 8: Multiple interactions simultaneously detected', async () => {
    // Warfarin + Aspirin (Bleed), Lisinopril + Spironolactone (Hyperkalemia)
    const res = await MedicationSafetyEngine.runSafetyCheck({
      drugs: ['Warfarin', 'Aspirin', 'Lisinopril', 'Spironolactone'],
      saveRecord: false,
    });

    expect(res.totalFindings).toBeGreaterThanOrEqual(2);
    const titles = res.findings.map((f) => f.title);
    expect(titles.some((t) => t.includes('Hemorrhage'))).toBe(true);
    expect(titles.some((t) => t.includes('Hyperkalemia'))).toBe(true);
  });

  it('Scenario 9: Multiple severity levels sorted correctly', async () => {
    const res = await MedicationSafetyEngine.runSafetyCheck({
      drugs: ['Warfarin', 'Aspirin', 'Spironolactone', 'Lisinopril'],
      saveRecord: false,
    });

    // Top finding must be CRITICAL before MAJOR
    expect(res.findings[0].severity).toBe(SeverityLevel.CRITICAL);
  });

  it('Scenario 10: Missing patient factors gracefully handled without error', async () => {
    const res = await MedicationSafetyEngine.runSafetyCheck({
      drugs: ['Metformin'],
      patientFactors: {},
      saveRecord: false,
    });
    expect(res.overallSafetyStatus).toBe('VERIFIED_SAFE');
  });

  it('Scenario 11: Allergy relationship cross-reactivity (Penicillin -> Amoxicillin)', async () => {
    const res = await MedicationSafetyEngine.runSafetyCheck({
      drugs: ['Amoxicillin'],
      allergies: ['Penicillin'],
      saveRecord: false,
    });

    expect(res.totalFindings).toBeGreaterThan(0);
    const allergyFinding = res.findings.find((f) => f.category === 'DRUG_ALLERGY');
    expect(allergyFinding).toBeDefined();
    expect(allergyFinding.severity).toBe(SeverityLevel.CRITICAL);
    expect(allergyFinding.status).toBe('REVIEW_REQUIRED');
  });

  it('Scenario 12: Disease contraindication (Ibuprofen in Chronic Kidney Disease)', async () => {
    const res = await MedicationSafetyEngine.runSafetyCheck({
      drugs: ['Ibuprofen'],
      conditions: ['Chronic Kidney Disease'],
      saveRecord: false,
    });

    expect(res.totalFindings).toBeGreaterThan(0);
    const diseaseFinding = res.findings.find((f) => f.category === 'DRUG_DISEASE');
    expect(diseaseFinding).toBeDefined();
    expect(diseaseFinding.severity).toBe(SeverityLevel.MAJOR);
  });
});

