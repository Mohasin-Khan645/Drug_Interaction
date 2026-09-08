'use strict';

const prisma = require('../config/prisma');
const { buildPagination } = require('../utils/pagination');

const listSources = () => prisma.knowledgeSource.findMany({ orderBy: { name: 'asc' } });

const createSource = (data) => prisma.knowledgeSource.create({ data });

const updateSource = (id, data) => prisma.knowledgeSource.update({ where: { id }, data });

const listDocuments = async ({ page, limit, sourceId, search }) => {
  const pagination = buildPagination({ page, limit });
  const where = {
    status: 'ACTIVE',
    ...(sourceId ? { sourceId } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { content: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };
  const [items, total] = await Promise.all([
    prisma.knowledgeDocument.findMany({
      where,
      include: { source: true },
      skip: pagination.skip,
      take: pagination.take,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.knowledgeDocument.count({ where }),
  ]);
  return { items, total, pagination };
};

const findDocumentById = (id) =>
  prisma.knowledgeDocument.findUnique({ where: { id }, include: { source: true } });

const createDocument = (data) => prisma.knowledgeDocument.create({ data });

const updateDocument = (id, data) => prisma.knowledgeDocument.update({ where: { id }, data });

const searchDocuments = (terms, take = 5) =>
  prisma.knowledgeDocument.findMany({
    where: {
      status: 'ACTIVE',
      OR: terms.flatMap((term) => [
        { title: { contains: term, mode: 'insensitive' } },
        { content: { contains: term, mode: 'insensitive' } },
      ]),
    },
    include: { source: true },
    take,
  });

const findDocumentsByIds = (ids) =>
  prisma.knowledgeDocument.findMany({ where: { id: { in: ids } }, include: { source: true } });

module.exports = {
  listSources,
  createSource,
  updateSource,
  listDocuments,
  findDocumentById,
  createDocument,
  updateDocument,
  searchDocuments,
  findDocumentsByIds,
};
