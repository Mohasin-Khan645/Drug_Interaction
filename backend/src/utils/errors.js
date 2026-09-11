import { ErrorCodes } from '../constants/errorCodes.js';

export class AppError extends Error {
  constructor(message, statusCode = 500, code = ErrorCodes.INTERNAL_SERVER_ERROR, details = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, 400, ErrorCodes.VALIDATION_ERROR, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required', code = ErrorCodes.UNAUTHORIZED) {
    super(message, 401, code);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Access denied: insufficient permissions', code = ErrorCodes.FORBIDDEN) {
    super(message, 403, code);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', code = ErrorCodes.NOT_FOUND) {
    super(message, 404, code);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource conflict detected', code = ErrorCodes.CONFLICT) {
    super(message, 409, code);
  }
}

export class InsufficientEvidenceError extends AppError {
  constructor(message = 'Insufficient verified clinical evidence to provide a grounded response.') {
    super(message, 422, ErrorCodes.INSUFFICIENT_VERIFIED_EVIDENCE);
  }
}

