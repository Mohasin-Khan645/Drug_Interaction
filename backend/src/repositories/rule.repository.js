import { prisma, isDatabaseAvailable } from '../config/database.js';

export const ruleRepository = {
  /**
   * Evaluates pairwise drug interaction regardless of input order (A+B == B+A)
   */
  async findInteractionPair(drugAId, drugBId) {
    if (!drugAId || !drugBId || drugAId === drugBId) return null;

    try {
      if (prisma && (await isDatabaseAvailable())) {
        return await prisma.drugInteraction.findFirst({
          where: {
            status: 'ACTIVE',
            OR: [
              { drugAId, drugBId },
              { drugAId: drugBId, drugBId: drugAId },
            ],
          },
          include: {
            drugA: true,
            drugB: true,
          },
        });
      }
    } catch {
      // Fallback
    }

    return null;
  },

  /**
   * Drug-Disease rules matching active conditions
   */
  async findDiseaseRules(drugIds, conditionNames = []) {
    if (!drugIds.length || !conditionNames.length) return [];

    try {
      if (prisma && (await isDatabaseAvailable())) {
        return await prisma.drugDiseaseRule.findMany({
          where: {
            status: 'ACTIVE',
            drugId: { in: drugIds },
            diseaseName: { in: conditionNames, mode: 'insensitive' },
          },
          include: { drug: true },
        });
      }
    } catch {
      // Fallback
    }

    return [];
  },

  /**
   * Drug-Allergy rules matching patient allergens or drug classes
   */
  async findAllergyRules(drugIds, allergens = []) {
    if (!drugIds.length || !allergens.length) return [];

    try {
      if (prisma && (await isDatabaseAvailable())) {
        return await prisma.drugAllergyRule.findMany({
          where: {
            status: 'ACTIVE',
            OR: [
              { drugId: { in: drugIds } },
              { allergenName: { in: allergens, mode: 'insensitive' } },
            ],
          },
          include: { drug: true },
        });
      }
    } catch {
      // Fallback
    }

    return [];
  },

  /**
   * Duplication rules for same active ingredient or class
   */
  async findDuplicationRules(ingredients = [], drugClasses = []) {
    try {
      if (prisma && (await isDatabaseAvailable())) {
        return await prisma.duplicationRule.findMany({
          where: {
            status: 'ACTIVE',
            OR: [
              { activeIngredient: { in: ingredients, mode: 'insensitive' } },
              { drugClass: { in: drugClasses, mode: 'insensitive' } },
            ],
          },
        });
      }
    } catch {
      // Fallback
    }

    return [];
  },

  /**
   * Patient Factor rules (age, eGFR, CrCl, hepatic)
   */
  async findPatientFactorRules(drugIds = []) {
    if (!drugIds.length) return [];

    try {
      if (prisma && (await isDatabaseAvailable())) {
        return await prisma.patientFactorRule.findMany({
          where: {
            status: 'ACTIVE',
            drugId: { in: drugIds },
          },
        });
      }
    } catch {
      // Fallback
    }

    return [];
  },

  async getAllRules(params = {}) {
    const { ruleType } = params;

    try {
      if (prisma && (await isDatabaseAvailable())) {
        const [interactions, diseaseRules, allergyRules, duplicationRules, factorRules] = await Promise.all([
          prisma.drugInteraction.findMany({ include: { drugA: true, drugB: true } }),
          prisma.drugDiseaseRule.findMany({ include: { drug: true } }),
          prisma.drugAllergyRule.findMany({ include: { drug: true } }),
          prisma.duplicationRule.findMany(),
          prisma.patientFactorRule.findMany(),
        ]);

        const formattedInteractions = interactions.map((i) => ({
          id: i.id,
          ruleType: 'DRUG_DRUG',
          primaryDrugId: i.drugA?.brandName || i.drugAId,
          secondaryEntity: i.drugB?.brandName || i.drugBId,
          severity: i.severity,
          title: i.title,
          clinicalEffect: i.clinicalEffect,
          mechanism: i.mechanism,
          recommendation: i.management,
          evidenceSource: i.sourceId || 'FDA Labeling',
          evidenceLevel: i.evidenceLevel,
          status: i.status,
        }));

        const formattedDisease = diseaseRules.map((d) => ({
          id: d.id,
          ruleType: 'DRUG_DISEASE',
          primaryDrugId: d.drug?.brandName || d.drugId,
          secondaryEntity: d.diseaseName,
          severity: d.severity,
          title: d.title,
          clinicalEffect: d.description,
          mechanism: d.mechanism || 'Disease pathophysiology conflict',
          recommendation: d.management,
          evidenceSource: d.sourceId || 'Clinical Practice Guidelines',
          evidenceLevel: d.evidenceLevel,
          status: d.status,
        }));

        const formattedAllergy = allergyRules.map((a) => ({
          id: a.id,
          ruleType: 'DRUG_ALLERGY',
          primaryDrugId: a.drug?.brandName || a.drugId,
          secondaryEntity: a.allergenName,
          severity: a.severity,
          title: a.title,
          clinicalEffect: a.description,
          mechanism: a.mechanism || 'IgE / Hypersensitivity reaction',
          recommendation: a.management,
          evidenceSource: a.sourceId || 'Clinical Guidelines',
          evidenceLevel: a.evidenceLevel,
          status: a.status,
        }));

        const formattedDup = duplicationRules.map((dp) => ({
          id: dp.id,
          ruleType: 'DUPLICATION',
          primaryDrugId: dp.activeIngredient || dp.drugClass,
          secondaryEntity: 'Therapeutic Duplicate',
          severity: dp.severity,
          title: dp.title,
          clinicalEffect: dp.description,
          mechanism: 'Additive systemic dose toxicity',
          recommendation: dp.management,
          evidenceSource: 'FDA Advisory',
          evidenceLevel: 'Level 1',
          status: dp.status,
        }));

        const formattedFactor = factorRules.map((f) => ({
          id: f.id,
          ruleType: 'PATIENT_FACTOR',
          primaryDrugId: f.drugId || 'Patient Parameter',
          secondaryEntity: `${f.factorType} ${f.conditionOperator} ${f.thresholdValue}`,
          severity: f.severity,
          title: f.title,
          clinicalEffect: f.description,
          mechanism: 'Altered clearance or organ sensitivity',
          recommendation: f.management,
          evidenceSource: 'FDA Package Warning',
          evidenceLevel: 'Level 1',
          status: f.status,
        }));

        let allRules = [
          ...formattedInteractions,
          ...formattedDisease,
          ...formattedAllergy,
          ...formattedDup,
          ...formattedFactor,
        ];

        if (ruleType) {
          allRules = allRules.filter((r) => r.ruleType === ruleType);
        }

        if (allRules.length > 0) return allRules;
      }
    } catch {
      // Fallback
    }

    return [
      {
        id: 'rule-dd-01',
        ruleType: 'DRUG_DRUG',
        primaryDrugId: 'Warfarin',
        secondaryEntity: 'Aspirin',
        severity: 'CRITICAL',
        title: 'Severe Gastrointestinal & Major Hemorrhage Risk',
        clinicalEffect: 'Concurrent administration markedly potentiates systemic bleeding risk.',
        mechanism: 'Additive VKA and antiplatelet inhibition.',
        recommendation: 'Avoid combination unless specifically indicated.',
        evidenceSource: 'FDA Approved Package Labeling & CHEST Guidelines',
        evidenceLevel: 'Level 1 (RCT / Meta-analysis)',
        status: 'ACTIVE',
      },
    ];
  },
};

