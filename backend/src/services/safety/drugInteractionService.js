'use strict';

const ruleRepository = require('../../repositories/ruleRepository');
const { FINDING_CATEGORY, FINDING_STATUS } = require('../../constants');
const { generatePairs, orderedPairKey } = require('./pairs');

const displayName = (drug) => (drug.brandName ? `${drug.genericName} (${drug.brandName})` : drug.genericName);

/**
 * Checks every unique medication pair against curated interaction rules.
 * Pair order is irrelevant: A+B and B+A resolve to the same stored rule.
 */
const check = async ({ medications }) => {
  const identified = medications.filter((med) => med.drugId);
  const unknown = medications.filter((med) => !med.drugId);

  const uniqueDrugIds = [...new Set(identified.map((med) => med.drugId))];
  const pairs = generatePairs(uniqueDrugIds).map(([drugAId, drugBId]) => ({ drugAId, drugBId }));

  const findings = [];

  // Medications that could not be identified cannot be checked; say so explicitly.
  for (const med of unknown) {
    findings.push({
      category: FINDING_CATEGORY.DRUG_DRUG,
      severity: 'INFORMATIONAL',
      title: 'Medication could not be identified',
      description: `"${med.rawName || 'Unnamed medication'}" is not linked to a drug record, so interaction checking could not be performed for it.`,
      status: FINDING_STATUS.REVIEW_REQUIRED,
      dedupeKey: `DRUG_DRUG:UNKNOWN:${(med.rawName || med.id || '').toLowerCase()}`,
      subjectDrugIds: [],
      evidenceRefs: [],
    });
  }

  if (pairs.length === 0) {
    return { findings, pairsChecked: 0 };
  }

  const rules = await ruleRepository.findInteractionsForPairs(pairs);
  const byPair = new Map();
  for (const rule of rules) {
    const key = orderedPairKey(rule.drugAId, rule.drugBId);
    // Only the highest stored version of a pair rule is applied.
    const current = byPair.get(key);
    if (!current || rule.version > current.version) byPair.set(key, rule);
  }

  for (const { drugAId, drugBId } of pairs) {
    const rule = byPair.get(orderedPairKey(drugAId, drugBId));
    if (!rule) continue;
    const drugA = rule.drugA;
    const drugB = rule.drugB;
    findings.push({
      category: FINDING_CATEGORY.DRUG_DRUG,
      severity: rule.severity,
      title: `${displayName(drugA)} + ${displayName(drugB)}`,
      description: rule.clinicalEffect,
      clinicalEffect: rule.clinicalEffect,
      mechanism: rule.mechanism,
      management: rule.management,
      status: FINDING_STATUS.OPEN,
      ruleId: rule.id,
      ruleVersion: rule.version,
      dedupeKey: `DRUG_DRUG:${orderedPairKey(rule.drugAId, rule.drugBId)}`,
      subjectDrugIds: [rule.drugAId, rule.drugBId],
      evidenceRefs: [{ sourceId: rule.sourceId, documentId: rule.documentId, evidenceLevel: rule.evidenceLevel, source: rule.source }],
    });
  }

  return { findings, pairsChecked: pairs.length };
};

module.exports = { check };
