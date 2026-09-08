'use strict';

const sendSuccess = (res, data, statusCode = 200) =>
  res.status(statusCode).json({ success: true, data });

const sendError = (res, statusCode, code, message, details) => {
  const error = { code, message };
  if (details) error.details = details;
  return res.status(statusCode).json({ success: false, error });
};

module.exports = { sendSuccess, sendError };
