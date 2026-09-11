import { MedicationReconciliationService } from '../services/reconciliation.service.js';
import { successResponse } from '../utils/apiResponse.js';

export const reconciliationController = {
  async runReconciliation(req, res, next) {
    try {
      const result = await MedicationReconciliationService.reconcile(req.body);
      return successResponse(res, result);
    } catch (err) {
      next(err);
    }
  },

  async resolveDiscrepancy(req, res, next) {
    try {
      const { id } = req.params;
      return successResponse(
        res,
        {
          id,
          resolutionStatus: 'RESOLVED',
          resolvedAt: new Date().toISOString(),
          ...req.body,
        },
        200,
        'Reconciliation discrepancy resolved.'
      );
    } catch (err) {
      next(err);
    }
  },
};

