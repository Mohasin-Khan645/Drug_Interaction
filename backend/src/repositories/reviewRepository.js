'use strict';

const prisma = require('../config/prisma');

const create = (data, client = prisma) =>
  client.clinicianReview.create({
    data,
    include: { reviewer: { select: { id: true, name: true, role: true } } },
  });

const listByFinding = (findingId) =>
  prisma.clinicianReview.findMany({
    where: { findingId },
    include: { reviewer: { select: { id: true, name: true, role: true } } },
    orderBy: { createdAt: 'desc' },
  });

const listByReviewer = (reviewerId) =>
  prisma.clinicianReview.findMany({ where: { reviewerId }, orderBy: { createdAt: 'desc' } });

module.exports = { create, listByFinding, listByReviewer };
