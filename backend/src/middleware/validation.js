import { ValidationError } from '../utils/errors.js';

export function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const formatted = result.error.errors.map((err) => ({
        path: err.path.join('.'),
        message: err.message,
      }));
      return next(new ValidationError('Request body validation failed', formatted));
    }
    req.body = result.data;
    next();
  };
}

export function validateQuery(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const formatted = result.error.errors.map((err) => ({
        path: err.path.join('.'),
        message: err.message,
      }));
      return next(new ValidationError('Query parameter validation failed', formatted));
    }
    req.query = result.data;
    next();
  };
}

export function validateParams(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      const formatted = result.error.errors.map((err) => ({
        path: err.path.join('.'),
        message: err.message,
      }));
      return next(new ValidationError('Route parameters validation failed', formatted));
    }
    req.params = result.data;
    next();
  };
}

