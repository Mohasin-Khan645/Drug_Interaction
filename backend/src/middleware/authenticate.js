'use strict';

const ApiError = require('../utils/apiError');
const { verifyAccessToken } = require('../utils/jwt');
const userRepository = require('../repositories/userRepository');
const asyncHandler = require('../utils/asyncHandler');

const authenticate = () =>
  asyncHandler(async (req, res, next) => {
    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer ')) {
      throw ApiError.unauthenticated();
    }
    let payload;
    try {
      payload = verifyAccessToken(header.slice(7));
    } catch {
      throw ApiError.unauthenticated('Invalid or expired access token');
    }

    // The role always comes from the database, never from the request.
    const user = await userRepository.findById(payload.sub);
    if (!user || user.deletedAt) throw ApiError.unauthenticated('User no longer exists');
    if (user.status !== 'ACTIVE') throw ApiError.forbidden('User account is not active');

    req.user = { id: user.id, role: user.role, email: user.email, name: user.name };
    next();
  });

module.exports = authenticate;
