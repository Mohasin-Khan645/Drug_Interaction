import { describe, it, expect } from 'vitest';
import { DrugAllergyService } from '../../src/services/safety/drugAllergy.service.js';
import { SeverityLevel } from '../../src/constants/severity.js';

describe('DrugAllergyService Unit Tests', () => {
  it('should detect Penicillin allergy cross-reactivity with Amoxicillin', async () => {
    const meds = [{ name: 'Amoxil', genericName: 'Amoxicillin' }];
    const allergies = [{ allergen: 'Penicillin', reaction: 'Anaphylaxis', severity: 'Severe' }];

    const findings = await DrugAllergyService.evaluateAllergies(meds, allergies);
    expect(findings.length).toBeGreaterThan(0);
    const f = findings[0];
    expect(f.severity).toBe(SeverityLevel.CRITICAL);
    expect(f.title).toContain('Beta-Lactam');
    expect(f.status).toBe('REVIEW_REQUIRED');
  });

  it('should detect Aspirin hypersensitivity in patients with NSAID allergy', async () => {
    const meds = [{ name: 'Bayer Aspirin', genericName: 'Aspirin' }];
    const allergies = ['Aspirin'];

    const findings = await DrugAllergyService.evaluateAllergies(meds, allergies);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0].severity).toBe(SeverityLevel.CRITICAL);
  });
});

