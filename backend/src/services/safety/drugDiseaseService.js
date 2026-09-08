'use strict';

const ruleRepository = require('../../repositories/ruleRepository');
const { FINDING_CATEGORY, FINDING_STATUS } = require('../../constants');

const check = async ({ medications, conditions }) => {
  const drugIds = [...new Set(medications.filter((med) => med.drugId).map((med) => med.drugId))];
  const activeConditions = conditions.filter((condition) => condition.status === 'ACTIVE');
  const conditionIds = activeConditions.map((condition) => condition.conditionId);

  if (drugIds.length === 0 || conditionIds.length === 0) return { findings: [] };

  const rules = await ruleRepository.findDiseaseRules(drugIds, conditionIds);

  const findings = rules.map((rule) => ({
    category: FINDING_CATEGORY.DRUG_DISEASE,
    severity: rule.severity,
    title: `${rule.ruleType}: ${rule.drug.genericName} with ${rule.condition.name}`,
    description: rule.description,
    clinicalEffect: rule.description,
    management: rule.management,
    status: FINDING_STATUS.OPEN,
    ruleId: rule.id,
    ruleVersion: rule.version,
    dedupeKey: `DRUG_DISEASE:${rule.drugId}:${rule.conditionId}`,
    subjectDrugIds: [rule.drugId],
    evidenceRefs: [
      { sourceId: rule.sourceId, documentId: rule.documentId, evidenceLevel: rule.evidenceLevel, source: rule.source },
    ],
  }));

  return { findings };
};

module.exports = { check };
