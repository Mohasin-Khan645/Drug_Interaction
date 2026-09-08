'use strict';

const drugInteractionService = require('./drugInteractionService');
const drugDiseaseService = require('./drugDiseaseService');
const drugAllergyService = require('./drugAllergyService');
const duplicationService = require('./duplicationService');
const patientFactorService = require('./patientFactorService');
const prioritizationService = require('./prioritizationService');
const { attachEvidence } = require('./evidenceAttachmentService');
const ApiError = require('../../utils/apiError');

const validateInput = ({ patient, medications, conditions, allergies, labResults }) => {
  if (!patient || !patient.id) throw ApiError.badRequest('A patient is required to run a safety check');
  if (!Array.isArray(medications)) throw ApiError.badRequest('medications must be an array');
  if (!Array.isArray(conditions)) throw ApiError.badRequest('conditions must be an array');
  if (!Array.isArray(allergies)) throw ApiError.badRequest('allergies must be an array');
  if (labResults && !Array.isArray(labResults)) throw ApiError.badRequest('labResults must be an array');
};

// Only medications that are actually being taken are evaluated.
const normalizeMedications = (medications) =>
  medications
    .filter((med) => !med.status || med.status === 'ACTIVE')
    .map((med) => ({
      id: med.id,
      drugId: med.drugId || (med.drug ? med.drug.id : null),
      drug: med.drug || null,
      rawName: med.rawName || (med.drug ? med.drug.genericName : null),
      strength: med.strength,
      route: med.route,
      frequency: med.frequency,
      status: med.status || 'ACTIVE',
    }));

/**
 * Deterministic clinical pipeline. Every finding it produces comes from a
 * curated rule or from an explicit statement that something could not be
 * evaluated.
 */
const evaluate = async (input) => {
  validateInput(input);

  const medications = normalizeMedications(input.medications);
  const conditions = input.conditions || [];
  const allergies = input.allergies || [];
  const labResults = input.labResults || [];

  const [interaction, disease, allergy, duplication, factor] = await Promise.all([
    drugInteractionService.check({ medications }),
    drugDiseaseService.check({ medications, conditions }),
    drugAllergyService.check({ medications, allergies }),
    duplicationService.check({ medications }),
    patientFactorService.check({ medications, patient: input.patient, labResults }),
  ]);

  const raw = [
    ...interaction.findings,
    ...disease.findings,
    ...allergy.findings,
    ...duplication.findings,
    ...factor.findings,
  ];

  const withEvidence = await attachEvidence(raw);
  const deduplicated = prioritizationService.deduplicate(withEvidence);
  const findings = prioritizationService.prioritize(deduplicated);

  return {
    findings,
    summary: {
      ...prioritizationService.summarize(findings),
      medicationsEvaluated: medications.length,
      pairsChecked: interaction.pairsChecked || 0,
      conditionsEvaluated: conditions.filter((condition) => condition.status === 'ACTIVE').length,
      allergiesEvaluated: allergies.length,
    },
  };
};

module.exports = { evaluate, normalizeMedications, validateInput };
