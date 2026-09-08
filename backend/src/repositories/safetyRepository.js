'use strict';

const prisma = require('../config/prisma');
const { buildPagination } = require('../utils/pagination');

const CHECK_INCLUDE = {
  findings: {
    include: { evidence: true, reviews: { include: { reviewer: { select: { id: true, name: true, role: true } } } } },
    // Severity is declared most-severe-first in the schema, so ascending enum order is clinical priority order.
    orderBy: [{ severity: 'asc' }, { createdAt: 'asc' }],
  },
};

const createCheckWithFindings = ({ patientId, requestedById, inputHash, summary, findings }) =>
  prisma.$transaction(async (tx) => {
    const check = await tx.safetyCheck.create({
      data: { patientId, requestedById, inputHash, summary, status: 'COMPLETED' },
    });
    for (const finding of findings) {
      const { evidence = [], ...findingData } = finding;
      await tx.safetyFinding.create({
        data: {
          ...findingData,
          safetyCheckId: check.id,
          evidence: evidence.length > 0 ? { create: evidence } : undefined,
        },
      });
    }
    return tx.safetyCheck.findUnique({ where: { id: check.id }, include: CHECK_INCLUDE });
  });

const findCheckById = (id) =>
  prisma.safetyCheck.findUnique({
    where: { id },
    include: { ...CHECK_INCLUDE, patient: { include: { user: { select: { id: true, name: true } } } } },
  });

const listChecksByPatient = async (patientId, { page, limit }) => {
  const pagination = buildPagination({ page, limit });
  const where = { patientId };
  const [items, total] = await Promise.all([
    prisma.safetyCheck.findMany({
      where,
      skip: pagination.skip,
      take: pagination.take,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.safetyCheck.count({ where }),
  ]);
  return { items, total, pagination };
};

const findFindingById = (id) =>
  prisma.safetyFinding.findUnique({
    where: { id },
    include: {
      evidence: { include: { document: { include: { source: true } } } },
      safetyCheck: { include: { patient: true } },
      reviews: true,
    },
  });

const updateFindingStatus = (id, status, client = prisma) =>
  client.safetyFinding.update({ where: { id }, data: { status } });

const listFindings = async ({ page, limit, patientId, severity, status, category }) => {
  const pagination = buildPagination({ page, limit });
  const where = {
    ...(severity ? { severity } : {}),
    ...(status ? { status } : {}),
    ...(category ? { category } : {}),
    ...(patientId ? { safetyCheck: { patientId } } : {}),
  };
  const [items, total] = await Promise.all([
    prisma.safetyFinding.findMany({
      where,
      include: { evidence: true },
      skip: pagination.skip,
      take: pagination.take,
      orderBy: [{ severity: 'asc' }, { createdAt: 'desc' }],
    }),
    prisma.safetyFinding.count({ where }),
  ]);
  return { items, total, pagination };
};

module.exports = {
  createCheckWithFindings,
  findCheckById,
  listChecksByPatient,
  findFindingById,
  updateFindingStatus,
  listFindings,
};
