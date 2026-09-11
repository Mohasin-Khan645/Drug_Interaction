import { describe, it, expect, beforeEach } from 'vitest';
import { Permissions, ROLE_PERMISSIONS, getPermissionsForRole, hasPermission } from '../../src/constants/permissions.js';
import { UserRole } from '../../src/constants/roles.js';
import { authService } from '../../src/services/auth.service.js';
import { userRepository } from '../../src/repositories/user.repository.js';
import { requirePermission, requireActiveClinician } from '../../src/middleware/rbac.js';

describe('Advanced RBAC & Granular Permission System', () => {
  it('assigns appropriate clinical permissions to each healthcare role', () => {
    const patientPerms = getPermissionsForRole(UserRole.PATIENT);
    const doctorPerms = getPermissionsForRole(UserRole.DOCTOR);
    const pharmacistPerms = getPermissionsForRole(UserRole.PHARMACIST);
    const adminPerms = getPermissionsForRole(UserRole.ADMIN);

    // Patient permissions
    expect(patientPerms).toContain(Permissions.PATIENTS_READ_OWN);
    expect(patientPerms).not.toContain(Permissions.PATIENTS_READ_ALL);
    expect(patientPerms).not.toContain(Permissions.CLINICAL_REVIEW_OVERRIDE);

    // Physician permissions
    expect(doctorPerms).toContain(Permissions.PATIENTS_READ_ALL);
    expect(doctorPerms).toContain(Permissions.CLINICAL_REVIEW_OVERRIDE);
    expect(doctorPerms).toContain(Permissions.CLINICAL_REVIEW_SIGNOFF);
    expect(doctorPerms).toContain(Permissions.SAFETY_EMERGENCY_OVERRIDE);

    // Pharmacist permissions
    expect(pharmacistPerms).toContain(Permissions.CLINICAL_REVIEW_OVERRIDE);
    expect(pharmacistPerms).toContain(Permissions.RECONCILIATION_RUN);

    // Admin has wildcard access
    expect(adminPerms).toContain('*');
  });

  it('correctly evaluates hasPermission with wildcards and specific scopes', () => {
    const adminUser = { role: UserRole.ADMIN, permissions: ['*'] };
    const doctorUser = {
      role: UserRole.DOCTOR,
      permissions: getPermissionsForRole(UserRole.DOCTOR),
    };
    const patientUser = {
      role: UserRole.PATIENT,
      permissions: getPermissionsForRole(UserRole.PATIENT),
    };

    expect(hasPermission(adminUser, Permissions.EVIDENCE_SYNC)).toBe(true);
    expect(hasPermission(adminUser, 'non_existent_scope')).toBe(true);

    expect(hasPermission(doctorUser, Permissions.CLINICAL_REVIEW_OVERRIDE)).toBe(true);
    expect(hasPermission(doctorUser, Permissions.ADMIN_SETTINGS_MANAGE)).toBe(false);

    expect(hasPermission(patientUser, Permissions.SAFETY_RUN_CHECK)).toBe(true);
    expect(hasPermission(patientUser, Permissions.CLINICAL_REVIEW_OVERRIDE)).toBe(false);
  });

  it('requirePermission middleware enforces permissions and passes authorized users', () => {
    const middleware = requirePermission(Permissions.CLINICAL_REVIEW_OVERRIDE);

    let nextCalled = false;
    let nextError = null;
    const next = (err) => {
      nextCalled = true;
      nextError = err;
    };

    // Unauthorized patient
    middleware({ user: { role: UserRole.PATIENT, permissions: getPermissionsForRole(UserRole.PATIENT) } }, {}, next);
    expect(nextError).toBeDefined();
    expect(nextError.statusCode).toBe(403);

    // Authorized physician
    nextError = null;
    middleware({ user: { role: UserRole.DOCTOR, permissions: getPermissionsForRole(UserRole.DOCTOR) } }, {}, next);
    expect(nextError).toBeFalsy();
  });

  it('requireActiveClinician ABAC middleware permits doctors/pharmacists and denies patients', () => {
    const middleware = requireActiveClinician();
    let nextError = null;
    const next = (err) => { nextError = err; };

    middleware({ user: { role: UserRole.PATIENT } }, {}, next);
    expect(nextError).toBeDefined();
    expect(nextError.statusCode).toBe(403);

    nextError = null;
    middleware({ user: { role: UserRole.DOCTOR, licenseNumber: 'CA-MD-89210' } }, {}, next);
    expect(nextError).toBeFalsy();
  });
});

