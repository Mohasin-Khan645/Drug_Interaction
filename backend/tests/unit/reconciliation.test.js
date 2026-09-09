'use strict';

jest.mock('../../src/repositories/drugRepository', () => ({
  findById: jest.fn(),
  searchCandidates: jest.fn(),
  findByIdentifier: jest.fn(),
}));

const drugRepository = require('../../src/repositories/drugRepository');
const reconciliationService = require('../../src/services/medicationReconciliationService');

const ibuprofen = {
  id: 'd1',
  genericName: 'Ibuprofen',
  brandName: 'Advil',
  aliases: [],
  ingredients: [{ ingredientId: 'i1', ingredient: { name: 'ibuprofen' } }],
};
const combo = {
  id: 'd2',
  genericName: 'Ibuprofen/Caffeine',
  brandName: null,
  aliases: [],
  ingredients: [{ ingredientId: 'i1', ingredient: { name: 'ibuprofen' } }],
};

const existing = (overrides = {}) => ({
  id: 'm1',
  drugId: 'd1',
  drug: ibuprofen,
  status: 'ACTIVE',
  strength: '200mg',
  ...overrides,
});

beforeEach(() => {
  jest.resetAllMocks();
  drugRepository.findById.mockImplementation(async (id) => ({ d1: ibuprofen, d2: combo })[id] || null);
  drugRepository.searchCandidates.mockResolvedValue([]);
  drugRepository.findByIdentifier.mockResolvedValue(null);
});

describe('medication reconciliation', () => {
  it('flags the same drug as a duplicate candidate', async () => {
    const result = await reconciliationService.reconcile({
      existingMedications: [existing()],
      incoming: [{ drugId: 'd1' }],
    });
    expect(result.duplicateCandidates).toHaveLength(1);
    expect(result.confirmedCandidates).toHaveLength(0);
  });

  it('flags a shared ingredient across different drugs', async () => {
    const result = await reconciliationService.reconcile({
      existingMedications: [existing()],
      incoming: [{ drugId: 'd2' }],
    });
    expect(result.duplicateCandidates[0].reason).toMatch(/ingredient/i);
  });

  it('marks unmatched free text as review required rather than guessing', async () => {
    const result = await reconciliationService.reconcile({
      existingMedications: [],
      incoming: [{ rawText: 'unreadable scribble' }],
    });
    expect(result.reviewRequired).toHaveLength(1);
  });

  it('passes a new, unrelated drug through as a confirmed candidate', async () => {
    const result = await reconciliationService.reconcile({
      existingMedications: [],
      incoming: [{ drugId: 'd1' }],
    });
    expect(result.confirmedCandidates).toHaveLength(1);
  });

  it('reports conflicting strengths for the same drug', async () => {
    const result = await reconciliationService.reconcile({
      existingMedications: [existing()],
      incoming: [{ drugId: 'd1', strength: '400mg' }],
    });
    expect(result.duplicateCandidates[0].conflicting).toHaveLength(1);
  });
});
