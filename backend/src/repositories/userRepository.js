'use strict';

const prisma = require('../config/prisma');
const { buildPagination } = require('../utils/pagination');

const PUBLIC_FIELDS = {
  id: true,
  name: true,
  email: true,
  role: true,
  status: true,
  emailVerified: true,
  createdAt: true,
  updatedAt: true,
};

const findById = (id) => prisma.user.findFirst({ where: { id, deletedAt: null } });

const findPublicById = (id) =>
  prisma.user.findFirst({ where: { id, deletedAt: null }, select: PUBLIC_FIELDS });

const findByEmail = (email) =>
  prisma.user.findFirst({ where: { email: email.toLowerCase(), deletedAt: null } });

const create = (data, client = prisma) =>
  client.user.create({ data: { ...data, email: data.email.toLowerCase() } });

const update = (id, data) => prisma.user.update({ where: { id }, data });

const softDelete = (id) =>
  prisma.user.update({ where: { id }, data: { deletedAt: new Date(), status: 'INACTIVE' } });

const list = async ({ page, limit, role, status, search }) => {
  const pagination = buildPagination({ page, limit });
  const where = {
    deletedAt: null,
    ...(role ? { role } : {}),
    ...(status ? { status } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };
  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: PUBLIC_FIELDS,
      skip: pagination.skip,
      take: pagination.take,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);
  return { items, total, pagination };
};

module.exports = {
  PUBLIC_FIELDS,
  findById,
  findPublicById,
  findByEmail,
  create,
  update,
  softDelete,
  list,
};
