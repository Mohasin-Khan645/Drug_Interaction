'use strict';

const prisma = require('../config/prisma');
const { buildPagination } = require('../utils/pagination');

const create = (data) => prisma.auditLog.create({ data });

const list = async ({ page, limit, userId, action, resourceType, from, to }) => {
  const pagination = buildPagination({ page, limit });
  const where = {
    ...(userId ? { userId } : {}),
    ...(action ? { action } : {}),
    ...(resourceType ? { resourceType } : {}),
    ...(from || to
      ? { createdAt: { ...(from ? { gte: new Date(from) } : {}), ...(to ? { lte: new Date(to) } : {}) } }
      : {}),
  };
  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip: pagination.skip,
      take: pagination.take,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.auditLog.count({ where }),
  ]);
  return { items, total, pagination };
};

module.exports = { create, list };
