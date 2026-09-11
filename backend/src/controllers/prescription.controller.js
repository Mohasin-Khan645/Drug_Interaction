import { prescriptionService } from '../services/prescription.service.js';
import { successResponse } from '../utils/apiResponse.js';

export const prescriptionController = {
  async upload(req, res, next) {
    try {
      const patientId = req.body?.patientId || req.user?.patientId || null;
      const result = await prescriptionService.uploadAndProcess(req.user, req.file, patientId);
      return successResponse(res, result, 201, 'Prescription uploaded and processed.');
    } catch (err) {
      next(err);
    }
  },

  async getPrescriptions(req, res, next) {
    try {
      const list = await prescriptionService.getPrescriptions(req.user, req.query);
      return successResponse(res, list);
    } catch (err) {
      next(err);
    }
  },

  async getPrescriptionById(req, res, next) {
    try {
      const rx = await prescriptionService.getPrescriptionById(req.user, req.params.id);
      return successResponse(res, rx);
    } catch (err) {
      next(err);
    }
  },

  async confirmCandidate(req, res, next) {
    try {
      const confirmed = await prescriptionService.confirmCandidate(
        req.user,
        req.params.candidateId,
        req.body
      );
      return successResponse(res, confirmed);
    } catch (err) {
      next(err);
    }
  },

  async rejectCandidate(req, res, next) {
    try {
      const rejected = await prescriptionService.rejectCandidate(
        req.user,
        req.params.candidateId,
        req.body?.reason
      );
      return successResponse(res, rejected);
    } catch (err) {
      next(err);
    }
  },
};

