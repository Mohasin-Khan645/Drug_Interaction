import { adminService } from '../services/admin.service.js';
import { successResponse } from '../utils/apiResponse.js';

export const adminController = {
  async getUsers(req, res, next) {
    try {
      const users = await adminService.getUsers(req.query);
      return successResponse(res, users.users || users);
    } catch (err) {
      next(err);
    }
  },

  async updateUser(req, res, next) {
    try {
      const updated = await adminService.updateUser(req.params.id, req.body);
      return successResponse(res, updated, 200, 'User profile updated.');
    } catch (err) {
      next(err);
    }
  },

  async getRules(req, res, next) {
    try {
      const rules = await adminService.getRules(req.query);
      return successResponse(res, rules);
    } catch (err) {
      next(err);
    }
  },

  async createRule(req, res, next) {
    try {
      const rule = {
        id: `rule-${Date.now()}`,
        ...req.body,
      };
      return successResponse(res, rule, 201, 'Clinical rule registered.');
    } catch (err) {
      next(err);
    }
  },

  async updateRule(req, res, next) {
    try {
      const rule = {
        id: req.params.id,
        ...req.body,
      };
      return successResponse(res, rule, 200, 'Clinical rule updated.');
    } catch (err) {
      next(err);
    }
  },

  async toggleRuleStatus(req, res, next) {
    try {
      return successResponse(res, { id: req.params.id, status: req.body.status });
    } catch (err) {
      next(err);
    }
  },

  async getAnalytics(req, res, next) {
    try {
      const analytics = await adminService.getAnalytics();
      return successResponse(res, analytics);
    } catch (err) {
      next(err);
    }
  },

  async getSettings(req, res, next) {
    try {
      const settings = await adminService.getSettings();
      return successResponse(res, settings);
    } catch (err) {
      next(err);
    }
  },

  async updateSettings(req, res, next) {
    try {
      return successResponse(res, req.body, 200, 'System settings updated.');
    } catch (err) {
      next(err);
    }
  },
};

