'use strict';

const prisma = require('../config/prisma');

const PRESCRIPTION_INCLUDE = {
  images: { select: { id: true, mimeType: true, sizeBytes: true, createdAt: true, storageKey: true } },
  items: { include: { candidateDrug: true } },
  ocr: true,
};

const create = (data) => prisma.prescription.create({ data, include: PRESCRIPTION_INCLUDE });

const findById = (id) =>
  prisma.prescription.findUnique({ where: { id }, include: PRESCRIPTION_INCLUDE });

const listByPatient = (patientId) =>
  prisma.prescription.findMany({
    where: { patientId },
    include: PRESCRIPTION_INCLUDE,
    orderBy: { createdAt: 'desc' },
  });

const addImage = (data) => prisma.prescriptionImage.create({ data });

const updateStatus = (id, status, client = prisma) =>
  client.prescription.update({ where: { id }, data: { status } });

const listItems = (prescriptionId) =>
  prisma.prescriptionItem.findMany({
    where: { prescriptionId },
    include: { candidateDrug: true },
    orderBy: { createdAt: 'asc' },
  });

const findItemById = (id) =>
  prisma.prescriptionItem.findUnique({ where: { id }, include: { prescription: true } });

const updateItem = (id, data, client = prisma) =>
  client.prescriptionItem.update({ where: { id }, data });

// One transaction so a prescription is never left half-processed.
const saveProcessingResult = ({ prescriptionId, imageId, provider, text, confidence, candidates, items }) =>
  prisma.$transaction(async (tx) => {
    await tx.ocrResult.create({
      data: { prescriptionId, imageId, provider, text, confidence, candidates },
    });
    await tx.prescriptionItem.deleteMany({
      where: { prescriptionId, status: 'PENDING_REVIEW' },
    });
    for (const item of items) {
      await tx.prescriptionItem.create({ data: { ...item, prescriptionId } });
    }
    await tx.prescription.update({ where: { id: prescriptionId }, data: { status: 'PROCESSED' } });
    return tx.prescription.findUnique({ where: { id: prescriptionId }, include: PRESCRIPTION_INCLUDE });
  });

module.exports = {
  PRESCRIPTION_INCLUDE,
  create,
  findById,
  listByPatient,
  addImage,
  updateStatus,
  listItems,
  findItemById,
  updateItem,
  saveProcessingResult,
};
