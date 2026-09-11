import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env.js';

export function signAccessToken(payload) {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET);
}

export function signRefreshToken(payload) {
  // Generate random bytes string for cryptographically strong refresh token value
  const randomEntropy = crypto.randomBytes(40).toString('hex');
  return jwt.sign({ ...payload, entropy: randomEntropy }, env.REFRESH_TOKEN_SECRET, {
    expiresIn: env.REFRESH_TOKEN_EXPIRES_IN,
  });
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, env.REFRESH_TOKEN_SECRET);
}

export function signMfaTicket(payload) {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: '5m',
  });
}

export function verifyMfaTicket(token) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET);
}

