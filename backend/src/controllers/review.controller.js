import { reviewService } from '../services/review.service.js';
import { successResponse } from '../utils/apiResponse.js';

export const reviewController = {
  async submitReview(req, res, next) {
    try {
      const payload = {
        findingId: req.params?.findingId || req.body?.findingId,
        ...req.body,
      };
      const review = await reviewService.submitReview(req.user, payload);
      return successResponse(res, review, 201, 'Clinician safety sign-off recorded.');
    } catch (err) {
      next(err);
    }
  },

  async getPendingReviews(req, res, next) {
    try {
      const pending = await reviewService.getPendingReviews(req.user, req.query);
      return successResponse(res, pending);
    } catch (err) {
      next(err);
    }
  },

  async getReviewById(req, res, next) {
    try {
      const review = await reviewService.getReviewById(req.user, req.params.id);
      return successResponse(res, review);
    } catch (err) {
      next(err);
    }
  },
};

