'use strict';

const { deduplicate, prioritize, summarize } = require('../../src/services/safety/prioritizationService');

const finding = (overrides) => ({
  category: 'DRUG_DRUG',
  severity: 'MODERATE',
  title: 'Finding',
  status: 'OPEN',
  dedupeKey: 'key',
  ...overrides,
});

describe('prioritization', () => {
  it('keeps the most severe finding when dedupe keys collide', () => {
    const result = deduplicate([
      finding({ severity: 'MINOR', dedupeKey: 'same' }),
      finding({ severity: 'CRITICAL', dedupeKey: 'same' }),
      finding({ severity: 'MODERATE', dedupeKey: 'other' }),
    ]);
    expect(result).toHaveLength(2);
    expect(result.find((item) => item.dedupeKey === 'same').severity).toBe('CRITICAL');
  });

  it('orders by severity and keeps lower severity findings visible', () => {
    const ordered = prioritize([
      finding({ severity: 'INFORMATIONAL', title: 'info' }),
      finding({ severity: 'CONTRAINDICATED', title: 'stop' }),
      finding({ severity: 'MAJOR', title: 'major' }),
    ]);
    expect(ordered.map((item) => item.severity)).toEqual(['CONTRAINDICATED', 'MAJOR', 'INFORMATIONAL']);
    expect(ordered).toHaveLength(3);
  });

  it('floats review-required findings above resolved ones of equal severity', () => {
    const ordered = prioritize([
      finding({ severity: 'MAJOR', title: 'b', status: 'OPEN' }),
      finding({ severity: 'MAJOR', title: 'a', status: 'REVIEW_REQUIRED' }),
    ]);
    expect(ordered[0].status).toBe('REVIEW_REQUIRED');
  });

  it('summarizes counts, highest severity and review load', () => {
    const summary = summarize([
      finding({ severity: 'MAJOR', category: 'DRUG_DRUG' }),
      finding({ severity: 'MINOR', category: 'DUPLICATION', status: 'REVIEW_REQUIRED' }),
    ]);
    expect(summary).toMatchObject({
      totalFindings: 2,
      highestSeverity: 'MAJOR',
      reviewRequired: 1,
      byCategory: { DRUG_DRUG: 1, DUPLICATION: 1 },
    });
  });

  it('reports no highest severity for an empty finding list', () => {
    expect(summarize([])).toMatchObject({ totalFindings: 0, highestSeverity: null });
  });
});
