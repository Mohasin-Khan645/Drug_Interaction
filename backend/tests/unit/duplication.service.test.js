import { describe, it, expect } from 'vitest';
import { DuplicationService } from '../../src/services/safety/duplication.service.js';
import { SeverityLevel } from '../../src/constants/severity.js';

describe('DuplicationService Unit Tests', () => {
  it('should detect duplicate acetaminophen active ingredient across different brands', async () => {
    const meds = [
      { name: 'Tylenol Extra Strength', activeIngredient: 'Acetaminophen' },
      { name: 'Vicodin', activeIngredient: 'Acetaminophen' },
    ];

    const findings = await DuplicationService.evaluateDuplications(meds);
    expect(findings.length).toBeGreaterThan(0);
    const finding = findings[0];
    expect(finding.severity).toBe(SeverityLevel.MAJOR);
    expect(finding.title).toContain('Acetaminophen');
    expect(finding.mechanism).toContain('NAPQI');
  });

  it('should detect duplicate prescription orders of the exact same medication', async () => {
    const meds = [
      { name: 'Lisinopril 20mg', genericName: 'Lisinopril' },
      { name: 'Lisinopril 20mg', genericName: 'Lisinopril' },
    ];

    const findings = await DuplicationService.evaluateDuplications(meds);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0].severity).toBe(SeverityLevel.MODERATE);
  });
});

