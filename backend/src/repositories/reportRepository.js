'use strict';

const prisma = require('../config/prisma');
const { buildPagination } = require('../utils/pagination');

const create = (data) =>
  prisma.safetyReport.create({
    data,
    include: { patient: { include: { user: { select: { id: true, name: true, email: true } } } } },
  });

const findById = (id) =>
  prisma.safetyReport.findUnique({
    where: { id },
    include: {
      patient: { include: { user: { select: { id: true, name: true, email: true } } } },
      creator: { select: { id: true, name: true, role: true } },
    },
  });

const listByPatient = async (patientId, { page, limit }) => {
  const pagination = buildPagination({ page, limit });
  const where = { patientId };
  const [items, total] = await Promise.all([
    prisma.safetyReport.findMany({
      where,
      skip: pagination.skip,
      take: pagination.take,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.safetyReport.count({ where }),
  ]);
  return { items, total, pagination };
};

const countForYear = (year) =>
  prisma.safetyReport.count({
    where: { createdAt: { gte: new Date(`${year}-01-01T00:00:00Z`) } },
  });

module.exports = { create, findById, listByPatient, countForYear };
