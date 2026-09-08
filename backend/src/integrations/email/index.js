'use strict';

const nodemailer = require('nodemailer');
const config = require('../../config');
const logger = require('../../config/logger');

class ConsoleEmailProvider {
   
  async send({ to, subject }) {
    logger.info({ to, subject }, 'Email dispatched (console provider)');
    return { delivered: true, provider: 'console' };
  }
}

class SmtpEmailProvider {
  constructor() {
    this.transport = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.port === 465,
      auth: config.email.user ? { user: config.email.user, pass: config.email.password } : undefined,
    });
  }

  async send({ to, subject, text, html }) {
    await this.transport.sendMail({ from: config.email.from, to, subject, text, html });
    return { delivered: true, provider: 'smtp' };
  }
}

const getEmailProvider = () =>
  config.email.host ? new SmtpEmailProvider() : new ConsoleEmailProvider();

module.exports = { getEmailProvider, ConsoleEmailProvider, SmtpEmailProvider };
