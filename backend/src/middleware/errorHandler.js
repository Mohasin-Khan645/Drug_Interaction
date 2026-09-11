import { AppError } from '../utils/errors.js';
import { ErrorCodes } from '../constants/errorCodes.js';
import { logger } from '../config/logger.js';
import { env } from '../config/env.js';

export function errorHandler(err, req, res, next) {
  // Structured logging of error
  logger.error(
    {
      err: {
        message: err.message,
        name: err.name,
        code: err.code,
        stack: env.NODE_ENV === 'production' ? undefined : err.stack,
      },
      method: req.method,
      url: req.originalUrl,
      userId: req.user?.id,
    },
    'Request Error Handler'
  );

  // AppError (Known operational medical / business / validation error)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details && { details: err.details }),
      },
    });
  }

  // Handle Prisma Database Known Request Errors
  if (err.code && err.code.startsWith('P')) {
    if (err.code === 'P2002') {
      const target = err.meta?.target || 'Field';
      return res.status(409).json({
        success: false,
        error: {
          code: ErrorCodes.CONFLICT,
          message: `A record with this ${Array.isArray(target) ? target.join(', ') : target} already exists.`,
        },
      });
    }

    if (err.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: {
          code: ErrorCodes.NOT_FOUND,
          message: 'The requested medical record or resource was not found.',
        },
      });
    }
  }

  // Handle JSON parse syntax errors
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: {
        code: ErrorCodes.VALIDATION_ERROR,
        message: 'Malformed JSON payload provided.',
      },
    });
  }

  // Unknown internal server error
  const statusCode = err.statusCode || 500;
  const message =
    env.NODE_ENV === 'production'
      ? 'An internal clinical system error occurred. Please contact system administration.'
      : err.message || 'Internal Server Error';

  return res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || ErrorCodes.INTERNAL_SERVER_ERROR,
      message,
      ...(env.NODE_ENV !== 'production' && { stack: err.stack }),
    },
  });
}

