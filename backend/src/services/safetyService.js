'use strict';

const prisma = require('../config/prisma');
const patientRepository = require('../repositories/patientRepository');
const safetyRepository = require('../repositories/safetyRepository');
const medicationSafetyEngine = require('./safety/medicationSafetyEngine');
const notificationService = require('./notificationService');
const auditService = require('./auditService');
const ApiError = require('../utils/apiError');
const { AUDIT_ACTIONS, ROLES } = require('../constants');
const { stableHash } = require('../utils/crypto');
const { paginatedResult } = require('../utils/pagination');
const { ACCESS_LEVEL, assertPatientAccess } = require('./patientAccessService');

// The hash captures exactly what was evaluated, so an unchanged clinical picture
// maps to the same check instead of creating a duplicate.
const buildInputHash = ({ medications, conditions, allergies, labResults }) =>
  stableHash({
    medications: medications
      .map((med) => `${med.drugId || med.rawName}|${med.strength || ''}|${med.status}`)
      .sort(),
    conditions: conditions.filter((c) => c.status === 'ACTIVE').map((c) => c.conditionId).sort(),
    allergies: allergies.map((a) => `${a.allergen}|${a.severity}`).sort(),
    labs: labResults.map((lab) => `${lab.code}|${lab.value}`).sort(),
  });

const loadClinicalContext = async (patientId) => {
  const patient = await patientRepository.findWithClinicalData(patientId);
  if (!patient) throw ApiError.notFound('Patient not found');
  return {
    patient,
    medications: patient.medications.filter((med) => med.status === 'ACTIVE'),
    conditions: patient.conditions,
    allergies: patient.allergies,
    labResults: patient.labResults,
  };
};

const runCheck = async (user, patientId, { force = false } = {}, req) => {
  await assertPatientAccess(user, patientId, ACCESS_LEVEL.READ, req);
  const context = await loadClinicalContext(patientId);
  const inputHash = buildInputHash(context);

  if (!force) {
    const existing = await prisma.safetyCheck.findFirst({
      where: { patientId, inputHash, status: 'COMPLETED' },
      orderBy: { createdAt: 'desc' },
    });
    if (existing) {
      const full = await safetyRepository.findCheckById(existing.id);
      return { ...full, reused: true };
    }
  }

  const { findings, summary } = await medicationSafetyEngine.evaluate(context);
  const check = await safetyRepository.createCheckWithFindings({
    patientId,
    requestedById: user.id,
    inputHash,
    summary,
    findings,
  });

  await notificationService.notifySafetyFindings({
    patient: context.patient,
    findings: check.findings,
    safetyCheckId: check.id,
  });

  await auditService.record({
    req,
    userId: user.id,
    action: AUDIT_ACTIONS.SAFETY_CHECK,
    resourceType: 'SafetyCheck',
    resourceId: check.id,
    metadata: { findings: check.findings.length, highestSeverity: summary.highestSeverity },
  });

  return { ...check, reused: false };
};

const getCheck = async (user, checkId, req) => {
  const check = await safetyRepository.findCheckById(checkId);
  if (!check) throw ApiError.notFound('Safety check not found');
  await assertPatientAccess(user, check.patientId, ACCESS_LEVEL.READ, req);
  return check;
};

const listChecks = async (user, patientId, filters, req) => {
  await assertPatientAccess(user, patientId, ACCESS_LEVEL.READ, req);
  const { items, total, pagination } = await safetyRepository.listChecksByPatient(patientId, filters);
  return paginatedResult(items, total, pagination);
};

const getFinding = async (user, findingId, req) => {
  const finding = await safetyRepository.findFindingById(findingId);
  if (!finding) throw ApiError.notFound('Finding not found');
  await assertPatientAccess(user, finding.safetyCheck.patientId, ACCESS_LEVEL.READ, req);
  return finding;
};

const listFindings = async (user, filters, req) => {
  if (filters.patientId) {
    await assertPatientAccess(user, filters.patientId, ACCESS_LEVEL.READ, req);
  } else if (user.role !== ROLES.ADMIN) {
    throw ApiError.badRequest('patientId is required');
  }
  const { items, total, pagination } = await safetyRepository.listFindings(filters);
  return paginatedResult(items, total, pagination);
};

module.exports = {
  runCheck,
  getCheck,
  listChecks,
  getFinding,
  listFindings,
  loadClinicalContext,
  buildInputHash,
};
