/**
 * JWT Authentication Service
 * Secure token generation and verification with separate secrets
 * @module services/authService
 */

import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

const buildJwtOptions = (expiresIn) => ({
  expiresIn,
  algorithm: 'HS256',
  issuer: config.jwt.issuer,
  audience: config.jwt.audience,
});

/**
 * Generate access token for user authentication.
 * @param {Object} user User object containing id, email and role.
 * @returns {string} JWT access token.
 */
const generateAccessToken = (user) => {
  try {
    const jti = crypto.randomUUID();
    const payload = {
      id: user.id || user._id,
      email: user.email,
      role: user.role,
      jti,
    };

    const token = jwt.sign(payload, config.jwt.accessSecret, buildJwtOptions(config.jwt.accessExpiresIn));
    console.log(`[AUTH] Access token generated for user: ${payload.id}, jti: ${jti}`);
    return token;
  } catch (error) {
    console.error('[AUTH] Error generating access token:', error.message);
    throw new Error('Failed to generate access token');
  }
};

/**
 * Generate refresh token for session extension.
 * @param {Object} user User object containing id.
 * @returns {string} JWT refresh token.
 */
const generateRefreshToken = (user) => {
  try {
    const jti = crypto.randomUUID();
    const payload = {
      id: user.id || user._id,
      type: 'refresh',
      jti,
    };

    const token = jwt.sign(payload, config.jwt.refreshSecret, buildJwtOptions(config.jwt.refreshExpiresIn));
    console.log(`[AUTH] Refresh token generated for user: ${payload.id}, jti: ${jti}`);
    return token;
  } catch (error) {
    console.error('[AUTH] Error generating refresh token:', error.message);
    throw new Error('Failed to generate refresh token');
  }
};

/**
 * Verify access token.
 * @param {string} token JWT access token.
 * @returns {Object} Decoded token payload.
 */
const verifyAccessToken = (token) => {
  try {
    const decoded = jwt.verify(token, config.jwt.accessSecret, {
      algorithms: ['HS256'],
      issuer: config.jwt.issuer,
      audience: config.jwt.audience,
    });
    console.log(`[AUTH] Access token verified for user: ${decoded.id}, jti: ${decoded.jti}`);
    return decoded;
  } catch (error) {
    console.error('[AUTH] Access token verification failed:', error.message);
    if (error.name === 'TokenExpiredError') {
      throw new Error('Access token has expired');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid access token');
    }
    throw new Error('Access token verification failed');
  }
};

/**
 * Verify refresh token.
 * @param {string} token JWT refresh token.
 * @returns {Object} Decoded token payload.
 */
const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, config.jwt.refreshSecret, {
      algorithms: ['HS256'],
      issuer: config.jwt.issuer,
      audience: config.jwt.audience,
    });

    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }

    console.log(`[AUTH] Refresh token verified for user: ${decoded.id}, jti: ${decoded.jti}`);
    return decoded;
  } catch (error) {
    console.error('[AUTH] Refresh token verification failed:', error.message);
    if (error.name === 'TokenExpiredError') {
      throw new Error('Refresh token has expired');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid refresh token');
    }
    throw new Error('Refresh token verification failed');
  }
};

/**
 * Decode token without signature verification.
 * @param {string} token JWT token.
 * @returns {Object|null} Decoded payload or null if invalid.
 */
const decodeToken = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded) {
      console.warn('[AUTH] Failed to decode token');
      return null;
    }
    return decoded;
  } catch (error) {
    console.error('[AUTH] Error decoding token:', error.message);
    return null;
  }
};

export {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
};

export default {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
};
