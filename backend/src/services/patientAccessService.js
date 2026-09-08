'use strict';

const patientRepository = require('../repositories/patientRepository');
const ApiError = require('../utils/apiError');
const { ROLES, AUDIT_ACTIONS } = require('../constants');
const auditService = require('./auditService');

const ACCESS_LEVEL = Object.freeze({
  READ: 'READ',
  WRITE: 'WRITE',
  MEDICATION_REVIEW: 'MEDICATION_REVIEW',
});

/**
 * Object level authorization for every patient scoped resource. Guessing an id
 * is not enough: the relationship between the caller and the patient decides.
 */
const assertPatientAccess = async (user, patientId, level = ACCESS_LEVEL.READ, req) => {
  const patient = await patientRepository.findById(patientId);
  if (!patient) throw ApiError.notFound('Patient not found');

  let allowed = false;
  switch (user.role) {
    case ROLES.ADMIN:
      // Administrators manage the system; clinical records stay off limits.
      allowed = false;
      break;
    case ROLES.PATIENT:
      allowed = patient.userId === user.id;
      break;
    case ROLES.DOCTOR:
      allowed = await patientRepository.isCareTeamMember(patientId, user.id);
      break;
    case ROLES.PHARMACIST:
      allowed =
        level !== ACCESS_LEVEL.WRITE &&
        (await patientRepository.isCareTeamMember(patientId, user.id));
      break;
    default:
      allowed = false;
  }

  if (!allowed) {
    throw ApiError.forbidden('You are not authorized to access this patient record');
  }

  if (req) {
    await auditService.record({
      req,
      userId: user.id,
      action: AUDIT_ACTIONS.PATIENT_ACCESS,
      resourceType: 'Patient',
      resourceId: patientId,
      metadata: { level },
    });
  }

  return patient;
};

const resolveOwnPatientId = async (user) => {
  const patient = await patientRepository.findByUserId(user.id);
  if (!patient) throw ApiError.notFound('No patient profile exists for this account');
  return patient.id;
};

module.exports = { ACCESS_LEVEL, assertPatientAccess, resolveOwnPatientId };
