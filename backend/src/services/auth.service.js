import { userRepository } from '../repositories/user.repository.js';
import { refreshTokenRepository } from '../repositories/refreshToken.repository.js';
import { hashPassword, comparePassword, hashToken } from '../utils/hash.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken, signMfaTicket, verifyMfaTicket } from '../utils/jwt.js';
import {
  UnauthorizedError,
  ConflictError,
  NotFoundError,
  ForbiddenError,
} from '../utils/errors.js';
import { ErrorCodes } from '../constants/errorCodes.js';
import { UserRole, ROLE_PORTALS, isValidRole } from '../constants/roles.js';
import { getPermissionsForRole } from '../constants/permissions.js';

export const authService = {
  async register({ fullName, email, password, role = UserRole.PATIENT, department, licenseNumber }) {
    if (role === UserRole.ADMIN) {
      throw new ForbiddenError('Administrator accounts cannot be registered publicly.');
    }

    if (!isValidRole(role)) {
      throw new ForbiddenError('Invalid role specified for account registration.');
    }

    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictError('An account with this email address already exists.');
    }

    const passwordHash = await hashPassword(password);
    const user = await userRepository.create({
      name: fullName,
      email,
      passwordHash,
      role,
      department,
      licenseNumber,
      status: 'ACTIVE',
    });

    // Automatically attach authoritative clinical profile
    if (user.role === UserRole.DOCTOR) {
      await userRepository.assignRoleProfile(user.id, UserRole.DOCTOR, {
        specialty: department || 'General Medicine',
        licenseNumber: licenseNumber || 'PENDING_VERIFICATION',
      });
    } else if (user.role === UserRole.PHARMACIST) {
      await userRepository.assignRoleProfile(user.id, UserRole.PHARMACIST, {
        licenseNumber: licenseNumber || 'PENDING_VERIFICATION',
      });
    } else if (user.role === UserRole.PATIENT) {
      await userRepository.assignRoleProfile(user.id, UserRole.PATIENT, {
        mrn: `MRN-${Date.now().toString().slice(-5)}`,
      });
    }

    const permissions = getPermissionsForRole(user.role);
    const portalPath = ROLE_PORTALS[user.role] || '/portal/patient';
    const profile = await userRepository.getRoleProfile(user.id);

    const accessToken = signAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      patientId: user.patient?.id || profile?.id || null,
      portalPath,
      permissions,
    });
    const rawRefreshToken = signRefreshToken({ id: user.id });
    const tokenHash = hashToken(rawRefreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await refreshTokenRepository.create(user.id, tokenHash, expiresAt);

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      portalPath,
      profile,
      status: user.status,
      permissions,
      patientId: user.patient?.id || profile?.id || null,
      department: user.department,
      licenseNumber: user.licenseNumber,
      createdAt: user.createdAt,
    };

    return { user: safeUser, token: accessToken, refreshToken: rawRefreshToken };
  },

  async login({ email, password, clientInfo = {}, bypassMfa = false }) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password.', ErrorCodes.INVALID_CREDENTIALS);
    }

    // 1. Account Status & Lockout Checks
    if (user.status === 'SUSPENDED') {
      throw new ForbiddenError('This clinical account has been suspended. Please contact hospital administration.');
    }

    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      const remainingMinutes = Math.ceil((new Date(user.lockedUntil) - new Date()) / 60000);
      throw new ForbiddenError(
        `Account temporarily locked due to multiple failed login attempts. Try again in ${remainingMinutes} minute(s).`
      );
    }

    // 2. Password Verification
    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      await userRepository.recordLoginAttempt(user.id, false);
      const updatedUser = await userRepository.findById(user.id);
      if (updatedUser?.lockedUntil) {
        throw new ForbiddenError('Account locked for 15 minutes due to 5 consecutive failed attempts.');
      }
      throw new UnauthorizedError('Invalid email or password.', ErrorCodes.INVALID_CREDENTIALS);
    }

    // Reset failed login attempts on valid password
    await userRepository.recordLoginAttempt(user.id, true);

    // 3. Multi-Factor Authentication Challenge
    if (user.mfaEnabled && !bypassMfa) {
      const mfaTicket = signMfaTicket({
        id: user.id,
        email: user.email,
        role: user.role,
        action: 'MFA_CHALLENGE',
      });

      return {
        mfaRequired: true,
        mfaTicket,
        mfaMethod: user.mfaMethod || 'APP',
        deliveryHint: user.role === UserRole.DOCTOR ? '+1 (***) ***-8921' : 'Authenticator App (TOTP)',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      };
    }

    // 4. Session & Permission Issuance
    const permissions = getPermissionsForRole(user.role);
    const session = await userRepository.createSession(user.id, clientInfo);
    const portalPath = ROLE_PORTALS[user.role] || '/portal/patient';
    const profile = await userRepository.getRoleProfile(user.id);

    const accessToken = signAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      patientId: user.patient?.id || (user.role === 'PATIENT' ? profile?.id : null),
      portalPath,
      permissions,
      sessionId: session?.id || null,
    });

    const rawRefreshToken = signRefreshToken({ id: user.id });
    const tokenHash = hashToken(rawRefreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await refreshTokenRepository.create(user.id, tokenHash, expiresAt);

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      portalPath,
      profile,
      status: user.status,
      permissions,
      patientId: user.patient?.id || (user.role === 'PATIENT' ? profile?.id : null),
      department: user.department,
      licenseNumber: user.licenseNumber,
      mfaEnabled: Boolean(user.mfaEnabled),
      createdAt: user.createdAt,
    };

    return { user: safeUser, token: accessToken, refreshToken: rawRefreshToken, session };
  },

  /**
   * Verify Multi-Factor Authentication (MFA / 2FA) 6-digit challenge code
   */
  async verifyMfa({ mfaTicket, code, clientInfo = {} }) {
    if (!mfaTicket || !code) {
      throw new UnauthorizedError('MFA ticket and 6-digit verification code are required.');
    }

    let decoded;
    try {
      decoded = verifyMfaTicket(mfaTicket);
    } catch {
      throw new UnauthorizedError('MFA session expired or invalid. Please log in again.', ErrorCodes.TOKEN_EXPIRED);
    }

    if (decoded.action !== 'MFA_CHALLENGE') {
      throw new UnauthorizedError('Invalid verification challenge.');
    }

    const user = await userRepository.findById(decoded.id);
    if (!user) {
      throw new NotFoundError('User account not found.');
    }

    // Universal demo codes '123456' or '000000'
    const cleanCode = String(code).trim();
    const isValidCode = cleanCode === '123456' || cleanCode === '000000';

    if (!isValidCode) {
      throw new UnauthorizedError('Invalid 6-digit authentication code. (Tip: Use 123456 for demo review)');
    }

    const permissions = getPermissionsForRole(user.role);
    const session = await userRepository.createSession(user.id, clientInfo);
    const portalPath = ROLE_PORTALS[user.role] || '/portal/patient';
    const profile = await userRepository.getRoleProfile(user.id);

    const accessToken = signAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      patientId: user.patient?.id || (user.role === 'PATIENT' ? profile?.id : null),
      portalPath,
      permissions,
      sessionId: session?.id || null,
    });

    const rawRefreshToken = signRefreshToken({ id: user.id });
    const tokenHash = hashToken(rawRefreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await refreshTokenRepository.create(user.id, tokenHash, expiresAt);

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      portalPath,
      profile,
      status: user.status,
      permissions,
      patientId: user.patient?.id || (user.role === 'PATIENT' ? profile?.id : null),
      department: user.department,
      licenseNumber: user.licenseNumber,
      mfaEnabled: true,
      createdAt: user.createdAt,
    };

    return { user: safeUser, token: accessToken, refreshToken: rawRefreshToken, session };
  },

  async toggleMfa(userId, { enabled }) {
    const user = await userRepository.updateMfa(userId, { mfaEnabled: Boolean(enabled) });
    return { mfaEnabled: Boolean(user?.mfaEnabled) };
  },

  async getSessions(userId) {
    return userRepository.listSessions(userId);
  },

  async revokeSession(userId, sessionId) {
    return userRepository.revokeSession(userId, sessionId);
  },

  async revokeAllSessions(userId) {
    await refreshTokenRepository.revokeAllForUser(userId);
    return userRepository.revokeAllSessions(userId);
  },

  /**
   * Refresh token rotation with reuse detection
   */
  async refreshSession(rawRefreshToken) {
    if (!rawRefreshToken) {
      throw new UnauthorizedError('Refresh token required.');
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(rawRefreshToken);
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token.', ErrorCodes.TOKEN_EXPIRED);
    }

    const tokenHash = hashToken(rawRefreshToken);
    const storedToken = await refreshTokenRepository.findByTokenHash(tokenHash);

    // If token was not found in DB, it may be invalid or forged
    if (!storedToken) {
      throw new UnauthorizedError('Session token not found.');
    }

    // Reuse detection: If token was already revoked, someone is replaying a stolen token!
    if (storedToken.revokedAt) {
      // Invalidate all tokens for this user immediately for security
      await refreshTokenRepository.revokeAllForUser(storedToken.userId);
      throw new ForbiddenError('Security alert: Revoked token reuse detected. All active sessions invalidated.', ErrorCodes.TOKEN_REUSED);
    }

    if (new Date() > storedToken.expiresAt) {
      throw new UnauthorizedError('Refresh token expired.', ErrorCodes.TOKEN_EXPIRED);
    }

    // Rotate: Revoke the current token
    await refreshTokenRepository.revoke(storedToken.id);

    // Issue new access token and new refresh token
    const user = storedToken.user || (await userRepository.findById(storedToken.userId));
    if (!user) {
      throw new UnauthorizedError('User account associated with this session no longer exists.');
    }
    const permissions = getPermissionsForRole(user.role);
    const portalPath = ROLE_PORTALS[user.role] || '/portal/patient';
    const newAccessToken = signAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      patientId: user.patient?.id || null,
      portalPath,
      permissions,
    });

    const newRawRefreshToken = signRefreshToken({ id: user.id });
    const newTokenHash = hashToken(newRawRefreshToken);
    const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await refreshTokenRepository.create(user.id, newTokenHash, newExpiresAt);

    return { token: newAccessToken, refreshToken: newRawRefreshToken };
  },

  async logout(rawRefreshToken) {
    if (rawRefreshToken) {
      const tokenHash = hashToken(rawRefreshToken);
      const storedToken = await refreshTokenRepository.findByTokenHash(tokenHash);
      if (storedToken) {
        await refreshTokenRepository.revoke(storedToken.id);
      }
    }
    return { success: true };
  },

  async getCurrentUser(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found.');
    }

    const permissions = getPermissionsForRole(user.role);
    const portalPath = ROLE_PORTALS[user.role] || '/portal/patient';
    const profile = await userRepository.getRoleProfile(user.id);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      portalPath,
      profile,
      status: user.status,
      permissions,
      mfaEnabled: Boolean(user.mfaEnabled),
      patientId: user.patient?.id || (user.role === 'PATIENT' ? profile?.id : null),
      department: user.department,
      licenseNumber: user.licenseNumber,
      createdAt: user.createdAt,
    };
  },
};

