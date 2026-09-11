import { patientService } from '../services/patient.service.js';
import { successResponse } from '../utils/apiResponse.js';

export const patientController = {
  async getPatients(req, res, next) {
    try {
      const result = await patientService.getPatients(req.user, req.query);
      return successResponse(res, result.patients || result);
    } catch (err) {
      next(err);
    }
  },

  async getPatientById(req, res, next) {
    try {
      const patient = await patientService.getPatientById(req.user, req.params.id);
      return successResponse(res, patient);
    } catch (err) {
      next(err);
    }
  },

  async updatePatientProfile(req, res, next) {
    try {
      const updated = await patientService.updatePatientProfile(req.user, req.params.id, req.body);
      return successResponse(res, updated, 200, 'Patient profile updated successfully.');
    } catch (err) {
      next(err);
    }
  },

  async getPatientConditions(req, res, next) {
    try {
      const conditions = await patientService.getPatientConditions(req.user, req.params.patientId);
      return successResponse(res, conditions);
    } catch (err) {
      next(err);
    }
  },

  async addPatientCondition(req, res, next) {
    try {
      const condition = await patientService.addPatientCondition(req.user, req.params.patientId, req.body);
      return successResponse(res, condition, 201, 'Condition added to patient profile.');
    } catch (err) {
      next(err);
    }
  },

  async getPatientAllergies(req, res, next) {
    try {
      const allergies = await patientService.getPatientAllergies(req.user, req.params.patientId);
      return successResponse(res, allergies);
    } catch (err) {
      next(err);
    }
  },

  async addPatientAllergy(req, res, next) {
    try {
      const allergy = await patientService.addPatientAllergy(req.user, req.params.patientId, req.body);
      return successResponse(res, allergy, 201, 'Allergy record documented.');
    } catch (err) {
      next(err);
    }
  },

  async getPatientLabs(req, res, next) {
    try {
      const labs = await patientService.getPatientLabs(req.user, req.params.patientId);
      return successResponse(res, labs);
    } catch (err) {
      next(err);
    }
  },

  async getPatientFactors(req, res, next) {
    try {
      const factors = await patientService.getPatientFactors(req.user, req.params.patientId);
      return successResponse(res, factors);
    } catch (err) {
      next(err);
    }
  },
};

