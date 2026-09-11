import { describe, it, expect, beforeEach } from 'vitest';
import { authService } from '../../src/services/auth.service.js';
import { userRepository } from '../../src/repositories/user.repository.js';
import { UserRole, ROLE_PORTALS } from '../../src/constants/roles.js';
import { verifyAccessToken, signAccessToken } from '../../src/utils/jwt.js';
import { authenticate } from '../../src/middleware/auth.js';

describe('Phase 2: Authentication Security & Authoritative Role Binding', () => {
  beforeEach(async () => {
    // Ensure all test accounts are unlocked
    const doc = await userRepository.findByEmail('doctor@example.com');
    if (doc) await userRepository.unlockAccount(doc.id);

    const pat = await userRepository.findByEmail('patient@example.com');
    if (pat) await userRepository.unlockAccount(pat.id);

    const pharm = await userRepository.findByEmail('pharmacist@example.com');
    if (pharm) await userRepository.unlockAccount(pharm.id);

    const admin = await userRepository.findByEmail('admin@example.com');
    if (admin) await userRepository.unlockAccount(admin.id);
  });

  describe('Authoritative Role Issuance via Database (No Client Override)', () => {
    it('authenticates Doctor with authoritative database role, portal route, and DoctorProfile', async () => {
      const res = await authService.login({
        email: 'doctor@example.com',
        password: 'Password123!',
      });

      expect(res.user.role).toBe(UserRole.DOCTOR);
      expect(res.user.portalPath).toBe('/portal/doctor');
      expect(res.user.profile).toBeDefined();
      expect(res.user.profile.specialty).toBe('Internal Medicine & Cardiology');
      expect(res.user.profile.npiNumber).toBe('1982736450');

      // Verify JWT token payload
      const claims = verifyAccessToken(res.token);
      expect(claims.role).toBe(UserRole.DOCTOR);
      expect(claims.portalPath).toBe('/portal/doctor');
      expect(claims.email).toBe('doctor@example.com');
    });

    it('authenticates Pharmacist with authoritative database role, portal route, and PharmacistProfile', async () => {
      const res = await authService.login({
        email: 'pharmacist@example.com',
        password: 'Password123!',
      });

      expect(res.user.role).toBe(UserRole.PHARMACIST);
      expect(res.user.portalPath).toBe('/portal/pharmacist');
      expect(res.user.profile).toBeDefined();
      expect(res.user.profile.licenseNumber).toBe('RPH-55419');
      expect(res.user.profile.pharmacyName).toBe('DrugSafe Central Clinical Pharmacy');

      const claims = verifyAccessToken(res.token);
      expect(claims.role).toBe(UserRole.PHARMACIST);
      expect(claims.portalPath).toBe('/portal/pharmacist');
    });

    it('authenticates Admin with authoritative database role, portal route, and AdminProfile', async () => {
      const res = await authService.login({
        email: 'admin@example.com',
        password: 'Password123!',
      });

      expect(res.user.role).toBe(UserRole.ADMIN);
      expect(res.user.portalPath).toBe('/portal/admin');
      expect(res.user.profile).toBeDefined();
      expect(res.user.profile.adminLevel).toBe('SUPER_ADMIN');
      expect(res.user.profile.canAudit).toBe(true);

      const claims = verifyAccessToken(res.token);
      expect(claims.role).toBe(UserRole.ADMIN);
      expect(claims.portalPath).toBe('/portal/admin');
    });

    it('authenticates Patient with authoritative database role, portal route, and Patient record', async () => {
      const res = await authService.login({
        email: 'patient@example.com',
        password: 'Password123!',
      });

      expect(res.user.role).toBe(UserRole.PATIENT);
      expect(res.user.portalPath).toBe('/portal/patient');
      expect(res.user.profile).toBeDefined();
      expect(res.user.profile.mrn).toBe('MRN-84920');

      const claims = verifyAccessToken(res.token);
      expect(claims.role).toBe(UserRole.PATIENT);
      expect(claims.portalPath).toBe('/portal/patient');
    });

    it('strictly ignores client-submitted role payload during login (prevents role injection)', async () => {
      // Attacker attempts to pass role: "ADMIN" while logging in with Patient credentials
      const res = await authService.login({
        email: 'patient@example.com',
        password: 'Password123!',
        role: 'ADMIN', // Rogue client parameter
      });

      // Role MUST remain PATIENT from database record
      expect(res.user.role).toBe(UserRole.PATIENT);
      expect(res.user.portalPath).toBe('/portal/patient');
      expect(res.user.role).not.toBe(UserRole.ADMIN);

      const claims = verifyAccessToken(res.token);
      expect(claims.role).toBe(UserRole.PATIENT);
      expect(claims.role).not.toBe(UserRole.ADMIN);
    });
  });

  describe('Registration Role Controls & Escalation Prevention', () => {
    it('strictly forbids self-registration as ADMIN', async () => {
      await expect(
        authService.register({
          fullName: 'Malicious Admin Wannabe',
          email: 'wannabe.admin@example.com',
          password: 'Password123!',
          role: UserRole.ADMIN,
        })
      ).rejects.toThrow(/Administrator accounts cannot be registered publicly/);
    });

    it('strictly forbids self-registration with invalid or unapproved roles', async () => {
      await expect(
        authService.register({
          fullName: 'Arbitrary Role User',
          email: 'arbitrary.role@example.com',
          password: 'Password123!',
          role: 'SUPERUSER',
        })
      ).rejects.toThrow(/Invalid role specified for account registration/);
    });

    it('successfully registers patient and attaches authoritative Patient profile and portal route', async () => {
      const uniqueEmail = `new.patient.${Date.now()}@example.com`;
      const res = await authService.register({
        fullName: 'New Valid Patient',
        email: uniqueEmail,
        password: 'Password123!',
        role: UserRole.PATIENT,
      });

      expect(res.user.role).toBe(UserRole.PATIENT);
      expect(res.user.portalPath).toBe('/portal/patient');
      expect(res.user.profile).toBeDefined();
      expect(res.user.profile.mrn).toBeDefined();
      expect(res.token).toBeDefined();

      const claims = verifyAccessToken(res.token);
      expect(claims.role).toBe(UserRole.PATIENT);
      expect(claims.portalPath).toBe('/portal/patient');
    });
  });

  describe('Token Security & Middleware Role Claim Verification', () => {
    it('passes authenticate middleware when token contains valid authoritative role claim', () => {
      const token = signAccessToken({
        id: 'usr-doctor-1',
        email: 'doctor@example.com',
        role: UserRole.DOCTOR,
        portalPath: '/portal/doctor',
      });

      let nextCalled = false;
      let nextError = null;
      const req = { headers: { authorization: `Bearer ${token}` } };
      const res = {};
      const next = (err) => {
        nextCalled = true;
        nextError = err;
      };

      authenticate(req, res, next);
      expect(nextCalled).toBe(true);
      expect(nextError).toBeFalsy();
      expect(req.user.role).toBe(UserRole.DOCTOR);
    });

    it('rejects authenticate middleware when token contains forged or invalid role claim', () => {
      // Craft a token with an unauthorized role
      const forgedToken = signAccessToken({
        id: 'usr-rogue-1',
        email: 'rogue@example.com',
        role: 'SUPER_HACKER',
      });

      let nextError = null;
      const req = { headers: { authorization: `Bearer ${forgedToken}` } };
      const res = {};
      const next = (err) => {
        nextError = err;
      };

      authenticate(req, res, next);
      expect(nextError).toBeDefined();
      expect(nextError.statusCode).toBe(401);
      expect(nextError.message).toContain('Missing or unauthorized clinical role claim');
    });

    it('returns authoritative role and profile from getCurrentUser (/api/auth/me)', async () => {
      const me = await authService.getCurrentUser('usr-pharmacist-1');
      expect(me.role).toBe(UserRole.PHARMACIST);
      expect(me.portalPath).toBe('/portal/pharmacist');
      expect(me.profile).toBeDefined();
      expect(me.profile.licenseNumber).toBe('RPH-55419');
    });

    it('preserves authoritative role during session token rotation', async () => {
      const loginRes = await authService.login({
        email: 'doctor@example.com',
        password: 'Password123!',
      });

      const refreshRes = await authService.refreshSession(loginRes.refreshToken);
      expect(refreshRes.token).toBeDefined();

      const newClaims = verifyAccessToken(refreshRes.token);
      expect(newClaims.role).toBe(UserRole.DOCTOR);
      expect(newClaims.portalPath).toBe('/portal/doctor');
    });
  });
});
