'use strict';

jest.mock('../../src/repositories/ruleRepository', () => ({
  findInteractionsForPairs: jest.fn(),
  findDiseaseRules: jest.fn(),
  findAllergyRules: jest.fn(),
  listDuplicationRules: jest.fn(),
  findPatientFactorRules: jest.fn(),
}));

const ruleRepository = require('../../src/repositories/ruleRepository');
const drugInteractionService = require('../../src/services/safety/drugInteractionService');
const drugDiseaseService = require('../../src/services/safety/drugDiseaseService');
const drugAllergyService = require('../../src/services/safety/drugAllergyService');
const duplicationService = require('../../src/services/safety/duplicationService');
const patientFactorService = require('../../src/services/safety/patientFactorService');

const drug = (id, genericName, extra = {}) => ({
  id,
  genericName,
  brandName: null,
  drugClassId: null,
  ingredients: [],
  ...extra,
});

const medication = (id, drugRecord) => ({ id, drugId: drugRecord ? drugRecord.id : null, drug: drugRecord });

beforeEach(() => {
  jest.resetAllMocks();
  ruleRepository.findInteractionsForPairs.mockResolvedValue([]);
  ruleRepository.findDiseaseRules.mockResolvedValue([]);
  ruleRepository.findAllergyRules.mockResolvedValue([]);
  ruleRepository.listDuplicationRules.mockResolvedValue([]);
  ruleRepository.findPatientFactorRules.mockResolvedValue([]);
});

describe('drug-drug interactions', () => {
  const warfarin = drug('a', 'Warfarin');
  const ibuprofen = drug('b', 'Ibuprofen');
  const rule = {
    id: 'rule-1',
    drugAId: 'a',
    drugBId: 'b',
    drugA: warfarin,
    drugB: ibuprofen,
    severity: 'MAJOR',
    version: 1,
    clinicalEffect: 'Bleeding risk',
    mechanism: 'Additive',
    management: 'Monitor',
  };

  it('returns nothing for zero or one medication', async () => {
    await expect(drugInteractionService.check({ medications: [] })).resolves.toMatchObject({
      findings: [],
      pairsChecked: 0,
    });
    await expect(
      drugInteractionService.check({ medications: [medication('m1', warfarin)] })
    ).resolves.toMatchObject({ findings: [], pairsChecked: 0 });
  });

  it('matches a curated rule regardless of medication order', async () => {
    ruleRepository.findInteractionsForPairs.mockResolvedValue([rule]);
    const forward = await drugInteractionService.check({
      medications: [medication('m1', warfarin), medication('m2', ibuprofen)],
    });
    const reversed = await drugInteractionService.check({
      medications: [medication('m2', ibuprofen), medication('m1', warfarin)],
    });
    expect(forward.findings).toHaveLength(1);
    expect(forward.findings[0].dedupeKey).toBe(reversed.findings[0].dedupeKey);
    expect(forward.findings[0].severity).toBe('MAJOR');
  });

  it('checks three medications as three pairs', async () => {
    const result = await drugInteractionService.check({
      medications: [medication('m1', warfarin), medication('m2', ibuprofen), medication('m3', drug('c', 'Metformin'))],
    });
    expect(result.pairsChecked).toBe(3);
  });

  it('flags unidentified medications for review instead of guessing', async () => {
    const result = await drugInteractionService.check({
      medications: [{ id: 'm9', drugId: null, rawName: 'blue pill' }],
    });
    expect(result.findings[0]).toMatchObject({ status: 'REVIEW_REQUIRED', severity: 'INFORMATIONAL' });
  });

  it('applies the highest stored rule version for a pair', async () => {
    ruleRepository.findInteractionsForPairs.mockResolvedValue([
      { ...rule, version: 1, severity: 'MINOR' },
      { ...rule, id: 'rule-2', version: 2, severity: 'CRITICAL' },
    ]);
    const result = await drugInteractionService.check({
      medications: [medication('m1', warfarin), medication('m2', ibuprofen)],
    });
    expect(result.findings[0]).toMatchObject({ severity: 'CRITICAL', ruleVersion: 2 });
  });
});

describe('drug-disease rules', () => {
  it('flags an active condition against an explicit rule', async () => {
    const ibuprofen = drug('b', 'Ibuprofen');
    ruleRepository.findDiseaseRules.mockResolvedValue([
      {
        id: 'r',
        drugId: 'b',
        conditionId: 'c1',
        ruleType: 'CONTRAINDICATION',
        severity: 'CONTRAINDICATED',
        description: 'Avoid',
        version: 1,
        condition: { id: 'c1', name: 'Peptic ulcer disease' },
        drug: ibuprofen,
      },
    ]);
    const result = await drugDiseaseService.check({
      medications: [medication('m1', ibuprofen)],
      conditions: [{ conditionId: 'c1', status: 'ACTIVE', condition: { id: 'c1', name: 'Peptic ulcer disease' } }],
    });
    expect(result.findings).toHaveLength(1);
    expect(result.findings[0].severity).toBe('CONTRAINDICATED');
  });

  it('produces nothing without conditions', async () => {
    const result = await drugDiseaseService.check({
      medications: [medication('m1', drug('b', 'Ibuprofen'))],
      conditions: [],
    });
    expect(result.findings).toEqual([]);
  });
});

