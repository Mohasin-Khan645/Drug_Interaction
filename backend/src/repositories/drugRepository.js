'use strict';

const prisma = require('../config/prisma');
const { buildPagination } = require('../utils/pagination');

const DRUG_INCLUDE = {
  drugClass: true,
  ingredients: { include: { ingredient: true } },
  aliases: true,
  identifiers: true,
};

const SORTABLE_FIELDS = new Set(['genericName', 'brandName', 'createdAt', 'updatedAt']);

const findById = (id) => prisma.drug.findUnique({ where: { id }, include: DRUG_INCLUDE });

const findManyByIds = (ids) =>
  prisma.drug.findMany({ where: { id: { in: ids } }, include: DRUG_INCLUDE });

const list = async ({ page, limit, sortBy = 'genericName', sortOrder = 'asc', drugClassId, status, route, dosageForm }) => {
  const pagination = buildPagination({ page, limit });
  const orderField = SORTABLE_FIELDS.has(sortBy) ? sortBy : 'genericName';
  const where = {
    ...(drugClassId ? { drugClassId } : {}),
    ...(status ? { status } : { status: 'ACTIVE' }),
    ...(route ? { route: { equals: route, mode: 'insensitive' } } : {}),
    ...(dosageForm ? { dosageForm: { equals: dosageForm, mode: 'insensitive' } } : {}),
  };
  const [items, total] = await Promise.all([
    prisma.drug.findMany({
      where,
      include: DRUG_INCLUDE,
      skip: pagination.skip,
      take: pagination.take,
      orderBy: { [orderField]: sortOrder === 'desc' ? 'desc' : 'asc' },
    }),
    prisma.drug.count({ where }),
  ]);
  return { items, total, pagination };
};

// Structured Prisma filters only - no raw SQL is ever built from user input.
const search = async ({ q, page, limit, sortBy = 'genericName', sortOrder = 'asc' }) => {
  const pagination = buildPagination({ page, limit });
  const orderField = SORTABLE_FIELDS.has(sortBy) ? sortBy : 'genericName';
  const term = (q || '').trim();
  const where = {
    status: 'ACTIVE',
    OR: [
      { genericName: { contains: term, mode: 'insensitive' } },
      { brandName: { contains: term, mode: 'insensitive' } },
      { aliases: { some: { alias: { contains: term, mode: 'insensitive' } } } },
      { identifiers: { some: { value: { equals: term, mode: 'insensitive' } } } },
      { drugClass: { name: { contains: term, mode: 'insensitive' } } },
      {
        ingredients: {
          some: { ingredient: { name: { contains: term, mode: 'insensitive' } } },
        },
      },
    ],
  };
  const [items, total] = await Promise.all([
    prisma.drug.findMany({
      where,
      include: DRUG_INCLUDE,
      skip: pagination.skip,
      take: pagination.take,
      orderBy: { [orderField]: sortOrder === 'desc' ? 'desc' : 'asc' },
    }),
    prisma.drug.count({ where }),
  ]);
  return { items, total, pagination };
};

// Used by the normalization service for fuzzy candidate generation over a bounded set.
// Recall is widened with a short prefix so misspellings still reach the scorer;
// whether a candidate is acceptable is decided there, not here.
const searchCandidates = (tokens) => {
  const terms = [...new Set(tokens.flatMap((token) => [token, token.slice(0, 4)]))];
  return prisma.drug.findMany({
    where: {
      status: 'ACTIVE',
      OR: terms.flatMap((term) => [
        { genericName: { contains: term, mode: 'insensitive' } },
        { brandName: { contains: term, mode: 'insensitive' } },
        { aliases: { some: { alias: { contains: term, mode: 'insensitive' } } } },
        { ingredients: { some: { ingredient: { name: { contains: term, mode: 'insensitive' } } } } },
      ]),
    },
    include: DRUG_INCLUDE,
    take: 50,
  });
};

const findByIdentifier = (value) =>
  prisma.drug.findFirst({
    where: { status: 'ACTIVE', identifiers: { some: { value } } },
    include: DRUG_INCLUDE,
  });

const create = (data) => prisma.drug.create({ data, include: DRUG_INCLUDE });

const update = (id, data) => prisma.drug.update({ where: { id }, data, include: DRUG_INCLUDE });

const deactivate = (id) => prisma.drug.update({ where: { id }, data: { status: 'INACTIVE' } });

const addAlias = (data) => prisma.drugAlias.create({ data });

const removeAlias = (id) => prisma.drugAlias.delete({ where: { id } });

const addIdentifier = (data) => prisma.drugIdentifier.create({ data });

const removeIdentifier = (id) => prisma.drugIdentifier.delete({ where: { id } });

const listClasses = () => prisma.drugClass.findMany({ orderBy: { name: 'asc' } });

const listIngredients = () => prisma.ingredient.findMany({ orderBy: { name: 'asc' } });

module.exports = {
  DRUG_INCLUDE,
  findById,
  findManyByIds,
  list,
  search,
  searchCandidates,
  findByIdentifier,
  create,
  update,
  deactivate,
  addAlias,
  removeAlias,
  addIdentifier,
  removeIdentifier,
  listClasses,
  listIngredients,
};
