'use strict';

jest.mock('../../src/repositories/drugRepository', () => ({
  searchCandidates: jest.fn(),
  findByIdentifier: jest.fn(),
}));

const drugRepository = require('../../src/repositories/drugRepository');
const normalizationService = require('../../src/services/normalizationService');

const ibuprofen = {
  id: 'd1',
  genericName: 'Ibuprofen',
  brandName: 'Advil',
  aliases: [{ alias: 'brufen' }],
  ingredients: [{ ingredientId: 'i1', ingredient: { name: 'ibuprofen' } }],
};

beforeEach(() => {
  jest.resetAllMocks();
  drugRepository.searchCandidates.mockResolvedValue([ibuprofen]);
  drugRepository.findByIdentifier.mockResolvedValue(null);
});

describe('normalization', () => {
  it('cleans OCR noise, extracts the dosage and matches the brand name', async () => {
    const result = await normalizationService.normalize('  ADVIL   200mg  tab ');
    expect(result.strength).toBe('200mg');
    expect(result.candidates[0]).toMatchObject({ candidateDrugId: 'd1', matchType: 'BRAND' });
    expect(result.requiresReview).toBe(false);
  });

  it('matches the generic name case-insensitively', async () => {
    const result = await normalizationService.normalize('ibuprofen');
    expect(result.candidates[0].matchType).toBe('GENERIC');
  });

  it('scores a misspelling below the auto-confirm threshold and asks for review', async () => {
    const result = await normalizationService.normalize('ibuprofn');
    expect(result.requiresReview).toBe(true);
    expect(result.candidates[0].confidence).toBeLessThan(0.9);
  });

  it('returns no candidates for unrelated text', async () => {
    drugRepository.searchCandidates.mockResolvedValue([]);
    const result = await normalizationService.normalize('completely unknown substance');
    expect(result.candidates).toEqual([]);
    expect(result.requiresReview).toBe(true);
  });

  it('requires review for empty input', async () => {
    const result = await normalizationService.normalize('   ');
    expect(result.requiresReview).toBe(true);
  });
});
