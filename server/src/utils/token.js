// server/src/utils/token.js
const jwt = require('jsonwebtoken');

const createAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES || '15m',
  });
};

const createRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES || '7d',
  });
};

module.exports = { createAccessToken, createRefreshToken };
