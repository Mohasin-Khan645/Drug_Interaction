import { logger } from '../../config/logger.js';
import { env } from '../../config/env.js';

export class EmailProvider {
  async sendSafetyAlertEmail({ to, subject, bodyHtml }) {
    logger.info({ to, subject }, 'Simulating secure clinical alert email transmission');
    // In production, integrate with nodemailer or SES
    return { success: true, messageId: `msg-${Date.now()}` };
  }

  async sendVerificationEmail({ to, code }) {
    logger.info({ to }, 'Sending verification email with code');
    return { success: true, messageId: `msg-${Date.now()}` };
  }

  async sendPasswordResetEmail({ to, resetToken }) {
    logger.info({ to }, 'Sending password reset email');
    return { success: true, messageId: `msg-${Date.now()}` };
  }
}

export const defaultEmailProvider = new EmailProvider();

