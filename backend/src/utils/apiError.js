'use strict';

const { ERROR_CODES } = require('../constants');

class ApiError extends Error {
  constructor(statusCode, code, message, details) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, ApiError);
  }

  static badRequest(message, details) {
    return new ApiError(400, ERROR_CODES.VALIDATION_ERROR, message, details);
  }

  static unauthenticated(message = 'Authentication required') {
    return new ApiError(401, ERROR_CODES.UNAUTHENTICATED, message);
  }

  static invalidCredentials(message = 'Invalid email or password') {
    return new ApiError(401, ERROR_CODES.INVALID_CREDENTIALS, message);
  }

  static forbidden(message = 'You are not allowed to perform this action') {
    return new ApiError(403, ERROR_CODES.FORBIDDEN, message);
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(404, ERROR_CODES.NOT_FOUND, message);
  }

  static conflict(message, details) {
    return new ApiError(409, ERROR_CODES.CONFLICT, message, details);
  }

  static unsupportedMedia(message = 'Unsupported file type') {
    return new ApiError(415, ERROR_CODES.UNSUPPORTED_MEDIA_TYPE, message);
  }

  static external(code, message) {
    return new ApiError(502, code, message);
  }

  static internal(message = 'Unexpected server error') {
    return new ApiError(500, ERROR_CODES.INTERNAL_ERROR, message);
  }
}

module.exports = ApiError;
