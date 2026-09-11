import { describe, it, expect } from 'vitest';
import { NormalizationService } from '../../src/services/normalization.service.js';

describe('NormalizationService Unit Tests', () => {
  it('should clean raw prescription text and remove OCR noise', () => {
    const raw = 'Rx:  Amoxicillin 500mg (Take 1 cap TID) !!!';
    const cleaned = NormalizationService.cleanText(raw);
    expect(cleaned).toContain('Amoxicillin 500mg');
    expect(cleaned).not.toContain('!!!');
    expect(cleaned).not.toContain('Rx:');
  });

  it('should calculate string similarity scores correctly', () => {
    const scoreExact = NormalizationService.similarityScore('Warfarin', 'Warfarin');
    expect(scoreExact).toBe(1.0);

    const scoreCase = NormalizationService.similarityScore('warfarin', 'WARFARIN');
    expect(scoreCase).toBe(1.0);

    const scoreFuzzy = NormalizationService.similarityScore('Lisinoprl', 'Lisinopril');
    expect(scoreFuzzy).toBeGreaterThan(0.7);

    const scoreDifferent = NormalizationService.similarityScore('Metformin', 'Aspirin');
    expect(scoreDifferent).toBeLessThan(0.4);
  });

  it('should not automatically confirm low-confidence matches', async () => {
    const result = await NormalizationService.normalize('Xylk-unknown-compound-99');
    expect(result.normalized).toBe(false);
  });
});

