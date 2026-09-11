import { verifyAccessToken } from '../utils/jwt.js';
import { UnauthorizedError } from '../utils/errors.js';
import { ErrorCodes } from '../constants/errorCodes.js';
import { isValidRole } from '../constants/roles.js';

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Authentication required: Missing or malformed Bearer token'));
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyAccessToken(token);
    if (!decoded || !decoded.role || !isValidRole(decoded.role)) {
      return next(new UnauthorizedError('Invalid authentication token: Missing or unauthorized clinical role claim'));
    }
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('Session expired: Access token has expired', ErrorCodes.TOKEN_EXPIRED));
    }
    return next(new UnauthorizedError('Invalid authentication token'));
  }
}

export function optionalAuthenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = verifyAccessToken(token);
      req.user = decoded;
    } catch {
      // Ignore token verification errors for optional auth
    }
  }
  next();
}

