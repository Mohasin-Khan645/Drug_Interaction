'use strict';

const ruleRepository = require('../../repositories/ruleRepository');
const { FINDING_CATEGORY, FINDING_STATUS } = require('../../constants');

const groupBy = (items, keyFn) => {
  const map = new Map();
  for (const item of items) {
    for (const key of [].concat(keyFn(item))) {
      if (!key) continue;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(item);
    }
  }
  return map;
};

/**
 * Duplication is reported for the same drug, the same ingredient, and for
 * therapeutic classes that have an explicit curated rule. Sharing a class is
 * not by itself treated as unsafe.
 */
const check = async ({ medications }) => {
  const rules = await ruleRepository.listDuplicationRules();
  const findings = [];

  const sameDrugRule = rules.find((rule) => rule.ruleType === 'SAME_DRUG');
  const byDrug = groupBy(
    medications.filter((med) => med.drugId),
    (med) => med.drugId
  );
  for (const [drugId, meds] of byDrug) {
    if (meds.length < 2) continue;
    const drug = meds[0].drug;
    findings.push({
      category: FINDING_CATEGORY.DUPLICATION,
      severity: sameDrugRule ? sameDrugRule.severity : 'MODERATE',
      title: `Duplicate medication: ${drug ? drug.genericName : drugId}`,
      description:
        (sameDrugRule && sameDrugRule.description) ||
        'The same drug appears more than once in the active medication list.',
      management: sameDrugRule ? sameDrugRule.management : undefined,
      status: FINDING_STATUS.OPEN,
      ruleId: sameDrugRule ? sameDrugRule.id : null,
      ruleVersion: sameDrugRule ? sameDrugRule.version : null,
      dedupeKey: `DUPLICATION:SAME_DRUG:${drugId}`,
      subjectDrugIds: [drugId],
      evidenceRefs: sameDrugRule
        ? [{ sourceId: sameDrugRule.sourceId, documentId: sameDrugRule.documentId, evidenceLevel: sameDrugRule.evidenceLevel, source: sameDrugRule.source }]
        : [],
    });
  }

  const ingredientRules = rules.filter((rule) => rule.ruleType === 'SAME_INGREDIENT');
  const byIngredient = groupBy(
    medications.filter((med) => med.drug),
    (med) => (med.drug.ingredients || []).map((entry) => entry.ingredientId)
  );
  for (const [ingredientId, meds] of byIngredient) {
    const distinctDrugs = [...new Set(meds.map((med) => med.drugId))];
    if (distinctDrugs.length < 2) continue;
    const rule =
      ingredientRules.find((candidate) => candidate.ingredientId === ingredientId) ||
      ingredientRules.find((candidate) => !candidate.ingredientId);
    const ingredientName =
      (meds[0].drug.ingredients || []).find((entry) => entry.ingredientId === ingredientId)?.ingredient?.name ||
      'shared ingredient';
    findings.push({
      category: FINDING_CATEGORY.DUPLICATION,
      severity: rule ? rule.severity : 'MODERATE',
      title: `Duplicate ingredient: ${ingredientName}`,
      description:
        (rule && rule.description) ||
        `More than one active medication contains ${ingredientName}, which can lead to unintended cumulative dosing.`,
      management: rule ? rule.management : undefined,
      status: FINDING_STATUS.OPEN,
      ruleId: rule ? rule.id : null,
      ruleVersion: rule ? rule.version : null,
      dedupeKey: `DUPLICATION:SAME_INGREDIENT:${ingredientId}`,
      subjectDrugIds: distinctDrugs,
      evidenceRefs: rule
        ? [{ sourceId: rule.sourceId, documentId: rule.documentId, evidenceLevel: rule.evidenceLevel, source: rule.source }]
        : [],
    });
  }

  const therapeuticRules = rules.filter((rule) => rule.ruleType === 'THERAPEUTIC' && rule.drugClassId);
  for (const rule of therapeuticRules) {
    const meds = medications.filter((med) => med.drug && med.drug.drugClassId === rule.drugClassId);
    const distinctDrugs = [...new Set(meds.map((med) => med.drugId))];
    if (distinctDrugs.length < 2) continue;
    findings.push({
      category: FINDING_CATEGORY.DUPLICATION,
      severity: rule.severity,
      title: `Therapeutic duplication: ${meds[0].drug.drugClass ? meds[0].drug.drugClass.name : 'configured class'}`,
      description: rule.description,
      management: rule.management,
      status: FINDING_STATUS.OPEN,
      ruleId: rule.id,
      ruleVersion: rule.version,
      dedupeKey: `DUPLICATION:THERAPEUTIC:${rule.drugClassId}`,
      subjectDrugIds: distinctDrugs,
      evidenceRefs: [
        { sourceId: rule.sourceId, documentId: rule.documentId, evidenceLevel: rule.evidenceLevel, source: rule.source },
      ],
    });
  }

  return { findings };
};

module.exports = { check };
