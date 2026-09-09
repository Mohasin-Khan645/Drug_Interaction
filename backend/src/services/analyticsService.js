'use strict';

const prisma = require('../config/prisma');

const sinceDate = (days) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

/**
 * Aggregate counts only - no patient-identifying data leaves this service.
 */
const overview = async ({ days = 30 } = {}) => {
  const since = sinceDate(days);

  const [
    usersByRole,
    patients,
    drugs,
    activeInteractionRules,
    checks,
    findingsBySeverity,
    findingsByCategory,
    reviewsByDecision,
    notifications,
    aiRequests,
  ] = await Promise.all([
    prisma.user.groupBy({ by: ['role'], where: { deletedAt: null }, _count: { _all: true } }),
    prisma.patient.count({ where: { deletedAt: null } }),
    prisma.drug.count({ where: { status: 'ACTIVE' } }),
    prisma.drugInteraction.count({ where: { status: 'ACTIVE' } }),
    prisma.safetyCheck.count({ where: { createdAt: { gte: since } } }),
    prisma.safetyFinding.groupBy({
      by: ['severity'],
      where: { createdAt: { gte: since } },
      _count: { _all: true },
    }),
    prisma.safetyFinding.groupBy({
      by: ['category'],
      where: { createdAt: { gte: since } },
      _count: { _all: true },
    }),
    prisma.clinicianReview.groupBy({
      by: ['decision'],
      where: { createdAt: { gte: since } },
      _count: { _all: true },
    }),
    prisma.notification.count({ where: { createdAt: { gte: since } } }),
    prisma.aiRequest.groupBy({
      by: ['outcome'],
      where: { createdAt: { gte: since } },
      _count: { _all: true },
    }),
  ]);

  const toMap = (rows, key) =>
    Object.fromEntries(rows.map((row) => [row[key], row._count._all]));

  return {
    windowDays: days,
    users: { total: usersByRole.reduce((sum, row) => sum + row._count._all, 0), byRole: toMap(usersByRole, 'role') },
    patients,
    catalog: { drugs, activeInteractionRules },
    safety: {
      checks,
      findingsBySeverity: toMap(findingsBySeverity, 'severity'),
      findingsByCategory: toMap(findingsByCategory, 'category'),
    },
    reviews: toMap(reviewsByDecision, 'decision'),
    notifications,
    ai: toMap(aiRequests, 'outcome'),
  };
};

module.exports = { overview };
