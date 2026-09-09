'use strict';

const prisma = require('../config/prisma');

const createRefreshToken = (data, client = prisma) => client.refreshToken.create({ data });

const findRefreshByHash = (tokenHash) =>
  prisma.refreshToken.findUnique({ where: { tokenHash }, include: { user: true } });

const revokeRefreshToken = (id, client = prisma) =>
  client.refreshToken.update({ where: { id }, data: { revokedAt: new Date() } });

const revokeAllForUser = (userId, client = prisma) =>
  client.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });

const createVerificationToken = (data) => prisma.verificationToken.create({ data });

const findVerificationByHash = (tokenHash) =>
  prisma.verificationToken.findUnique({ where: { tokenHash }, include: { user: true } });

const consumeVerificationToken = (id, client = prisma) =>
  client.verificationToken.update({ where: { id }, data: { usedAt: new Date() } });

module.exports = {
  createRefreshToken,
  findRefreshByHash,
  revokeRefreshToken,
  revokeAllForUser,
  createVerificationToken,
  findVerificationByHash,
  consumeVerificationToken,
};
