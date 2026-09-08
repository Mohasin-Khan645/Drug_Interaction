'use strict';

const prisma = require('../config/prisma');
const { buildPagination } = require('../utils/pagination');

const findById = (id) => prisma.patient.findFirst({ where: { id, deletedAt: null } });

const findByUserId = (userId) => prisma.patient.findFirst({ where: { userId, deletedAt: null } });

const findWithClinicalData = (id) =>
  prisma.patient.findFirst({
    where: { id, deletedAt: null },
    include: {
      user: { select: { id: true, name: true, email: true } },
      conditions: { include: { condition: true } },
      allergies: true,
      medications: { include: { drug: { include: { ingredients: { include: { ingredient: true } }, drugClass: true } } } },
      labResults: { orderBy: { takenAt: 'desc' } },
    },
  });

const create = (data, client = prisma) => client.patient.create({ data });

const update = (id, data) => prisma.patient.update({ where: { id }, data });

const list = async ({ page, limit, search, careTeamUserId }) => {
  const pagination = buildPagination({ page, limit });
  const where = {
    deletedAt: null,
    ...(careTeamUserId
      ? { careTeam: { some: { userId: careTeamUserId, status: 'ACTIVE' } } }
      : {}),
    ...(search
      ? {
          user: {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          },
        }
      : {}),
  };
  const [items, total] = await Promise.all([
    prisma.patient.findMany({
      where,
      include: { user: { select: { id: true, name: true, email: true } } },
      skip: pagination.skip,
      take: pagination.take,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.patient.count({ where }),
  ]);
  return { items, total, pagination };
};

const isCareTeamMember = async (patientId, userId) => {
  const relation = await prisma.careTeamMember.findUnique({
    where: { patientId_userId: { patientId, userId } },
  });
  return Boolean(relation && relation.status === 'ACTIVE');
};

const addCareTeamMember = (patientId, userId) =>
  prisma.careTeamMember.upsert({
    where: { patientId_userId: { patientId, userId } },
    update: { status: 'ACTIVE' },
    create: { patientId, userId, status: 'ACTIVE' },
  });

const removeCareTeamMember = (patientId, userId) =>
  prisma.careTeamMember.update({
    where: { patientId_userId: { patientId, userId } },
    data: { status: 'REVOKED' },
  });

const listCareTeam = (patientId) =>
  prisma.careTeamMember.findMany({
    where: { patientId },
    include: { user: { select: { id: true, name: true, email: true, role: true } } },
  });

const listConditions = (patientId) =>
  prisma.patientCondition.findMany({ where: { patientId }, include: { condition: true } });

const addCondition = (data) => prisma.patientCondition.create({ data, include: { condition: true } });

const updateCondition = (id, data) => prisma.patientCondition.update({ where: { id }, data });

const listAllergies = (patientId) => prisma.patientAllergy.findMany({ where: { patientId } });

const addAllergy = (data) => prisma.patientAllergy.create({ data });

const updateAllergy = (id, data) => prisma.patientAllergy.update({ where: { id }, data });

const listLabResults = (patientId) =>
  prisma.labResult.findMany({ where: { patientId }, orderBy: { takenAt: 'desc' } });

const addLabResult = (data) => prisma.labResult.create({ data });

module.exports = {
  findById,
  findByUserId,
  findWithClinicalData,
  create,
  update,
  list,
  isCareTeamMember,
  addCareTeamMember,
  removeCareTeamMember,
  listCareTeam,
  listConditions,
  addCondition,
  updateCondition,
  listAllergies,
  addAllergy,
  updateAllergy,
  listLabResults,
  addLabResult,
};
