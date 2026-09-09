'use strict';

const { Prisma } = require('@prisma/client');
const ApiError = require('../utils/apiError');
const { sendError } = require('../utils/response');
const { ERROR_CODES } = require('../constants');
const config = require('../config');
const logger = require('../config/logger');

const mapPrismaError = (err) => {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return ApiError.conflict('A record with these unique values already exists');
    }
    if (err.code === 'P2025') {
      return ApiError.notFound('Requested record was not found');
    }
    if (err.code === 'P2003') {
      return ApiError.badRequest('Related record does not exist');
    }
    return new ApiError(400, ERROR_CODES.DATABASE_ERROR, 'Database request failed');
  }
  if (err instanceof Prisma.PrismaClientValidationError) {
    return new ApiError(400, ERROR_CODES.DATABASE_ERROR, 'Invalid database query');
  }
  return null;
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let error = err instanceof ApiError ? err : mapPrismaError(err);

  if (!error && err && err.type === 'entity.too.large') {
    error = new ApiError(413, ERROR_CODES.PAYLOAD_TOO_LARGE, 'Request payload too large');
  }
  if (!error && err && err.code === 'LIMIT_FILE_SIZE') {
    error = new ApiError(413, ERROR_CODES.PAYLOAD_TOO_LARGE, 'Uploaded file is too large');
  }
  if (!error) {
    error = ApiError.internal();
  }

  if (error.statusCode >= 500) {
    logger.error({ err, requestId: req.id, path: req.originalUrl }, 'Unhandled request error');
  } else {
    logger.warn(
      { code: error.code, requestId: req.id, path: req.originalUrl },
      'Request failed'
    );
  }

  const details =
    error.details || (config.env !== 'production' && error.statusCode >= 500 ? { stack: err.stack } : undefined);

  return sendError(res, error.statusCode, error.code, error.message, details);
};

module.exports = errorHandler;
