'use strict';

const prisma = require('../config/prisma');
const { buildPagination } = require('../utils/pagination');

const RULE_SOURCE_INCLUDE = { source: true };

// Interaction pairs are stored with drugAId <= drugBId so A+B and B+A resolve identically.
const orderPair = (drugAId, drugBId) =>
  drugAId <= drugBId ? { drugAId, drugBId } : { drugAId: drugBId, drugBId: drugAId };

const findInteractionsForPairs = (pairs) => {
  if (pairs.length === 0) return Promise.resolve([]);
  return prisma.drugInteraction.findMany({
    where: {
      status: 'ACTIVE',
      OR: pairs.map(({ drugAId, drugBId }) => orderPair(drugAId, drugBId)),
    },
    include: { ...RULE_SOURCE_INCLUDE, drugA: true, drugB: true },
  });
};

const listInteractionsForDrug = (drugId) =>
  prisma.drugInteraction.findMany({
    where: { status: 'ACTIVE', OR: [{ drugAId: drugId }, { drugBId: drugId }] },
    include: { drugA: true, drugB: true, source: true },
  });

const listInteractions = async ({ page, limit, drugId, severity }) => {
  const pagination = buildPagination({ page, limit });
  const where = {
    ...(severity ? { severity } : {}),
    ...(drugId ? { OR: [{ drugAId: drugId }, { drugBId: drugId }] } : {}),
  };
  const [items, total] = await Promise.all([
    prisma.drugInteraction.findMany({
      where,
      include: { drugA: true, drugB: true, source: true },
      skip: pagination.skip,
      take: pagination.take,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.drugInteraction.count({ where }),
  ]);
  return { items, total, pagination };
};

const findDiseaseRules = (drugIds, conditionIds) => {
  if (drugIds.length === 0 || conditionIds.length === 0) return Promise.resolve([]);
  return prisma.drugDiseaseRule.findMany({
    where: { status: 'ACTIVE', drugId: { in: drugIds }, conditionId: { in: conditionIds } },
    include: { ...RULE_SOURCE_INCLUDE, drug: true, condition: true },
  });
};

const findAllergyRules = ({ drugIds, ingredientIds, drugClassIds }) => {
  const or = [];
  if (drugIds.length) or.push({ drugId: { in: drugIds } });
  if (ingredientIds.length) or.push({ ingredientId: { in: ingredientIds } });
  if (drugClassIds.length) or.push({ drugClassId: { in: drugClassIds } });
  if (or.length === 0) return Promise.resolve([]);
  return prisma.drugAllergyRule.findMany({
    where: { status: 'ACTIVE', OR: or },
    include: { ...RULE_SOURCE_INCLUDE, drug: true, ingredient: true, drugClass: true },
  });
};

const listDuplicationRules = () =>
  prisma.duplicationRule.findMany({ where: { status: 'ACTIVE' }, include: RULE_SOURCE_INCLUDE });

const findPatientFactorRules = (drugIds) => {
  if (drugIds.length === 0) return Promise.resolve([]);
  return prisma.patientFactorRule.findMany({
    where: { status: 'ACTIVE', drugId: { in: drugIds } },
    include: { ...RULE_SOURCE_INCLUDE, drug: true },
  });
};

const MODEL_BY_KIND = {
  interaction: 'drugInteraction',
  disease: 'drugDiseaseRule',
  allergy: 'drugAllergyRule',
  duplication: 'duplicationRule',
  factor: 'patientFactorRule',
};

const modelFor = (kind, client = prisma) => client[MODEL_BY_KIND[kind]];

const createRule = (kind, data, client = prisma) => modelFor(kind, client).create({ data });

const findRuleById = (kind, id, client = prisma) => modelFor(kind, client).findUnique({ where: { id } });

// Rules are versioned: the previous record is archived instead of mutated so historical
// safety results stay reproducible.
const supersedeRule = async (kind, id, data) =>
  prisma.$transaction(async (tx) => {
    const existing = await modelFor(kind, tx).findUnique({ where: { id } });
    if (!existing) return null;
    await modelFor(kind, tx).update({ where: { id }, data: { status: 'ARCHIVED' } });
    const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, version, ...rest } = existing;
    return modelFor(kind, tx).create({
      data: {
        ...rest,
        ...data,
        version: version + 1,
        status: 'ACTIVE',
        reviewedAt: new Date(),
      },
    });
  });

const deactivateRule = (kind, id) =>
  modelFor(kind).update({ where: { id }, data: { status: 'INACTIVE' } });

const listRules = async (kind, { page, limit }) => {
  const pagination = buildPagination({ page, limit });
  const [items, total] = await Promise.all([
    modelFor(kind).findMany({
      skip: pagination.skip,
      take: pagination.take,
      orderBy: { createdAt: 'desc' },
    }),
    modelFor(kind).count(),
  ]);
  return { items, total, pagination };
};

module.exports = {
  orderPair,
  findInteractionsForPairs,
  listInteractionsForDrug,
  listInteractions,
  findDiseaseRules,
  findAllergyRules,
  listDuplicationRules,
  findPatientFactorRules,
  createRule,
  findRuleById,
  supersedeRule,
  deactivateRule,
  listRules,
  MODEL_BY_KIND,
};
