'use strict';

const config = require('../config');
const prisma = require('../config/prisma');
const userRepository = require('../repositories/userRepository');
const tokenRepository = require('../repositories/tokenRepository');
const patientRepository = require('../repositories/patientRepository');
const ApiError = require('../utils/apiError');
const { hashPassword, verifyPassword, randomToken, sha256 } = require('../utils/crypto');
const { signAccessToken } = require('../utils/jwt');
const { ROLES, AUDIT_ACTIONS } = require('../constants');
const auditService = require('./auditService');
const { getEmailProvider } = require('../integrations/email');

const REFRESH_TTL_MS = () => config.jwt.refreshExpiresInDays * 24 * 60 * 60 * 1000;
const VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;
const RESET_TTL_MS = 60 * 60 * 1000;

const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  status: user.status,
  emailVerified: user.emailVerified,
});

const issueRefreshToken = async (userId, client = prisma) => {
  const token = randomToken();
  await tokenRepository.createRefreshToken(
    {
      userId,
      tokenHash: sha256(token),
      expiresAt: new Date(Date.now() + REFRESH_TTL_MS()),
    },
    client
  );
  return token;
};

const createVerificationToken = async (userId, type, ttlMs) => {
  const token = randomToken(32);
  await tokenRepository.createVerificationToken({
    userId,
    type,
    tokenHash: sha256(token),
    expiresAt: new Date(Date.now() + ttlMs),
  });
  return token;
};

const register = async ({ name, email, password }, req) => {
  const existing = await userRepository.findByEmail(email);
  if (existing) throw ApiError.conflict('An account with this email already exists');

  const passwordHash = await hashPassword(password);

  // Self-service registration can only ever create a PATIENT; clinical roles are
  // provisioned by an administrator.
  const user = await prisma.$transaction(async (tx) => {
    const created = await userRepository.create(
      { name, email, passwordHash, role: ROLES.PATIENT },
      tx
    );
    await patientRepository.create({ userId: created.id }, tx);
    return created;
  });

  const verificationToken = await createVerificationToken(
    user.id,
    'EMAIL_VERIFICATION',
    VERIFICATION_TTL_MS
  );
  await getEmailProvider().send({
    to: user.email,
    subject: 'Verify your DrugSafe account',
    text: `Verify your account: ${config.clientUrl}/verify-email?token=${verificationToken}`,
  });

  await auditService.record({
    req,
    userId: user.id,
    action: AUDIT_ACTIONS.REGISTER,
    resourceType: 'User',
    resourceId: user.id,
  });

  return { user: publicUser(user), verificationToken: config.env === 'production' ? undefined : verificationToken };
};

const login = async ({ email, password }, req) => {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    await auditService.record({ req, action: AUDIT_ACTIONS.LOGIN_FAILED, metadata: { email } });
    throw ApiError.invalidCredentials();
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    await auditService.record({
      req,
      userId: user.id,
      action: AUDIT_ACTIONS.LOGIN_FAILED,
      resourceType: 'User',
      resourceId: user.id,
    });
    throw ApiError.invalidCredentials();
  }
  if (user.status !== 'ACTIVE') throw ApiError.forbidden('Account is not active');

  const refreshToken = await issueRefreshToken(user.id);
  await auditService.record({
    req,
    userId: user.id,
    action: AUDIT_ACTIONS.LOGIN,
    resourceType: 'User',
    resourceId: user.id,
  });

  return { user: publicUser(user), accessToken: signAccessToken(user), refreshToken };
};

/**
 * Rotates the refresh token. Presenting an already-revoked token is treated as
 * replay: every session for that user is revoked.
 */
