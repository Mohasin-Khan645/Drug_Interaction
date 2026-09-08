'use strict';

const ApiError = require('../utils/apiError');

const formatIssues = (error) =>
  error.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }));

const validate = (schemas) => (req, res, next) => {
  for (const key of ['body', 'query', 'params']) {
    const schema = schemas[key];
    if (!schema) continue;
    const result = schema.safeParse(req[key]);
    if (!result.success) {
      return next(ApiError.badRequest(`Invalid request ${key}`, formatIssues(result.error)));
    }
    if (key === 'query') {
      req.validatedQuery = result.data;
    } else {
      req[key] = result.data;
    }
  }
  return next();
};

module.exports = validate;
