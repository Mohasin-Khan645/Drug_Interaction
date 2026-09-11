import { ForbiddenError, UnauthorizedError } from '../utils/errors.js';
import { hasPermission } from '../constants/permissions.js';
import { UserRole } from '../constants/roles.js';

/**
 * Role-Based Access Control Middleware (Role checking)
 */
export function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required before authorization check'));
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `Forbidden: Role '${req.user.role}' is not authorized to access this resource. Allowed roles: ${allowedRoles.join(', ')}`
        )
      );
    }

    next();
  };
}

/**
 * Granular Permission-Based Access Control Middleware (PBAC)
 */
export function requirePermission(...requiredPermissions) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required before permission check'));
    }

    const missing = requiredPermissions.filter((perm) => !hasPermission(req.user, perm));
    if (missing.length > 0) {
      return next(
        new ForbiddenError(
          `Forbidden: Missing required clinical permission(s): ${missing.join(', ')}`
        )
      );
    }

    next();
  };
}

/**
 * Attribute-Based Access Control (ABAC) for licensed clinical operations
 */
export function requireActiveClinician() {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    const isClinician = req.user.role === UserRole.DOCTOR || req.user.role === UserRole.PHARMACIST;
    if (!isClinician) {
      return next(new ForbiddenError('Clinical credential required: Only licensed Physicians and Pharmacists may perform this action.'));
    }

    next();
  };
}

/**
 * Convenience role guards for explicit 4-role portal routing
 */
export const requireAdmin = () => authorize(UserRole.ADMIN);
export const requireDoctor = () => authorize(UserRole.DOCTOR);
export const requirePharmacist = () => authorize(UserRole.PHARMACIST);
export const requirePatient = () => authorize(UserRole.PATIENT);
export const requireAnyRole = (...roles) => authorize(...roles);

/**
 * Explicit exclusion guard (e.g. forbid patients from clinical review endpoints)
 */
export function forbidRole(...forbiddenRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required before authorization check'));
    }

    if (forbiddenRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `Forbidden: Role '${req.user.role}' is prohibited from accessing this resource.`
        )
      );
    }

    next();
  };
}


