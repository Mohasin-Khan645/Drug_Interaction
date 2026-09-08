'use strict';

const medicationRepository = require('../repositories/medicationRepository');
const drugRepository = require('../repositories/drugRepository');
const ApiError = require('../utils/apiError');
const { AUDIT_ACTIONS } = require('../constants');
const auditService = require('./auditService');
const { ACCESS_LEVEL, assertPatientAccess } = require('./patientAccessService');

const listMedications = async (user, patientId, filters, req) => {
  await assertPatientAccess(user, patientId, ACCESS_LEVEL.READ, req);
  return medicationRepository.listByPatient(patientId, filters);
};

const addMedication = async (user, patientId, payload, req) => {
  await assertPatientAccess(user, patientId, ACCESS_LEVEL.WRITE, req);
  if (payload.drugId) {
    const drug = await drugRepository.findById(payload.drugId);
    if (!drug) throw ApiError.badRequest('Unknown drug');
  }
  if (!payload.drugId && !payload.rawName) {
    throw ApiError.badRequest('Either drugId or rawName is required');
  }
  const created = await medicationRepository.create({ patientId, ...payload });
  await auditService.record({
    req,
    userId: user.id,
    action: AUDIT_ACTIONS.MEDICATION_CHANGE,
    resourceType: 'PatientMedication',
    resourceId: created.id,
    metadata: { operation: 'CREATE' },
  });
  return created;
};

/**
 * Medication records are never deleted. Stopping a medication is a status
 * change with an end date so the clinical history stays intact.
 */
const updateMedication = async (user, medicationId, payload, req) => {
  const existing = await medicationRepository.findById(medicationId);
  if (!existing) throw ApiError.notFound('Medication not found');
  await assertPatientAccess(user, existing.patientId, ACCESS_LEVEL.WRITE, req);

  const data = { ...payload };
  if (payload.status && payload.status !== 'ACTIVE' && !payload.endDate && !existing.endDate) {
    data.endDate = new Date();
  }
  const updated = await medicationRepository.update(medicationId, data);
  await auditService.record({
    req,
    userId: user.id,
    action: AUDIT_ACTIONS.MEDICATION_CHANGE,
    resourceType: 'PatientMedication',
    resourceId: medicationId,
    metadata: { operation: 'UPDATE', fields: Object.keys(payload) },
  });
  return updated;
};

const stopMedication = async (user, medicationId, notes, req) =>
  updateMedication(user, medicationId, { status: 'STOPPED', endDate: new Date(), notes }, req);

module.exports = { listMedications, addMedication, updateMedication, stopMedication };