const refresh = async (presentedToken, req) => {
  if (!presentedToken) throw ApiError.unauthenticated('Refresh token missing');
  const record = await tokenRepository.findRefreshByHash(sha256(presentedToken));
  if (!record) throw ApiError.unauthenticated('Invalid refresh token');

  if (record.revokedAt) {
    await tokenRepository.revokeAllForUser(record.userId);
    await auditService.record({
      req,
      userId: record.userId,
      action: AUDIT_ACTIONS.TOKEN_REUSE_DETECTED,
      resourceType: 'RefreshToken',
      resourceId: record.id,
    });
    throw ApiError.unauthenticated('Refresh token has been revoked');
  }
  if (record.expiresAt.getTime() < Date.now()) {
    throw ApiError.unauthenticated('Refresh token expired');
  }
  if (!record.user || record.user.status !== 'ACTIVE' || record.user.deletedAt) {
    throw ApiError.forbidden('Account is not active');
  }

  const rotated = await prisma.$transaction(async (tx) => {
    await tokenRepository.revokeRefreshToken(record.id, tx);
    return issueRefreshToken(record.userId, tx);
  });

  await auditService.record({
    req,
    userId: record.userId,
    action: AUDIT_ACTIONS.TOKEN_REFRESH,
    resourceType: 'RefreshToken',
    resourceId: record.id,
  });

  return {
    user: publicUser(record.user),
    accessToken: signAccessToken(record.user),
    refreshToken: rotated,
  };
};

const logout = async (presentedToken, req) => {
  if (presentedToken) {
    const record = await tokenRepository.findRefreshByHash(sha256(presentedToken));
    if (record && !record.revokedAt) await tokenRepository.revokeRefreshToken(record.id);
  }
  await auditService.record({ req, action: AUDIT_ACTIONS.LOGOUT });
  return { loggedOut: true };
};

const currentUser = async (userId) => {
  const user = await userRepository.findPublicById(userId);
  if (!user) throw ApiError.notFound('User not found');
  const patient = await patientRepository.findByUserId(userId);
  return { ...user, patientId: patient ? patient.id : null };
};

const verifyEmail = async (token, req) => {
  const record = await tokenRepository.findVerificationByHash(sha256(token || ''));
  if (!record || record.type !== 'EMAIL_VERIFICATION' || record.usedAt) {
    throw ApiError.badRequest('Invalid or already used verification token');
  }
  if (record.expiresAt.getTime() < Date.now()) throw ApiError.badRequest('Verification token expired');

  await prisma.$transaction(async (tx) => {
    await tokenRepository.consumeVerificationToken(record.id, tx);
    await tx.user.update({ where: { id: record.userId }, data: { emailVerified: true } });
  });

  await auditService.record({
    req,
    userId: record.userId,
    action: AUDIT_ACTIONS.EMAIL_VERIFIED,
    resourceType: 'User',
    resourceId: record.userId,
  });
  return { emailVerified: true };
};

const forgotPassword = async (email, req) => {
  const user = await userRepository.findByEmail(email);
  // The same response is returned whether or not the account exists.
  if (user) {
    const token = await createVerificationToken(user.id, 'PASSWORD_RESET', RESET_TTL_MS);
    await getEmailProvider().send({
      to: user.email,
      subject: 'Reset your DrugSafe password',
      text: `Reset your password: ${config.clientUrl}/reset-password?token=${token}`,
    });
    await auditService.record({
      req,
      userId: user.id,
      action: AUDIT_ACTIONS.PASSWORD_RESET_REQUESTED,
      resourceType: 'User',
      resourceId: user.id,
    });
    if (config.env !== 'production') return { requested: true, resetToken: token };
  }
  return { requested: true };
};

const resetPassword = async ({ token, password }, req) => {
  const record = await tokenRepository.findVerificationByHash(sha256(token || ''));
  if (!record || record.type !== 'PASSWORD_RESET' || record.usedAt) {
    throw ApiError.badRequest('Invalid or already used reset token');
  }
  if (record.expiresAt.getTime() < Date.now()) throw ApiError.badRequest('Reset token expired');

  const passwordHash = await hashPassword(password);
  await prisma.$transaction(async (tx) => {
    await tokenRepository.consumeVerificationToken(record.id, tx);
    await tx.user.update({ where: { id: record.userId }, data: { passwordHash } });
    await tokenRepository.revokeAllForUser(record.userId, tx);
  });

  await auditService.record({
    req,
    userId: record.userId,
    action: AUDIT_ACTIONS.PASSWORD_RESET,
    resourceType: 'User',
    resourceId: record.userId,
  });
  return { passwordReset: true };
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  currentUser,
  verifyEmail,
  forgotPassword,
  resetPassword,
  publicUser,
};
