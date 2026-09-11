import { describe, it, expect } from 'vitest';
import {
  authorize,
  requirePermission,
  requireActiveClinician,
  requireAdmin,
  requireDoctor,
  requirePharmacist,
  requirePatient,
  forbidRole,
} from '../../src/middleware/rbac.js';
import { UserRole } from '../../src/constants/roles.js';
import { Permissions, getPermissionsForRole } from '../../src/constants/permissions.js';

describe('Phase 3: Backend RBAC 4-Role Authorization Matrix', () => {
  const mockUser = (role, customPerms = null) => ({
    id: `usr-${role.toLowerCase()}-1`,
    name: `Test ${role}`,
    role,
    permissions: customPerms || getPermissionsForRole(role),
  });

  const runMiddleware = (middleware, user) => {
    let nextCalled = false;
    let nextError = null;
    const req = { user };
    const res = {};
    const next = (err) => {
      nextCalled = true;
      nextError = err;
    };
    middleware(req, res, next);
    return { nextCalled, nextError };
  };

  describe('Clinical Review RBAC Boundaries (Doctor/Pharmacist vs Patient/Admin)', () => {
    const reviewMiddleware = authorize(UserRole.DOCTOR, UserRole.PHARMACIST);

    it('permits DOCTOR to submit clinical reviews', () => {
      const { nextCalled, nextError } = runMiddleware(reviewMiddleware, mockUser(UserRole.DOCTOR));
      expect(nextCalled).toBe(true);
      expect(nextError).toBeFalsy();
    });

    it('permits PHARMACIST to submit clinical reviews', () => {
      const { nextCalled, nextError } = runMiddleware(reviewMiddleware, mockUser(UserRole.PHARMACIST));
      expect(nextCalled).toBe(true);
      expect(nextError).toBeFalsy();
    });

    it('strictly forbids PATIENT from submitting clinical reviews with 403 Forbidden', () => {
      const { nextCalled, nextError } = runMiddleware(reviewMiddleware, mockUser(UserRole.PATIENT));
      expect(nextCalled).toBe(true);
      expect(nextError).toBeDefined();
      expect(nextError.statusCode).toBe(403);
      expect(nextError.message).toContain("Role 'PATIENT' is not authorized");
    });

    it('strictly forbids ADMIN from submitting clinical reviews (requires clinical license)', () => {
      const { nextCalled, nextError } = runMiddleware(reviewMiddleware, mockUser(UserRole.ADMIN));
      expect(nextCalled).toBe(true);
      expect(nextError).toBeDefined();
      expect(nextError.statusCode).toBe(403);
      expect(nextError.message).toContain("Role 'ADMIN' is not authorized");
    });
  });

  describe('Medication Reconciliation RBAC Boundaries', () => {
    const reconciliationMiddleware = authorize(UserRole.DOCTOR, UserRole.PHARMACIST);

    it('permits DOCTOR to run reconciliation and resolve discrepancies', () => {
      const { nextCalled, nextError } = runMiddleware(reconciliationMiddleware, mockUser(UserRole.DOCTOR));
      expect(nextCalled).toBe(true);
      expect(nextError).toBeFalsy();
    });

    it('permits PHARMACIST to run reconciliation and resolve discrepancies', () => {
      const { nextCalled, nextError } = runMiddleware(reconciliationMiddleware, mockUser(UserRole.PHARMACIST));
      expect(nextCalled).toBe(true);
      expect(nextError).toBeFalsy();
    });

    it('strictly denies PATIENT from resolving discrepancies', () => {
      const { nextCalled, nextError } = runMiddleware(reconciliationMiddleware, mockUser(UserRole.PATIENT));
      expect(nextCalled).toBe(true);
      expect(nextError).toBeDefined();
      expect(nextError.statusCode).toBe(403);
    });
  });

  describe('System Administration & Governance RBAC Boundaries', () => {
    const adminMiddleware = requireAdmin();

    it('permits ADMIN to access system administration and user management', () => {
      const { nextCalled, nextError } = runMiddleware(adminMiddleware, mockUser(UserRole.ADMIN));
      expect(nextCalled).toBe(true);
      expect(nextError).toBeFalsy();
    });

    it('strictly forbids DOCTOR from accessing admin governance with 403', () => {
      const { nextCalled, nextError } = runMiddleware(adminMiddleware, mockUser(UserRole.DOCTOR));
      expect(nextCalled).toBe(true);
      expect(nextError).toBeDefined();
      expect(nextError.statusCode).toBe(403);
    });

    it('strictly forbids PHARMACIST from accessing admin governance with 403', () => {
      const { nextCalled, nextError } = runMiddleware(adminMiddleware, mockUser(UserRole.PHARMACIST));
      expect(nextCalled).toBe(true);
      expect(nextError).toBeDefined();
      expect(nextError.statusCode).toBe(403);
    });

    it('strictly forbids PATIENT from accessing admin governance with 403', () => {
      const { nextCalled, nextError } = runMiddleware(adminMiddleware, mockUser(UserRole.PATIENT));
      expect(nextCalled).toBe(true);
      expect(nextError).toBeDefined();
      expect(nextError.statusCode).toBe(403);
    });
  });

  describe('ABAC Clinician Licensing & Exclusion Guards', () => {
    it('requireActiveClinician allows DOCTOR and PHARMACIST but blocks PATIENT and ADMIN', () => {
      const abac = requireActiveClinician();

      expect(runMiddleware(abac, mockUser(UserRole.DOCTOR)).nextError).toBeFalsy();
      expect(runMiddleware(abac, mockUser(UserRole.PHARMACIST)).nextError).toBeFalsy();

      const patientResult = runMiddleware(abac, mockUser(UserRole.PATIENT));
      expect(patientResult.nextError).toBeDefined();
      expect(patientResult.nextError.statusCode).toBe(403);

      const adminResult = runMiddleware(abac, mockUser(UserRole.ADMIN));
      expect(adminResult.nextError).toBeDefined();
      expect(adminResult.nextError.statusCode).toBe(403);
    });

    it('forbidRole strictly blocks target roles while allowing all other roles', () => {
      const nonPatientGuard = forbidRole(UserRole.PATIENT);

      // Patient is prohibited
      const patientRes = runMiddleware(nonPatientGuard, mockUser(UserRole.PATIENT));
      expect(patientRes.nextError).toBeDefined();
      expect(patientRes.nextError.statusCode).toBe(403);
      expect(patientRes.nextError.message).toContain("Role 'PATIENT' is prohibited");

      // Others are allowed
      expect(runMiddleware(nonPatientGuard, mockUser(UserRole.DOCTOR)).nextError).toBeFalsy();
      expect(runMiddleware(nonPatientGuard, mockUser(UserRole.PHARMACIST)).nextError).toBeFalsy();
      expect(runMiddleware(nonPatientGuard, mockUser(UserRole.ADMIN)).nextError).toBeFalsy();
    });

    it('granular permission checks (PBAC) enforce permissions against role definitions', () => {
      const checkOverride = requirePermission(Permissions.CLINICAL_REVIEW_OVERRIDE);

      // Doctor has override
      expect(runMiddleware(checkOverride, mockUser(UserRole.DOCTOR)).nextError).toBeFalsy();
      // Pharmacist has override
      expect(runMiddleware(checkOverride, mockUser(UserRole.PHARMACIST)).nextError).toBeFalsy();
      // Admin has wildcard (*)
      expect(runMiddleware(checkOverride, mockUser(UserRole.ADMIN)).nextError).toBeFalsy();
      // Patient lacks override
      const patientRes = runMiddleware(checkOverride, mockUser(UserRole.PATIENT));
      expect(patientRes.nextError).toBeDefined();
      expect(patientRes.nextError.statusCode).toBe(403);
    });
  });
});

