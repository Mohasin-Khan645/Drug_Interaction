'use strict';

const jwt = require('jsonwebtoken');
const config = require('../config');

const signAccessToken = (user) =>
  jwt.sign({ sub: user.id, role: user.role, email: user.email }, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn,
  });

const verifyAccessToken = (token) => jwt.verify(token, config.jwt.accessSecret);

module.exports = { signAccessToken, verifyAccessToken };
