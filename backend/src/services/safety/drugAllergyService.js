'use strict';

const ruleRepository = require('../../repositories/ruleRepository');
const { FINDING_CATEGORY, FINDING_STATUS } = require('../../constants');
const { normalizeCase, similarity } = require('../../utils/text');

const collectDrugFacts = (medications) => {
  const drugIds = new Set();
  const ingredientIds = new Set();
  const drugClassIds = new Set();
  const drugById = new Map();

  for (const med of medications) {
    if (!med.drug) continue;
    drugIds.add(med.drug.id);
    drugById.set(med.drug.id, med.drug);
    if (med.drug.drugClassId) drugClassIds.add(med.drug.drugClassId);
    for (const entry of med.drug.ingredients || []) ingredientIds.add(entry.ingredientId);
  }

  return {
    drugIds: [...drugIds],
    ingredientIds: [...ingredientIds],
    drugClassIds: [...drugClassIds],
    drugById,
  };
};

const drugsMatchingRule = (rule, medications) =>
  medications
    .filter((med) => {
      if (!med.drug) return false;
      if (rule.drugId) return med.drug.id === rule.drugId;
      if (rule.ingredientId) {
        return (med.drug.ingredients || []).some((entry) => entry.ingredientId === rule.ingredientId);
      }
      if (rule.drugClassId) return med.drug.drugClassId === rule.drugClassId;
      return false;
    })
    .map((med) => med.drug);

/**
 * Allergy checking is rule driven only. When a patient's allergen merely looks
 * similar to something they take, the result is REVIEW_REQUIRED rather than an
 * invented relationship.
 */
const check = async ({ medications, allergies }) => {
  if (allergies.length === 0 || medications.length === 0) return { findings: [] };

  const { drugIds, ingredientIds, drugClassIds } = collectDrugFacts(medications);
  const rules = await ruleRepository.findAllergyRules({ drugIds, ingredientIds, drugClassIds });

  const findings = [];
  const coveredAllergens = new Set();

  for (const allergy of allergies) {
    const allergen = normalizeCase(allergy.allergen);
    const matchedRules = rules.filter((rule) => normalizeCase(rule.allergen) === allergen);

    for (const rule of matchedRules) {
      const drugs = drugsMatchingRule(rule, medications);
      for (const drug of drugs) {
        coveredAllergens.add(allergen);
        findings.push({
          category: FINDING_CATEGORY.DRUG_ALLERGY,
          severity: rule.severity,
          title: `Allergy risk: ${drug.genericName} and documented allergy to ${allergy.allergen}`,
          description: rule.description,
          clinicalEffect: allergy.reaction
            ? `Documented reaction: ${allergy.reaction} (${allergy.severity}).`
            : `Documented allergy severity: ${allergy.severity}.`,
          management: rule.management,
          // Uncertain relationships are surfaced for a clinician instead of being asserted.
          status: rule.certain ? FINDING_STATUS.OPEN : FINDING_STATUS.REVIEW_REQUIRED,
          ruleId: rule.id,
          ruleVersion: rule.version,
          dedupeKey: `DRUG_ALLERGY:${rule.id}:${drug.id}`,
          subjectDrugIds: [drug.id],
          evidenceRefs: [
            { sourceId: rule.sourceId, documentId: rule.documentId, evidenceLevel: rule.evidenceLevel, source: rule.source },
          ],
        });
      }
    }

    if (coveredAllergens.has(allergen)) continue;

    // No curated rule: look for a name resemblance and flag it for review only.
    for (const med of medications) {
      const names = [
        med.drug ? med.drug.genericName : null,
        med.drug ? med.drug.brandName : null,
        med.rawName,
        ...(med.drug ? (med.drug.ingredients || []).map((entry) => entry.ingredient.name) : []),
      ].filter(Boolean);

      const resembles = names.some((name) => similarity(normalizeCase(name), allergen) >= 0.8);
      if (!resembles) continue;

      findings.push({
        category: FINDING_CATEGORY.DRUG_ALLERGY,
        severity: 'INFORMATIONAL',
        title: `Possible allergy relationship requires review: ${allergy.allergen}`,
        description: `The documented allergen "${allergy.allergen}" resembles "${med.drug ? med.drug.genericName : med.rawName}", but no verified allergy rule exists for this combination.`,
        status: FINDING_STATUS.REVIEW_REQUIRED,
        dedupeKey: `DRUG_ALLERGY:REVIEW:${allergen}:${med.drugId || med.rawName}`,
        subjectDrugIds: med.drugId ? [med.drugId] : [],
        evidenceRefs: [],
      });
    }
  }

  return { findings };
};

module.exports = { check };
