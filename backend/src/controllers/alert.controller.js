import { notificationService } from '../services/notification.service.js';
import { successResponse } from '../utils/apiResponse.js';

export const alertController = {
  async getAlerts(req, res, next) {
    try {
      const alerts = await notificationService.getAlerts(req.user, req.query);
      return successResponse(res, alerts);
    } catch (err) {
      next(err);
    }
  },

  async markAsRead(req, res, next) {
    try {
      const result = await notificationService.markAsRead(req.user, req.params.id);
      return successResponse(res, result);
    } catch (err) {
      next(err);
    }
  },

  async markAllAsRead(req, res, next) {
    try {
      const result = await notificationService.markAllAsRead(req.user);
      return successResponse(res, result);
    } catch (err) {
      next(err);
    }
  },

  async archiveAlert(req, res, next) {
    try {
      const result = await notificationService.archiveAlert(req.user, req.params.id);
      return successResponse(res, result);
    } catch (err) {
      next(err);
    }
  },
};

