import { NormalizationService } from '../services/normalization.service.js';
import { successResponse } from '../utils/apiResponse.js';

export const normalizationController = {
  async resolve(req, res, next) {
    try {
      const { rawName } = req.body;
      const result = await NormalizationService.normalize(rawName);
      return successResponse(res, result);
    } catch (err) {
      next(err);
    }
  },

  async searchRxNorm(req, res, next) {
    try {
      const { term } = req.query;
      const result = await NormalizationService.normalize(term);
      return successResponse(res, result.candidates || []);
    } catch (err) {
      next(err);
    }
  },

  async getAtcClassification(req, res, next) {
    try {
      const { code } = req.params;
      return successResponse(res, {
        code,
        system: 'Anatomical Therapeutic Chemical (ATC)',
        description: 'Classified pharmacological subgroup',
      });
    } catch (err) {
      next(err);
    }
  },
};

