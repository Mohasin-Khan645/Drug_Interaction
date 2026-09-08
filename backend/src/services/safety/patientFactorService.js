'use strict';

const ruleRepository = require('../../repositories/ruleRepository');
const { FINDING_CATEGORY, FINDING_STATUS } = require('../../constants');

const compare = (value, operator, threshold) => {
  switch (operator) {
    case 'LT':
      return value < threshold;
    case 'LTE':
      return value <= threshold;
    case 'GT':
      return value > threshold;
    case 'GTE':
      return value >= threshold;
    case 'EQ':
      return value === threshold;
    default:
      return false;
  }
};

const ageInYears = (dateOfBirth) => {
  if (!dateOfBirth) return null;
  const diff = Date.now() - new Date(dateOfBirth).getTime();
  return diff / (365.25 * 24 * 60 * 60 * 1000);
};

const latestLabValue = (labResults, code) => {
  const match = labResults
    .filter((lab) => lab.code === code)
    .sort((a, b) => new Date(b.takenAt) - new Date(a.takenAt))[0];
  return match ? match.value : null;
};

const resolveFactor = (rule, patient, labResults) => {
  switch (rule.factorType) {
    case 'AGE_MIN':
    case 'AGE_MAX':
      return { value: ageInYears(patient.dateOfBirth), label: 'age (years)' };
    case 'WEIGHT_MIN':
    case 'WEIGHT_MAX':
      return { value: patient.weightKg ?? null, label: 'weight (kg)' };
    case 'RENAL_FUNCTION':
    case 'HEPATIC_FUNCTION':
    case 'LAB_VALUE':
      return {
        value: rule.labCode ? latestLabValue(labResults, rule.labCode) : null,
        label: rule.labCode || 'lab value',
      };
    default:
      return { value: null, label: 'unknown factor' };
  }
};

/**
 * Applies explicit curated thresholds only. Missing data produces a
 * REVIEW_REQUIRED finding rather than an assumed value, and no dose is ever
 * calculated here.
 */
const check = async ({ medications, patient, labResults = [] }) => {
  const drugIds = [...new Set(medications.filter((med) => med.drugId).map((med) => med.drugId))];
  if (drugIds.length === 0) return { findings: [] };

  const rules = await ruleRepository.findPatientFactorRules(drugIds);
  const findings = [];

  for (const rule of rules) {
    const { value, label } = resolveFactor(rule, patient, labResults);

    if (value === null || value === undefined || Number.isNaN(value)) {
      findings.push({
        category: FINDING_CATEGORY.PATIENT_FACTOR,
        severity: 'INFORMATIONAL',
        title: `Missing ${label} needed to evaluate ${rule.drug.genericName}`,
        description: `A curated safety rule for ${rule.drug.genericName} depends on ${label}, which is not recorded for this patient.`,
        management: 'Record the missing patient data and re-run the safety check.',
        status: FINDING_STATUS.REVIEW_REQUIRED,
        ruleId: rule.id,
        ruleVersion: rule.version,
        dedupeKey: `PATIENT_FACTOR:MISSING:${rule.id}`,
        subjectDrugIds: [rule.drugId],
        evidenceRefs: [],
      });
      continue;
    }

    if (!compare(value, rule.operator, rule.threshold)) continue;

    findings.push({
      category: FINDING_CATEGORY.PATIENT_FACTOR,
      severity: rule.severity,
      title: `Patient factor alert: ${rule.drug.genericName}`,
      description: rule.description,
      clinicalEffect: `Observed ${label}: ${Number(value.toFixed ? value.toFixed(2) : value)}${rule.unit ? ` ${rule.unit}` : ''} (rule threshold ${rule.operator} ${rule.threshold}).`,
      management: rule.management,
      status: FINDING_STATUS.OPEN,
      ruleId: rule.id,
      ruleVersion: rule.version,
      dedupeKey: `PATIENT_FACTOR:${rule.id}`,
      subjectDrugIds: [rule.drugId],
      evidenceRefs: [
        { sourceId: rule.sourceId, documentId: rule.documentId, evidenceLevel: rule.evidenceLevel, source: rule.source },
      ],
    });
  }

  return { findings };
};

module.exports = { check, compare, ageInYears };
