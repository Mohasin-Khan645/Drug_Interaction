'use strict';

const prisma = require('../config/prisma');
const reviewRepository = require('../repositories/reviewRepository');
const safetyRepository = require('../repositories/safetyRepository');
const patientRepository = require('../repositories/patientRepository');
const auditService = require('./auditService');
const ApiError = require('../utils/apiError');
const { AUDIT_ACTIONS, FINDING_STATUS, CLINICIAN_ROLES } = require('../constants');
const { ACCESS_LEVEL, assertPatientAccess } = require('./patientAccessService');

const STATUS_BY_DECISION = Object.freeze({
  ACCEPTED: FINDING_STATUS.ACCEPTED,
  ACKNOWLEDGED: FINDING_STATUS.ACKNOWLEDGED,
  REQUIRES_INVESTIGATION: FINDING_STATUS.REVIEW_REQUIRED,
});

/**
 * A clinician review is the only thing that moves a finding out of OPEN. The
 * reviewer must be on the patient's care team; the finding itself is never
 * altered, only its status.
 */
const createReview = async (user, findingId, { decision, clinicalNote }, req) => {
  if (!CLINICIAN_ROLES.includes(user.role)) {
    throw ApiError.forbidden('Only doctors and pharmacists can review safety findings');
  }

  const finding = await safetyRepository.findFindingById(findingId);
  if (!finding) throw ApiError.notFound('Finding not found');

  const authorized = await patientRepository.isCareTeamMember(finding.safetyCheck.patientId, user.id);
  if (!authorized) throw ApiError.forbidden('You are not on this patient\'s care team');

  const review = await prisma.$transaction(async (tx) => {
    const created = await reviewRepository.create(
      { findingId, reviewerId: user.id, decision, clinicalNote },
      tx
    );
    await safetyRepository.updateFindingStatus(findingId, STATUS_BY_DECISION[decision], tx);
    return created;
  });

  await auditService.record({
    req,
    userId: user.id,
    action: AUDIT_ACTIONS.REVIEW_ACTION,
    resourceType: 'SafetyFinding',
    resourceId: findingId,
    metadata: { decision },
  });

  return review;
};

const listReviews = async (user, findingId, req) => {
  const finding = await safetyRepository.findFindingById(findingId);
  if (!finding) throw ApiError.notFound('Finding not found');
  await assertPatientAccess(user, finding.safetyCheck.patientId, ACCESS_LEVEL.READ, req);
  return reviewRepository.listByFinding(findingId);
};

module.exports = { createReview, listReviews, STATUS_BY_DECISION };
