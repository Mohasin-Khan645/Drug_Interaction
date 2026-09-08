'use strict';

const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

const hashPassword = (plain) => bcrypt.hash(plain, SALT_ROUNDS);

const verifyPassword = (plain, hash) => bcrypt.compare(plain, hash);

const randomToken = (bytes = 48) => crypto.randomBytes(bytes).toString('hex');

const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');

const stableHash = (value) => sha256(JSON.stringify(value));

module.exports = { hashPassword, verifyPassword, randomToken, sha256, stableHash };
