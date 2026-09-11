/**
 * Standardized API response format
 */
export function successResponse(res, data = {}, statusCode = 200, message = null) {
  const payload = {
    success: true,
    data,
  };
  if (message) {
    payload.message = message;
  }
  return res.status(statusCode).json(payload);
}

export function errorResponse(res, code, message, statusCode = 400, details = null) {
  const payload = {
    success: false,
    error: {
      code,
      message,
    },
  };
  if (details) {
    payload.error.details = details;
  }
  return res.status(statusCode).json(payload);
}

