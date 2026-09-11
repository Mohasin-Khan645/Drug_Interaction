import { prisma, isDatabaseAvailable } from '../config/database.js';
import { userRepository } from './user.repository.js';

const IN_MEMORY_REFRESH_TOKENS = [];

export const refreshTokenRepository = {
  async create(userId, tokenHash, expiresAt) {
    try {
      if (prisma && (await isDatabaseAvailable())) {
        return await prisma.refreshToken.create({
          data: { userId, tokenHash, expiresAt },
        });
      }
    } catch {
      // Fallback
    }

    const tokenRecord = {
      id: `tok-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      userId,
      tokenHash,
      expiresAt,
      revokedAt: null,
      createdAt: new Date(),
    };
    IN_MEMORY_REFRESH_TOKENS.push(tokenRecord);
    return tokenRecord;
  },

  async findByTokenHash(tokenHash) {
    try {
      if (prisma && (await isDatabaseAvailable())) {
        const found = await prisma.refreshToken.findUnique({
          where: { tokenHash },
          include: { user: true },
        });
        if (found) return found;
      }
    } catch {
      // Fallback
    }

    const token = IN_MEMORY_REFRESH_TOKENS.find((t) => t.tokenHash === tokenHash);
    if (token && !token.user) {
      token.user = await userRepository.findById(token.userId);
    }
    return token || null;
  },

  async revoke(id) {
    try {
      if (prisma && (await isDatabaseAvailable())) {
        return await prisma.refreshToken.update({
          where: { id },
          data: { revokedAt: new Date() },
        });
      }
    } catch {
      // Fallback
    }

    const rec = IN_MEMORY_REFRESH_TOKENS.find((t) => t.id === id);
    if (rec) rec.revokedAt = new Date();
    return rec;
  },

  async revokeAllForUser(userId) {
    try {
      if (prisma && (await isDatabaseAvailable())) {
        return await prisma.refreshToken.updateMany({
          where: { userId, revokedAt: null },
          data: { revokedAt: new Date() },
        });
      }
    } catch {
      // Fallback
    }

    IN_MEMORY_REFRESH_TOKENS.forEach((t) => {
      if (t.userId === userId && !t.revokedAt) {
        t.revokedAt = new Date();
      }
    });
  },

  async deleteExpired() {
    try {
      if (prisma) {
        return await prisma.refreshToken.deleteMany({
          where: { expiresAt: { lt: new Date() } },
        });
      }
    } catch {
      // Fallback
    }
  },
};

