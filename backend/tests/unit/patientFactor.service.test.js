import { describe, it, expect } from 'vitest';
import { PatientFactorService } from '../../src/services/safety/patientFactor.service.js';
import { SeverityLevel } from '../../src/constants/severity.js';

describe('PatientFactorService Unit Tests', () => {
  it('should detect absolute contraindication for Metformin with eGFR < 30', async () => {
    const meds = [{ name: 'Glucophage', genericName: 'Metformin' }];
    const factors = { egfr: 24, age: 62 };

    const findings = await PatientFactorService.evaluateFactors(meds, factors);
    expect(findings.length).toBeGreaterThan(0);
    const f = findings[0];
    expect(f.severity).toBe(SeverityLevel.CRITICAL);
    expect(f.title).toContain('eGFR < 30');
    expect(f.clinicalEffect).toContain('Lactic Acidosis');
  });

  it('should detect dosage precaution for Metformin with eGFR 30–44', async () => {
    const meds = [{ name: 'Glucophage', genericName: 'Metformin' }];
    const factors = { egfr: 38, age: 58 };

    const findings = await PatientFactorService.evaluateFactors(meds, factors);
    expect(findings.length).toBeGreaterThan(0);
    const f = findings[0];
    expect(f.severity).toBe(SeverityLevel.MAJOR);
    expect(f.title).toContain('eGFR 30–44');
  });

  it('should flag teratogenic contraindications in pregnancy', async () => {
    const meds = [{ name: 'Coumadin', genericName: 'Warfarin' }];
    const factors = { pregnancy: true };

    const findings = await PatientFactorService.evaluateFactors(meds, factors);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0].severity).toBe(SeverityLevel.CONTRAINDICATED);
  });
});

