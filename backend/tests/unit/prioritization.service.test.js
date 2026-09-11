import { describe, it, expect } from 'vitest';
import { PrioritizationService } from '../../src/services/safety/prioritization.service.js';
import { SeverityLevel } from '../../src/constants/severity.js';

describe('PrioritizationService Unit Tests', () => {
  it('should sort findings by priority order: CONTRAINDICATED -> CRITICAL -> MAJOR -> MODERATE -> MINOR -> INFORMATIONAL', () => {
    const rawFindings = [
      { id: '1', severity: SeverityLevel.MINOR, title: 'Minor 1' },
      { id: '2', severity: SeverityLevel.CRITICAL, title: 'Critical 1' },
      { id: '3', severity: SeverityLevel.CONTRAINDICATED, title: 'Contraindicated 1' },
      { id: '4', severity: SeverityLevel.MAJOR, title: 'Major 1' },
      { id: '5', severity: SeverityLevel.INFORMATIONAL, title: 'Info 1' },
      { id: '6', severity: SeverityLevel.MODERATE, title: 'Mod 1' },
    ];

    const sorted = PrioritizationService.prioritizeFindings(rawFindings);
    expect(sorted.map((s) => s.severity)).toEqual([
      SeverityLevel.CONTRAINDICATED,
      SeverityLevel.CRITICAL,
      SeverityLevel.MAJOR,
      SeverityLevel.MODERATE,
      SeverityLevel.MINOR,
      SeverityLevel.INFORMATIONAL,
    ]);
  });

  it('should not hide lower severity findings', () => {
    const rawFindings = [
      { id: '1', severity: SeverityLevel.CRITICAL },
      { id: '2', severity: SeverityLevel.INFORMATIONAL },
    ];

    const sorted = PrioritizationService.prioritizeFindings(rawFindings);
    expect(sorted).toHaveLength(2);
    expect(sorted.some((s) => s.severity === SeverityLevel.INFORMATIONAL)).toBe(true);
  });

  it('should calculate overall safety classification accurately', () => {
    const criticalGroup = { [SeverityLevel.CRITICAL]: [{ id: '1' }] };
    expect(PrioritizationService.calculateOverallStatus(criticalGroup)).toBe('CRITICAL_CONCERN');

    const cleanGroup = { [SeverityLevel.CRITICAL]: [], [SeverityLevel.MAJOR]: [] };
    expect(PrioritizationService.calculateOverallStatus(cleanGroup)).toBe('VERIFIED_SAFE');
  });
});

