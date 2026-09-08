'use strict';

const config = require('../config');
const authService = require('../services/authService');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');

const cookieOptions = () => ({
  httpOnly: true,
  secure: config.cookies.secure,
  sameSite: config.cookies.sameSite,
  path: config.cookies.path,
  maxAge: config.jwt.refreshExpiresInDays * 24 * 60 * 60 * 1000,
});

const setRefreshCookie = (res, token) =>
  res.cookie(config.cookies.refreshName, token, cookieOptions());

const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body, req);
  return sendSuccess(res, result, 201);
});

const login = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.login(req.body, req);
  setRefreshCookie(res, refreshToken);
  return sendSuccess(res, { user, accessToken });
});

const refresh = asyncHandler(async (req, res) => {
  const presented = req.cookies[config.cookies.refreshName];
  const { user, accessToken, refreshToken } = await authService.refresh(presented, req);
  setRefreshCookie(res, refreshToken);
  return sendSuccess(res, { user, accessToken });
});

const logout = asyncHandler(async (req, res) => {
  const result = await authService.logout(req.cookies[config.cookies.refreshName], req);
  res.clearCookie(config.cookies.refreshName, { path: config.cookies.path });
  return sendSuccess(res, result);
});

const me = asyncHandler(async (req, res) => sendSuccess(res, await authService.currentUser(req.user.id)));

const verifyEmail = asyncHandler(async (req, res) =>
  sendSuccess(res, await authService.verifyEmail(req.body.token, req))
);

const forgotPassword = asyncHandler(async (req, res) =>
  sendSuccess(res, await authService.forgotPassword(req.body.email, req))
);

const resetPassword = asyncHandler(async (req, res) =>
  sendSuccess(res, await authService.resetPassword(req.body, req))
);

module.exports = { register, login, refresh, logout, me, verifyEmail, forgotPassword, resetPassword };
