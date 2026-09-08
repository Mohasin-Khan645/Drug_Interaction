'use strict';

const prisma = require('../config/prisma');
const medicationRepository = require('../repositories/medicationRepository');
const prescriptionRepository = require('../repositories/prescriptionRepository');
const drugRepository = require('../repositories/drugRepository');
const normalizationService = require('./normalizationService');
const auditService = require('./auditService');
const ApiError = require('../utils/apiError');
const { AUDIT_ACTIONS, CONFIDENCE } = require('../constants');
const { normalizeCase } = require('../utils/text');
const { ACCESS_LEVEL, assertPatientAccess } = require('./patientAccessService');

const OUTCOME = Object.freeze({
  CONFIRMED: 'CONFIRMED_CANDIDATE',
  DUPLICATE: 'DUPLICATE_CANDIDATE',
  REVIEW_REQUIRED: 'REVIEW_REQUIRED',
});

const describeExisting = (med) => ({
  medicationId: med.id,
  drugId: med.drugId,
  name: med.drug ? med.drug.genericName : med.rawName,
  strength: med.strength,
  status: med.status,
});

const ingredientIdsOf = (drug) => (drug && drug.ingredients ? drug.ingredients.map((entry) => entry.ingredientId) : []);

/**
 * Compares a set of incoming medications against what the patient already
 * takes. It classifies; it never writes and never removes anything.
 */
const reconcile = async ({ existingMedications, incoming }) => {
  const active = existingMedications.filter((med) => med.status === 'ACTIVE');
  const results = [];

  for (const item of incoming) {
    const resolved = { ...item };

    if (!resolved.drugId && resolved.rawText) {
      const normalized = await normalizationService.normalize(resolved.rawText);
      const best = normalized.candidates[0];
      resolved.normalization = normalized;
      resolved.strength = resolved.strength || normalized.strength;
      if (best && best.confidence >= CONFIDENCE.AUTO_CONFIRM_MIN && !normalized.requiresReview) {
        resolved.drugId = best.candidateDrugId;
        resolved.displayName = best.displayName;
      }
    }

    if (!resolved.drugId) {
      results.push({
        input: item,
        outcome: OUTCOME.REVIEW_REQUIRED,
        reason: 'The medication could not be matched to a drug record with sufficient confidence.',
        candidates: resolved.normalization ? resolved.normalization.candidates : [],
      });
      continue;
    }

    const drug = await drugRepository.findById(resolved.drugId);
    if (!drug) {
      results.push({
        input: item,
        outcome: OUTCOME.REVIEW_REQUIRED,
        reason: 'The referenced drug does not exist.',
        candidates: [],
      });
      continue;
    }

    const sameDrug = active.filter((med) => med.drugId === drug.id);
    if (sameDrug.length > 0) {
      const conflicting = sameDrug.filter(
        (med) =>
          resolved.strength &&
          med.strength &&
          normalizeCase(med.strength) !== normalizeCase(resolved.strength)
      );
      results.push({
        input: item,
        drugId: drug.id,
        displayName: drug.genericName,
        outcome: OUTCOME.DUPLICATE,
        reason: conflicting.length
          ? 'The patient already takes this drug with a different recorded strength.'
          : 'The patient already has an active record for this drug.',
        conflicting: conflicting.map(describeExisting),
        existing: sameDrug.map(describeExisting),
      });
      continue;
    }

    const incomingIngredients = new Set(ingredientIdsOf(drug));
    const sharedIngredient = active.filter((med) =>
      ingredientIdsOf(med.drug).some((id) => incomingIngredients.has(id))
    );
    if (sharedIngredient.length > 0) {
      results.push({
        input: item,
        drugId: drug.id,
        displayName: drug.genericName,
        outcome: OUTCOME.DUPLICATE,
        reason: 'An active medication already contains one of the same ingredients.',
        existing: sharedIngredient.map(describeExisting),
      });
      continue;
    }

    results.push({
      input: item,
      drugId: drug.id,
      displayName: drug.genericName,
      strength: resolved.strength,
      doseForm: resolved.doseForm,
      route: resolved.route,
      frequency: resolved.frequency,
      source: resolved.source,
      outcome: OUTCOME.CONFIRMED,
    });
  }

  return {
    confirmedCandidates: results.filter((result) => result.outcome === OUTCOME.CONFIRMED),
    duplicateCandidates: results.filter((result) => result.outcome === OUTCOME.DUPLICATE),
    reviewRequired: results.filter((result) => result.outcome === OUTCOME.REVIEW_REQUIRED),
  };
};

const previewForPatient = async (user, patientId, incoming, req) => {
  await assertPatientAccess(user, patientId, ACCESS_LEVEL.READ, req);
  const existingMedications = await medicationRepository.listByPatient(patientId);
  return reconcile({ existingMedications, incoming });
};

const previewFromPrescription = async (user, prescriptionId, req) => {
  const prescription = await prescriptionRepository.findById(prescriptionId);
  if (!prescription) throw ApiError.notFound('Prescription not found');
  await assertPatientAccess(user, prescription.patientId, ACCESS_LEVEL.READ, req);

  const incoming = prescription.items
    .filter((item) => item.status === 'CONFIRMED')
    .map((item) => ({
      prescriptionItemId: item.id,
      drugId: item.candidateDrugId,
      rawText: item.rawText,
      strength: item.strength,
      doseForm: item.doseForm,
      route: item.route,
      frequency: item.frequency,
      source: 'PRESCRIPTION',
    }));

  const existingMedications = await medicationRepository.listByPatient(prescription.patientId);
  return { prescriptionId, ...(await reconcile({ existingMedications, incoming })) };
};

/**
 * Persists an operator-approved reconciliation. Only additions and explicit
 * status updates are applied - no medication is deleted.
 */
const apply = async (user, patientId, { additions = [], statusUpdates = [] }, req) => {
  await assertPatientAccess(user, patientId, ACCESS_LEVEL.WRITE, req);

  const result = await prisma.$transaction(async (tx) => {
    const created = [];
    for (const addition of additions) {
      if (!addition.drugId) throw ApiError.badRequest('Each addition requires a drugId');
      created.push(
        await medicationRepository.create(
          {
            patientId,
            drugId: addition.drugId,
            strength: addition.strength,
            doseForm: addition.doseForm,
            route: addition.route,
            frequency: addition.frequency,
            source: addition.source || 'RECONCILIATION',
            status: 'ACTIVE',
            notes: addition.notes,
          },
          tx
        )
      );
    }

    const updated = [];
    for (const change of statusUpdates) {
      const existing = await tx.patientMedication.findUnique({ where: { id: change.medicationId } });
      if (!existing || existing.patientId !== patientId) {
        throw ApiError.badRequest('Medication does not belong to this patient');
      }
      updated.push(
        await medicationRepository.update(
          change.medicationId,
          {
            status: change.status,
            notes: change.notes,
            ...(change.status !== 'ACTIVE' ? { endDate: new Date() } : {}),
          },
          tx
        )
      );
    }

    for (const itemId of additions.map((addition) => addition.prescriptionItemId).filter(Boolean)) {
      await prescriptionRepository.updateItem(itemId, { status: 'CONFIRMED' }, tx);
    }

    return { created, updated };
  });

  await auditService.record({
    req,
    userId: user.id,
    action: AUDIT_ACTIONS.RECONCILIATION,
    resourceType: 'Patient',
    resourceId: patientId,
    metadata: { added: result.created.length, updated: result.updated.length },
  });

  return result;
};

module.exports = { reconcile, previewForPatient, previewFromPrescription, apply, OUTCOME };
