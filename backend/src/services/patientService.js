'use strict';

const prisma = require('../config/prisma');
const patientRepository = require('../repositories/patientRepository');
const ApiError = require('../utils/apiError');
const { ROLES, AUDIT_ACTIONS } = require('../constants');
const auditService = require('./auditService');
const { ACCESS_LEVEL, assertPatientAccess } = require('./patientAccessService');

const listPatients = (user, filters) => {
  if (user.role === ROLES.ADMIN) return patientRepository.list(filters);
  // Clinicians only ever see the patients they are assigned to.
  return patientRepository.list({ ...filters, careTeamUserId: user.id });
};

const getPatient = async (user, patientId, req) => {
  await assertPatientAccess(user, patientId, ACCESS_LEVEL.READ, req);
  const patient = await patientRepository.findWithClinicalData(patientId);
  if (!patient) throw ApiError.notFound('Patient not found');
  return patient;
};

const updatePatient = async (user, patientId, data, req) => {
  await assertPatientAccess(user, patientId, ACCESS_LEVEL.WRITE, req);
  const updated = await patientRepository.update(patientId, data);
  await auditService.record({
    req,
    userId: user.id,
    action: AUDIT_ACTIONS.PATIENT_UPDATE,
    resourceType: 'Patient',
    resourceId: patientId,
    metadata: { fields: Object.keys(data) },
  });
  return updated;
};

const resolveConditionId = async (conditionInput) => {
  if (conditionInput.conditionId) {
    const condition = await prisma.condition.findUnique({ where: { id: conditionInput.conditionId } });
    if (!condition) throw ApiError.badRequest('Unknown condition');
    return condition.id;
  }
  const condition = await prisma.condition.upsert({
    where: { name: conditionInput.name },
    update: {},
    create: { name: conditionInput.name },
  });
  return condition.id;
};

const addCondition = async (user, patientId, payload, req) => {
  await assertPatientAccess(user, patientId, ACCESS_LEVEL.WRITE, req);
  const conditionId = await resolveConditionId(payload);
  const created = await patientRepository.addCondition({
    patientId,
    conditionId,
    status: payload.status,
    notes: payload.notes,
  });
  await auditService.record({
    req,
    userId: user.id,
    action: AUDIT_ACTIONS.PATIENT_UPDATE,
    resourceType: 'PatientCondition',
    resourceId: created.id,
  });
  return created;
};

const listConditions = async (user, patientId, req) => {
  await assertPatientAccess(user, patientId, ACCESS_LEVEL.READ, req);
  return patientRepository.listConditions(patientId);
};

const addAllergy = async (user, patientId, payload, req) => {
  await assertPatientAccess(user, patientId, ACCESS_LEVEL.WRITE, req);
  const created = await patientRepository.addAllergy({ patientId, ...payload });
  await auditService.record({
    req,
    userId: user.id,
    action: AUDIT_ACTIONS.PATIENT_UPDATE,
    resourceType: 'PatientAllergy',
    resourceId: created.id,
  });
  return created;
};

const listAllergies = async (user, patientId, req) => {
  await assertPatientAccess(user, patientId, ACCESS_LEVEL.READ, req);
  return patientRepository.listAllergies(patientId);
};

const addLabResult = async (user, patientId, payload, req) => {
  await assertPatientAccess(user, patientId, ACCESS_LEVEL.WRITE, req);
  const created = await patientRepository.addLabResult({ patientId, ...payload });
  await auditService.record({
    req,
    userId: user.id,
    action: AUDIT_ACTIONS.PATIENT_UPDATE,
    resourceType: 'LabResult',
    resourceId: created.id,
  });
  return created;
};

const listLabResults = async (user, patientId, req) => {
  await assertPatientAccess(user, patientId, ACCESS_LEVEL.READ, req);
  return patientRepository.listLabResults(patientId);
};

const listCareTeam = async (user, patientId, req) => {
  await assertPatientAccess(user, patientId, ACCESS_LEVEL.READ, req);
  return patientRepository.listCareTeam(patientId);
};

const addCareTeamMember = async (user, patientId, clinicianId, req) => {
  // Only the patient themself or an administrator may widen access.
  const patient = await patientRepository.findById(patientId);
  if (!patient) throw ApiError.notFound('Patient not found');
  if (user.role !== ROLES.ADMIN && patient.userId !== user.id) {
    throw ApiError.forbidden('Only the patient or an administrator can grant access');
  }
  const clinician = await prisma.user.findFirst({
    where: { id: clinicianId, deletedAt: null, role: { in: [ROLES.DOCTOR, ROLES.PHARMACIST] } },
  });
  if (!clinician) throw ApiError.badRequest('Care team members must be a doctor or pharmacist');

  const relation = await patientRepository.addCareTeamMember(patientId, clinicianId);
  await auditService.record({
    req,
    userId: user.id,
    action: AUDIT_ACTIONS.PATIENT_UPDATE,
    resourceType: 'CareTeamMember',
    resourceId: relation.id,
    metadata: { granted: clinicianId },
  });
  return relation;
};

const removeCareTeamMember = async (user, patientId, clinicianId, req) => {
  const patient = await patientRepository.findById(patientId);
  if (!patient) throw ApiError.notFound('Patient not found');
  if (user.role !== ROLES.ADMIN && patient.userId !== user.id) {
    throw ApiError.forbidden('Only the patient or an administrator can revoke access');
  }
  const relation = await patientRepository.removeCareTeamMember(patientId, clinicianId);
  await auditService.record({
    req,
    userId: user.id,
    action: AUDIT_ACTIONS.PATIENT_UPDATE,
    resourceType: 'CareTeamMember',
    resourceId: relation.id,
    metadata: { revoked: clinicianId },
  });
  return relation;
};

module.exports = {
  listPatients,
  getPatient,
  updatePatient,
  addCondition,
  listConditions,
  addAllergy,
  listAllergies,
  addLabResult,
  listLabResults,
  listCareTeam,
  addCareTeamMember,
  removeCareTeamMember,
};
