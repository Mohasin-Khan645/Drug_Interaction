import { describe, it, expect } from 'vitest';
import { DrugInteractionService } from '../../src/services/safety/drugInteraction.service.js';
import { SeverityLevel } from '../../src/constants/severity.js';

describe('DrugInteractionService Unit Tests', () => {
  it('should generate exactly N*(N-1)/2 canonical unique pairs', () => {
    expect(DrugInteractionService.generatePairs([])).toHaveLength(0);
    expect(DrugInteractionService.generatePairs([{ name: 'DrugA' }])).toHaveLength(0);
    expect(DrugInteractionService.generatePairs([{ name: 'DrugA' }, { name: 'DrugB' }])).toHaveLength(1);

    const threeMeds = [{ name: 'Warfarin' }, { name: 'Aspirin' }, { name: 'Lisinopril' }];
    const pairs = DrugInteractionService.generatePairs(threeMeds);
    expect(pairs).toHaveLength(3); // 3 * 2 / 2 = 3
  });

  it('should normalize pair order so A+B equals B+A', () => {
    const list1 = [{ name: 'Warfarin' }, { name: 'Aspirin' }];
    const list2 = [{ name: 'Aspirin' }, { name: 'Warfarin' }];

    const pairs1 = DrugInteractionService.generatePairs(list1);
    const pairs2 = DrugInteractionService.generatePairs(list2);

    expect(pairs1[0].drugA.name.toLowerCase()).toBe(pairs2[0].drugA.name.toLowerCase());
    expect(pairs1[0].drugB.name.toLowerCase()).toBe(pairs2[0].drugB.name.toLowerCase());
  });

  it('should detect Warfarin + Aspirin critical bleed risk interaction', async () => {
    const meds = [
      { name: 'Warfarin Sodium', genericName: 'Warfarin' },
      { name: 'Bayer Aspirin', genericName: 'Aspirin' },
    ];

    const findings = await DrugInteractionService.evaluateInteractions(meds);
    expect(findings.length).toBeGreaterThan(0);
    const finding = findings[0];
    expect(finding.severity).toBe(SeverityLevel.CRITICAL);
    expect(finding.title).toContain('Hemorrhage Risk');
    expect(finding.clinicalEffect).toContain('gastrointestinal hemorrhage');
    expect(finding.evidence).toBeDefined();
  });

  it('should detect Simvastatin + Clarithromycin critical contraindication', async () => {
    const meds = [
      { name: 'Simvastatin', genericName: 'Simvastatin' },
      { name: 'Clarithromycin', genericName: 'Clarithromycin' },
    ];

    const findings = await DrugInteractionService.evaluateInteractions(meds);
    expect(findings.length).toBeGreaterThan(0);
    const finding = findings[0];
    expect(finding.severity).toBe(SeverityLevel.CRITICAL);
    expect(finding.title).toContain('Rhabdomyolysis');
  });

  it('should detect Lisinopril + Spironolactone hyperkalemia risk', async () => {
    const meds = [
      { name: 'Lisinopril', genericName: 'Lisinopril' },
      { name: 'Spironolactone', genericName: 'Spironolactone' },
    ];

    const findings = await DrugInteractionService.evaluateInteractions(meds);
    expect(findings.length).toBeGreaterThan(0);
    const finding = findings[0];
    expect(finding.severity).toBe(SeverityLevel.MAJOR);
    expect(finding.title).toContain('Hyperkalemia');
  });
});

