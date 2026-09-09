import { describe, expect, it } from 'vitest';
import { groupBySeverity, overallStatus, severityMeta, sortBySeverity } from '../lib/severity';

describe('severity ordering', () => {
  it('sorts the most severe finding first', () => {
    const sorted = sortBySeverity([
      { id: 'a', severity: 'MODERATE' },
      { id: 'b', severity: 'CONTRAINDICATED' },
      { id: 'c', severity: 'MINOR' },
    ]);
    expect(sorted.map((finding) => finding.id)).toEqual(['b', 'a', 'c']);
  });

  it('prioritises findings awaiting review within the same severity', () => {
    const sorted = sortBySeverity([
      { id: 'a', severity: 'MAJOR', status: 'OPEN' },
      { id: 'b', severity: 'MAJOR', status: 'REVIEW_REQUIRED' },
    ]);
    expect(sorted[0].id).toBe('b');
  });

  it('keeps low severity findings visible instead of dropping them', () => {
    const groups = groupBySeverity([
      { id: 'a', severity: 'CRITICAL' },
      { id: 'b', severity: 'INFORMATIONAL' },
    ]);
    expect(groups.map((group) => group.severity)).toEqual(['CRITICAL', 'INFORMATIONAL']);
  });

  it('labels every severity with text, never colour alone', () => {
    expect(severityMeta('CONTRAINDICATED').label).toBe('Contraindicated');
    expect(severityMeta('UNRECOGNISED').label).toBe(severityMeta('INFORMATIONAL').label);
  });

  it('reports a safe result when no rule matched', () => {
    expect(overallStatus([]).label).toBe('No safety findings');
    expect(overallStatus([{ severity: 'MAJOR' }]).label).toContain('Major');
  });
});