describe('Advanced Enterprise Authentication & Session Management', () => {
  beforeEach(async () => {
    const user = await userRepository.findByEmail('doctor@example.com');
    if (user) {
      await userRepository.unlockAccount(user.id);
      await userRepository.updateMfa(user.id, { mfaEnabled: false });
    }
  });

  it('successful login returns user profile, permissions, tokens, and active session', async () => {
    const res = await authService.login({
      email: 'doctor@example.com',
      password: 'Password123!',
      clientInfo: { device: 'Hospital Workstation', ip: '10.0.1.45', os: 'Windows 11' },
    });

    expect(res.user).toBeDefined();
    expect(res.user.email).toBe('doctor@example.com');
    expect(res.user.permissions).toContain(Permissions.CLINICAL_REVIEW_OVERRIDE);
    expect(res.token).toBeDefined();
    expect(res.refreshToken).toBeDefined();
    expect(res.session).toBeDefined();
    expect(res.session.device).toBe('Hospital Workstation');
  });

  it('locks account after 5 consecutive failed login attempts', async () => {
    const targetEmail = 'patient@example.com';
    const user = await userRepository.findByEmail(targetEmail);
    await userRepository.unlockAccount(user.id);

    // Attempt 1 to 4: Failures
    for (let i = 0; i < 4; i++) {
      await expect(
        authService.login({ email: targetEmail, password: 'WrongPassword!' })
      ).rejects.toThrow('Invalid email or password');
    }

    // Attempt 5: Triggers 15-minute lockout
    await expect(
      authService.login({ email: targetEmail, password: 'WrongPassword!' })
    ).rejects.toThrow(/Account locked for 15 minutes/);

    // Subsequent attempt is blocked by lockout guard
    await expect(
      authService.login({ email: targetEmail, password: 'Password123!' })
    ).rejects.toThrow(/Account temporarily locked/);

    // Unlock and verify recovery
    await userRepository.unlockAccount(user.id);
    const successRes = await authService.login({ email: targetEmail, password: 'Password123!' });
    expect(successRes.user.email).toBe(targetEmail);
  });

  it('triggers MFA challenge and verifies with universal evaluation code 123456', async () => {
    const doctor = await userRepository.findByEmail('doctor@example.com');
    await userRepository.updateMfa(doctor.id, { mfaEnabled: true, mfaMethod: 'APP' });

    // Step 1: Login triggers MFA challenge
    const loginRes = await authService.login({
      email: 'doctor@example.com',
      password: 'Password123!',
    });

    expect(loginRes.mfaRequired).toBe(true);
    expect(loginRes.mfaTicket).toBeDefined();
    expect(loginRes.deliveryHint).toBeDefined();

    // Step 2a: Invalid code rejected
    await expect(
      authService.verifyMfa({ mfaTicket: loginRes.mfaTicket, code: '999999' })
    ).rejects.toThrow(/Invalid 6-digit authentication code/);

    // Step 2b: Valid demo code 123456 accepted and completes session
    const mfaRes = await authService.verifyMfa({
      mfaTicket: loginRes.mfaTicket,
      code: '123456',
      clientInfo: { device: 'Mobile iPad', ip: '10.0.2.12' },
    });

    expect(mfaRes.user).toBeDefined();
    expect(mfaRes.user.mfaEnabled).toBe(true);
    expect(mfaRes.token).toBeDefined();
    expect(mfaRes.session.device).toBe('Mobile iPad');
  });

  it('lists and revokes active device sessions', async () => {
    const user = await userRepository.findByEmail('doctor@example.com');
    await userRepository.createSession(user.id, { device: 'Clinic Desktop' });
    await userRepository.createSession(user.id, { device: 'Personal Phone' });

    const sessions = await authService.getSessions(user.id);
    expect(sessions.length).toBeGreaterThanOrEqual(2);

    const targetSessionId = sessions[0].id;
    const revoked = await authService.revokeSession(user.id, targetSessionId);
    expect(revoked).toBe(true);

    const updatedSessions = await authService.getSessions(user.id);
    expect(updatedSessions.some((s) => s.id === targetSessionId)).toBe(false);
  });
});
