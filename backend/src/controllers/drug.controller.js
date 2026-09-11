import { drugService } from '../services/drug.service.js';
import { successResponse } from '../utils/apiResponse.js';

export const drugController = {
  async searchDrugs(req, res, next) {
    try {
      const result = await drugService.searchDrugs(req.query);
      return successResponse(res, result.drugs || result);
    } catch (err) {
      next(err);
    }
  },

  async getDrugById(req, res, next) {
    try {
      const drug = await drugService.getDrugById(req.params.id);
      return successResponse(res, drug);
    } catch (err) {
      next(err);
    }
  },

  async getDrugClasses(req, res, next) {
    try {
      const classes = await drugService.getDrugClasses();
      return successResponse(res, classes);
    } catch (err) {
      next(err);
    }
  },

  async getDrugInteractions(req, res, next) {
    try {
      const interactions = await drugService.getDrugInteractions(req.params.id);
      return successResponse(res, interactions);
    } catch (err) {
      next(err);
    }
  },

  async createDrug(req, res, next) {
    try {
      const drug = await drugService.createDrug(req.body);
      return successResponse(res, drug, 201, 'Drug registered in pharmaceutical formulary.');
    } catch (err) {
      next(err);
    }
  },
};

