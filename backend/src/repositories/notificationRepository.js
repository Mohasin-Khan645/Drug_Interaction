'use strict';

const prisma = require('../config/prisma');
const { buildPagination } = require('../utils/pagination');

// dedupeKey + the unique index keeps repeated safety checks from re-alerting on
// findings that have not changed.
const createIfAbsent = async (data, client = prisma) => {
  if (!data.dedupeKey) return client.notification.create({ data });
  const existing = await client.notification.findUnique({
    where: { userId_dedupeKey: { userId: data.userId, dedupeKey: data.dedupeKey } },
  });
  if (existing) return null;
  try {
    return await client.notification.create({ data });
  } catch (err) {
    if (err.code === 'P2002') return null;
    throw err;
  }
};

const listForUser = async (userId, { page, limit, unreadOnly }) => {
  const pagination = buildPagination({ page, limit });
  const where = { userId, ...(unreadOnly ? { readAt: null } : {}) };
  const [items, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      skip: pagination.skip,
      take: pagination.take,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.notification.count({ where }),
  ]);
  return { items, total, pagination };
};

const markRead = (id, userId) =>
  prisma.notification.updateMany({ where: { id, userId }, data: { readAt: new Date() } });

const markAllRead = (userId) =>
  prisma.notification.updateMany({ where: { userId, readAt: null }, data: { readAt: new Date() } });

module.exports = { createIfAbsent, listForUser, markRead, markAllRead };
