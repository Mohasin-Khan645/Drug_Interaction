import { describe, it, expect } from 'vitest';
import { DrugDiseaseService } from '../../src/services/safety/drugDisease.service.js';
import { SeverityLevel } from '../../src/constants/severity.js';

describe('DrugDiseaseService Unit Tests', () => {
  it('should detect NSAID/Ibuprofen in Chronic Kidney Disease', async () => {
    const meds = [{ name: 'Advil', genericName: 'Ibuprofen' }];
    const conditions = ['Chronic Kidney Disease (Stage 3a)', 'Hypertension'];

    const findings = await DrugDiseaseService.evaluateDiseases(meds, conditions);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0].severity).toBe(SeverityLevel.MAJOR);
    expect(findings[0].title).toContain('Renal Decompensation');
    expect(findings[0].mechanism).toContain('prostaglandin');
  });

  it('should return empty findings if no disease contraindication matches', async () => {
    const meds = [{ name: 'Amoxicillin', genericName: 'Amoxicillin' }];
    const conditions = ['Essential Hypertension'];

    const findings = await DrugDiseaseService.evaluateDiseases(meds, conditions);
    expect(findings).toHaveLength(0);
  });
});

