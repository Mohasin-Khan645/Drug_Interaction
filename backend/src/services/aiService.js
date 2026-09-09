'use strict';

const prisma = require('../config/prisma');
const ragService = require('./ragService');
const safetyRepository = require('../repositories/safetyRepository');
const auditService = require('./auditService');
const ApiError = require('../utils/apiError');
const { getAIProvider } = require('../integrations/ai');
const { AUDIT_ACTIONS, ERROR_CODES } = require('../constants');
const logger = require('../config/logger');
const { ACCESS_LEVEL, assertPatientAccess } = require('./patientAccessService');

const SYSTEM_PROMPT = [
  'You explain existing verified medication safety findings to clinicians and patients.',
  'You may explain, simplify, and summarise the supplied verified context.',
  'You must not diagnose, prescribe, recommend a dosage change, create safety rules, or override them.',
  'You must not introduce clinical claims that are absent from the supplied context.',
].join(' ');

/**
 * Answers only from verified findings and stored evidence. Without a grounded
 * context the request is refused with INSUFFICIENT_VERIFIED_EVIDENCE rather
 * than answered from model knowledge.
 */
const explain = async (user, { question, findingId, safetyCheckId }, req) => {
  if (findingId) {
    const finding = await safetyRepository.findFindingById(findingId);
    if (!finding) throw ApiError.notFound('Finding not found');
    await assertPatientAccess(user, finding.safetyCheck.patientId, ACCESS_LEVEL.READ, req);
  } else if (safetyCheckId) {
    const check = await safetyRepository.findCheckById(safetyCheckId);
    if (!check) throw ApiError.notFound('Safety check not found');
    await assertPatientAccess(user, check.patientId, ACCESS_LEVEL.READ, req);
  } else {
    throw ApiError.badRequest('Either findingId or safetyCheckId is required');
  }

  const context = await ragService.buildContext({ question, findingId, safetyCheckId });

  if (!context.grounded) {
    // Only the question and the outcome are stored; no clinical content is retained.
    await prisma.aiRequest.create({
      data: {
        userId: user.id,
        question,
        grounded: false,
        outcome: ERROR_CODES.INSUFFICIENT_VERIFIED_EVIDENCE,
      },
    });
    throw new ApiError(
      422,
      ERROR_CODES.INSUFFICIENT_VERIFIED_EVIDENCE,
      'No verified evidence is available to answer this question'
    );
  }

  let completion;
  try {
    completion = await getAIProvider().complete({ system: SYSTEM_PROMPT, context, question });
  } catch (err) {
    logger.error({ err }, 'AI provider failed');
    throw ApiError.external(ERROR_CODES.AI_ERROR, 'AI provider is unavailable');
  }

  await prisma.aiRequest.create({
    data: {
      userId: user.id,
      question,
      grounded: true,
      outcome: 'ANSWERED',
      contextRefs: {
        findingIds: context.findings.map((finding) => finding.id),
        sources: context.evidence.map((item) => item.sourceName),
      },
    },
  });

  await auditService.record({
    req,
    userId: user.id,
    action: AUDIT_ACTIONS.AI_QUERY,
    resourceType: findingId ? 'SafetyFinding' : 'SafetyCheck',
    resourceId: findingId || safetyCheckId,
  });

  return {
    answer: completion.text,
    provider: completion.provider,
    grounding: {
      findings: context.findings.map((finding) => ({ id: finding.id, title: finding.title })),
      evidence: context.evidence.map((item) => ({
        sourceName: item.sourceName,
        reference: item.reference,
        version: item.version,
        evidenceLevel: item.evidenceLevel,
      })),
    },
    disclaimer:
      'Generated from verified findings only. Not a diagnosis, prescription, or dosage recommendation.',
  };
};

module.exports = { explain, SYSTEM_PROMPT };
