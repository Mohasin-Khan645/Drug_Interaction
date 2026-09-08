'use strict';

const { z } = require('zod');

const password = z
  .string()
  .min(12, 'Password must be at least 12 characters')
  .max(128)
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[0-9]/, 'Password must contain a digit');

const email = z.string().email().max(255).toLowerCase();

// Role is deliberately absent: self-service registration always creates a patient.
const register = {
  body: z.object({
    name: z.string().min(2).max(120),
    email,
    password,
  }),
};

const login = { body: z.object({ email, password: z.string().min(1).max(128) }) };

const verifyEmail = { body: z.object({ token: z.string().min(10).max(256) }) };

const forgotPassword = { body: z.object({ email }) };

const resetPassword = { body: z.object({ token: z.string().min(10).max(256), password }) };

module.exports = { register, login, verifyEmail, forgotPassword, resetPassword };
