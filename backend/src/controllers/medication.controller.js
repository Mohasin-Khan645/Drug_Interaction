import { medicationService } from '../services/medication.service.js';
import { successResponse } from '../utils/apiResponse.js';

export const medicationController = {
  async getMedications(req, res, next) {
    try {
      const medications = await medicationService.getMedications(req.user, req.query);
      return successResponse(res, medications);
    } catch (err) {
      next(err);
    }
  },

  async getMedicationById(req, res, next) {
    try {
      const medication = await medicationService.getMedicationById(req.user, req.params.id);
      return successResponse(res, medication);
    } catch (err) {
      next(err);
    }
  },

  async addMedication(req, res, next) {
    try {
      const created = await medicationService.addMedication(req.user, req.body);
      return successResponse(res, created, 201, 'Medication recorded on active profile.');
    } catch (err) {
      next(err);
    }
  },

  async updateMedication(req, res, next) {
    try {
      const updated = await medicationService.updateMedication(req.user, req.params.id, req.body);
      return successResponse(res, updated, 200, 'Medication updated successfully.');
    } catch (err) {
      next(err);
    }
  },

  async deleteMedication(req, res, next) {
    try {
      await medicationService.deleteMedication(req.user, req.params.id);
      return successResponse(res, { success: true }, 200, 'Medication safely discontinued.');
    } catch (err) {
      next(err);
    }
  },
};

