'use strict';

const prisma = require('../config/prisma');

const MEDICATION_INCLUDE = {
  drug: { include: { ingredients: { include: { ingredient: true } }, drugClass: true } },
};

const listByPatient = (patientId, { status } = {}) =>
  prisma.patientMedication.findMany({
    where: { patientId, ...(status ? { status } : {}) },
    include: MEDICATION_INCLUDE,
    orderBy: { createdAt: 'desc' },
  });

const listActiveByPatient = (patientId) =>
  prisma.patientMedication.findMany({
    where: { patientId, status: 'ACTIVE' },
    include: MEDICATION_INCLUDE,
  });

const findById = (id) =>
  prisma.patientMedication.findUnique({ where: { id }, include: MEDICATION_INCLUDE });

const create = (data, client = prisma) =>
  client.patientMedication.create({ data, include: MEDICATION_INCLUDE });

const update = (id, data, client = prisma) =>
  client.patientMedication.update({ where: { id }, data, include: MEDICATION_INCLUDE });

module.exports = {
  MEDICATION_INCLUDE,
  listByPatient,
  listActiveByPatient,
  findById,
  create,
  update,
};
