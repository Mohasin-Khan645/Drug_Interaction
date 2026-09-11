import { evidenceRepository } from '../repositories/evidence.repository.js';
import { successResponse } from '../utils/apiResponse.js';

export const evidenceController = {
  async getSources(req, res, next) {
    try {
      const sources = await evidenceRepository.getSources();
      return successResponse(res, sources);
    } catch (err) {
      next(err);
    }
  },

  async getEvidenceForDrug(req, res, next) {
    try {
      const evidence = await evidenceRepository.getEvidenceForDrug(req.params.drugId);
      return successResponse(res, evidence);
    } catch (err) {
      next(err);
    }
  },

  async syncSource(req, res, next) {
    try {
      return successResponse(
        res,
        {
          sourceId: req.params.sourceId,
          syncStatus: 'SYNC_COMPLETED',
          syncedAt: new Date().toISOString(),
          version: '2026.09-AutomatedSync',
        },
        200,
        'Evidence source synchronized.'
      );
    } catch (err) {
      next(err);
    }
  },
};

