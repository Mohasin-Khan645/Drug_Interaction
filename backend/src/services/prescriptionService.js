'use strict';

const prescriptionRepository = require('../repositories/prescriptionRepository');
const ocrService = require('./ocrService');
const auditService = require('./auditService');
const ApiError = require('../utils/apiError');
const { AUDIT_ACTIONS, CONFIDENCE } = require('../constants');
const { getStorageProvider } = require('../integrations/storage');
const { ACCESS_LEVEL, assertPatientAccess } = require('./patientAccessService');

const createPrescription = async (user, { patientId, notes }, file, req) => {
  await assertPatientAccess(user, patientId, ACCESS_LEVEL.WRITE, req);

  const prescription = await prescriptionRepository.create({
    patientId,
    uploadedById: user.id,
    notes,
  });

  if (file) {
    const stored = await getStorageProvider().put(file.buffer, {
      mimeType: file.detectedMimeType || file.mimetype,
    });
    await prescriptionRepository.addImage({
      prescriptionId: prescription.id,
      storageKey: stored.key,
      mimeType: file.detectedMimeType || file.mimetype,
      sizeBytes: file.size,
      checksum: stored.checksum,
    });
  }

  await auditService.record({
    req,
    userId: user.id,
    action: AUDIT_ACTIONS.PRESCRIPTION_UPLOAD,
    resourceType: 'Prescription',
    resourceId: prescription.id,
    metadata: { hasImage: Boolean(file) },
  });

  return prescriptionRepository.findById(prescription.id);
};

const getPrescription = async (user, id, req) => {
  const prescription = await prescriptionRepository.findById(id);
  if (!prescription) throw ApiError.notFound('Prescription not found');
  await assertPatientAccess(user, prescription.patientId, ACCESS_LEVEL.READ, req);
  return prescription;
};

/**
 * OCR + normalization. Every produced item starts as PENDING_REVIEW: a
 * high-confidence single match is proposed, never silently accepted.
 */
const processPrescription = async (user, id, req) => {
  const prescription = await getPrescription(user, id, req);
  if (prescription.images.length === 0) {
    throw ApiError.badRequest('Prescription has no uploaded image to process');
  }

  await prescriptionRepository.updateStatus(id, 'PROCESSING');
  const image = prescription.images[0];

  let ocr;
  try {
    const buffer = await getStorageProvider().get(image.storageKey);
    ocr = await ocrService.process(buffer, { mimeType: image.mimeType });
  } catch (err) {
    await prescriptionRepository.updateStatus(id, 'FAILED');
    throw err;
  }

  const items = ocr.candidates.map((candidate) => {
    const best = candidate.matches[0];
    return {
      rawText: candidate.rawText,
      candidateDrugId: best ? best.candidateDrugId : null,
      displayName: best ? best.displayName : null,
      confidence: best ? best.confidence : 0,
      matchType: best ? best.matchType : null,
      strength: candidate.strength,
      status: 'PENDING_REVIEW',
    };
  });

  const updated = await prescriptionRepository.saveProcessingResult({
    prescriptionId: id,
    imageId: image.id,
    provider: ocr.provider,
    text: ocr.text,
    confidence: ocr.confidence,
    candidates: ocr.candidates,
    items,
  });

  await auditService.record({
    req,
    userId: user.id,
    action: AUDIT_ACTIONS.OCR_PROCESSING,
    resourceType: 'Prescription',
    resourceId: id,
    metadata: { provider: ocr.provider, itemsExtracted: items.length },
  });

  return updated;
};

const listItems = async (user, id, req) => {
  await getPrescription(user, id, req);
  return prescriptionRepository.listItems(id);
};

const confirmItem = async (user, itemId, { drugId, status, strength, doseForm, route, frequency }, req) => {
  const item = await prescriptionRepository.findItemById(itemId);
  if (!item) throw ApiError.notFound('Prescription item not found');
  await assertPatientAccess(user, item.prescription.patientId, ACCESS_LEVEL.WRITE, req);

  if (status === 'CONFIRMED' && !drugId && !item.candidateDrugId) {
    throw ApiError.badRequest('A drug must be selected before confirming this item');
  }
  if (status === 'CONFIRMED' && !drugId && item.confidence < CONFIDENCE.AUTO_CONFIRM_MIN) {
    throw ApiError.badRequest('Low-confidence matches must be confirmed with an explicit drugId');
  }

  const updated = await prescriptionRepository.updateItem(itemId, {
    ...(drugId ? { candidateDrugId: drugId } : {}),
    ...(strength !== undefined ? { strength } : {}),
    ...(doseForm !== undefined ? { doseForm } : {}),
    ...(route !== undefined ? { route } : {}),
    ...(frequency !== undefined ? { frequency } : {}),
    status,
  });

  await auditService.record({
    req,
    userId: user.id,
    action: AUDIT_ACTIONS.MEDICATION_CHANGE,
    resourceType: 'PrescriptionItem',
    resourceId: itemId,
    metadata: { status },
  });

  return updated;
};

module.exports = { createPrescription, getPrescription, processPrescription, listItems, confirmItem };