describe('drug-allergy rules', () => {
  const amoxicillin = drug('d1', 'Amoxicillin', { drugClassId: 'penicillins' });

  it('matches a class-level allergy rule', async () => {
    ruleRepository.findAllergyRules.mockResolvedValue([
      {
        id: 'ar',
        allergen: 'penicillin',
        relation: 'CLASS',
        drugClassId: 'penicillins',
        severity: 'CONTRAINDICATED',
        description: 'Avoid penicillins',
        certain: true,
        version: 1,
      },
    ]);
    const result = await drugAllergyService.check({
      medications: [medication('m1', amoxicillin)],
      allergies: [{ allergen: 'Penicillin' }],
    });
    expect(result.findings[0]).toMatchObject({ severity: 'CONTRAINDICATED', status: 'OPEN' });
  });

  it('does not invent a relationship when no rule matches', async () => {
    const result = await drugAllergyService.check({
      medications: [medication('m1', amoxicillin)],
      allergies: [{ allergen: 'pollen' }],
    });
    expect(result.findings.every((finding) => finding.status !== 'OPEN')).toBe(true);
  });

  it('marks uncertain curated relationships as review required', async () => {
    ruleRepository.findAllergyRules.mockResolvedValue([
      {
        id: 'ar',
        allergen: 'penicillin',
        relation: 'CROSS_SENSITIVITY',
        drugClassId: 'penicillins',
        severity: 'MODERATE',
        description: 'Possible cross sensitivity',
        certain: false,
        version: 1,
      },
    ]);
    const result = await drugAllergyService.check({
      medications: [medication('m1', amoxicillin)],
      allergies: [{ allergen: 'penicillin' }],
    });
    expect(result.findings[0].status).toBe('REVIEW_REQUIRED');
  });
});

describe('duplication', () => {
  it('detects the same drug twice', async () => {
    const metformin = drug('x', 'Metformin');
    const result = await duplicationService.check({
      medications: [medication('m1', metformin), medication('m2', metformin)],
    });
    expect(result.findings[0].dedupeKey).toBe('DUPLICATION:SAME_DRUG:x');
  });

  it('detects a shared ingredient across different drugs', async () => {
    const a = drug('a', 'Amoxicillin', { ingredients: [{ ingredientId: 'i1', ingredient: { name: 'amoxicillin' } }] });
    const b = drug('b', 'Amoxicillin/Clavulanate', {
      ingredients: [{ ingredientId: 'i1', ingredient: { name: 'amoxicillin' } }],
    });
    const result = await duplicationService.check({ medications: [medication('m1', a), medication('m2', b)] });
    expect(result.findings.some((finding) => finding.dedupeKey === 'DUPLICATION:SAME_INGREDIENT:i1')).toBe(true);
  });

  it('does not treat a shared class as duplication without an explicit rule', async () => {
    const a = drug('a', 'Ibuprofen', { drugClassId: 'nsaid' });
    const b = drug('b', 'Naproxen', { drugClassId: 'nsaid' });
    const result = await duplicationService.check({ medications: [medication('m1', a), medication('m2', b)] });
    expect(result.findings).toEqual([]);
  });

  it('reports therapeutic duplication when a curated class rule exists', async () => {
    ruleRepository.listDuplicationRules.mockResolvedValue([
      {
        id: 'dr',
        ruleType: 'THERAPEUTIC',
        drugClassId: 'nsaid',
        severity: 'MODERATE',
        description: 'Two NSAIDs',
        version: 1,
      },
    ]);
    const a = drug('a', 'Ibuprofen', { drugClassId: 'nsaid', drugClass: { name: 'NSAID' } });
    const b = drug('b', 'Naproxen', { drugClassId: 'nsaid', drugClass: { name: 'NSAID' } });
    const result = await duplicationService.check({ medications: [medication('m1', a), medication('m2', b)] });
    expect(result.findings[0].dedupeKey).toBe('DUPLICATION:THERAPEUTIC:nsaid');
  });
});

describe('patient factor rules', () => {
  const metformin = drug('x', 'Metformin');
  const rule = {
    id: 'fr',
    drugId: 'x',
    factorType: 'LAB_VALUE',
    labCode: 'EGFR',
    operator: 'LT',
    threshold: 30,
    severity: 'CONTRAINDICATED',
    description: 'Avoid below 30',
    version: 1,
    drug: metformin,
  };

  it('fires when the measured value crosses the threshold', async () => {
    ruleRepository.findPatientFactorRules.mockResolvedValue([rule]);
    const result = await patientFactorService.check({
      medications: [medication('m1', metformin)],
      patient: {},
      labResults: [{ code: 'EGFR', value: 20, takenAt: new Date() }],
    });
    expect(result.findings[0]).toMatchObject({ severity: 'CONTRAINDICATED', status: 'OPEN' });
  });

  it('does not fire when the value is within range', async () => {
    ruleRepository.findPatientFactorRules.mockResolvedValue([rule]);
    const result = await patientFactorService.check({
      medications: [medication('m1', metformin)],
      patient: {},
      labResults: [{ code: 'EGFR', value: 80, takenAt: new Date() }],
    });
    expect(result.findings).toEqual([]);
  });

  it('requests review instead of assuming a value when patient data is missing', async () => {
    ruleRepository.findPatientFactorRules.mockResolvedValue([rule]);
    const result = await patientFactorService.check({
      medications: [medication('m1', metformin)],
      patient: {},
      labResults: [],
    });
    expect(result.findings[0]).toMatchObject({ status: 'REVIEW_REQUIRED', severity: 'INFORMATIONAL' });
  });
});
