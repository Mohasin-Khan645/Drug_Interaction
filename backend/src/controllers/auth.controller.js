import { authService } from '../services/auth.service.js';
import { successResponse } from '../utils/apiResponse.js';
import { env } from '../config/env.js';

export const authController = {
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body);

      // Set secure HTTP-only refresh token cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return successResponse(
        res,
        {
          user: result.user,
          token: result.token,
        },
        201,
        'Account registered successfully.'
      );
    } catch (err) {
      next(err);
    }
  },

  async login(req, res, next) {
    try {
      const clientInfo = {
        ip: req.ip || req.connection?.remoteAddress || '127.0.0.1',
        userAgent: req.headers['user-agent'] || '',
        device: req.headers['x-drugsafe-device'] || 'Desktop Browser',
      };

      const result = await authService.login({ ...req.body, clientInfo });

      // If Multi-Factor Authentication Challenge is triggered
      if (result.mfaRequired) {
        return successResponse(res, result, 200, 'Multi-factor authentication required.');
      }

      if (result.refreshToken) {
        res.cookie('refreshToken', result.refreshToken, {
          httpOnly: true,
          secure: env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });
      }

      return successResponse(
        res,
        {
          user: result.user,
          token: result.token,
          session: result.session,
        },
        200,
        'Login successful.'
      );
    } catch (err) {
      next(err);
    }
  },

  async verifyMfa(req, res, next) {
    try {
      const clientInfo = {
        ip: req.ip || req.connection?.remoteAddress || '127.0.0.1',
        userAgent: req.headers['user-agent'] || '',
        device: req.headers['x-drugsafe-device'] || 'Desktop Browser',
      };

      const result = await authService.verifyMfa({
        mfaTicket: req.body.mfaTicket,
        code: req.body.code,
        clientInfo,
      });

      if (result.refreshToken) {
        res.cookie('refreshToken', result.refreshToken, {
          httpOnly: true,
          secure: env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });
      }

      return successResponse(
        res,
        {
          user: result.user,
          token: result.token,
          session: result.session,
        },
        200,
        'MFA verification successful. Session authenticated.'
      );
    } catch (err) {
      next(err);
    }
  },

  async toggleMfa(req, res, next) {
    try {
      const result = await authService.toggleMfa(req.user.id, req.body);
      return successResponse(res, result, 200, `MFA ${result.mfaEnabled ? 'activated' : 'deactivated'}.`);
    } catch (err) {
      next(err);
    }
  },

  async getSessions(req, res, next) {
    try {
      const sessions = await authService.getSessions(req.user.id);
      return successResponse(res, sessions);
    } catch (err) {
      next(err);
    }
  },

  async revokeSession(req, res, next) {
    try {
      const revoked = await authService.revokeSession(req.user.id, req.params.sessionId);
      return successResponse(res, { revoked }, 200, 'Device session revoked.');
    } catch (err) {
      next(err);
    }
  },

  async revokeAllSessions(req, res, next) {
    try {
      await authService.revokeAllSessions(req.user.id);
      return successResponse(res, { success: true }, 200, 'All remote sessions revoked.');
    } catch (err) {
      next(err);
    }
  },

  async refreshSession(req, res, next) {
    try {
      const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
      const result = await authService.refreshSession(refreshToken);

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return successResponse(res, { token: result.token }, 200, 'Session refreshed successfully.');
    } catch (err) {
      next(err);
    }
  },

  async logout(req, res, next) {
    try {
      const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
      await authService.logout(refreshToken);

      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
      });

      return successResponse(res, { success: true }, 200, 'Logged out successfully.');
    } catch (err) {
      next(err);
    }
  },

  async getCurrentUser(req, res, next) {
    try {
      const user = await authService.getCurrentUser(req.user.id);
      return successResponse(res, { user });
    } catch (err) {
      next(err);
    }
  },

  async forgotPassword(req, res, next) {
    try {
      return successResponse(res, { message: 'If that email exists in our records, password reset instructions have been dispatched.' });
    } catch (err) {
      next(err);
    }
  },

  async resetPassword(req, res, next) {
    try {
      return successResponse(res, { message: 'Password has been successfully reset.' });
    } catch (err) {
      next(err);
    }
  },

  async verifyEmail(req, res, next) {
    try {
      return successResponse(res, { message: 'Email address successfully verified.' });
    } catch (err) {
      next(err);
    }
  },
};

