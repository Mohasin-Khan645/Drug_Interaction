'use strict';

const ApiError = require('../utils/apiError');

const authorize = (...roles) => (req, res, next) => {
  if (!req.user) return next(ApiError.unauthenticated());
  if (roles.length > 0 && !roles.includes(req.user.role)) {
    return next(ApiError.forbidden('Your role does not grant access to this resource'));
  }
  return next();
};

module.exports = authorize;
