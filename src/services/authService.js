/**
 * JWT Authentication Service
 * Secure token generation and verification with separate secrets
 * @module services/authService
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { config } = require('../config/index.js');

/**
 * Generate access token for user authentication
 * @param {Object} user - User object containing id, email, role
 * @returns {string} JWT access token
 */
const generateAccessToken = (user) => {
  try {
    const jti = crypto.randomUUID();
    
    const payload = {
      id: user.id || user._id,
      email: user.email,
      role: user.role,
      jti: jti
    };
    
    const token = jwt.sign(payload, config.jwt.accessSecret, {
      expiresIn: config.jwt.accessExpiresIn || '1h',
      algorithm: 'HS256'
    });
    
    console.log(`[AUTH] Access token generated for user: ${user.email}, jti: ${jti}`);
    
    return token;
  } catch (error) {
    console.error('[AUTH] Error generating access token:', error.message);
    throw new Error('Failed to generate access token');
  }
};

/**
 * Generate refresh token for session extension
 * @param {Object} user - User object containing id
 * @returns {string} JWT refresh token
 */
const generateRefreshToken = (user) => {
  try {
    const jti = crypto.randomUUID();
    
    const payload = {
      id: user.id || user._id,
      type: 'refresh',
      jti: jti
    };
    
    const token = jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn || '7d',
      algorithm: 'HS256'
    });
    
    console.log(`[AUTH] Refresh token generated for user: ${user.email || user.id}, jti: ${jti}`);
    
    return token;
  } catch (error) {
    console.error('[AUTH] Error generating refresh token:', error.message);
    throw new Error('Failed to generate refresh token');
  }
};

/**
 * Verify access token
 * @param {string} token - JWT access token
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
const verifyAccessToken = (token) => {
  try {
    const decoded = jwt.verify(token, config.jwt.accessSecret, {
      algorithms: ['HS256']
    });
    
    console.log(`[AUTH] Access token verified for user: ${decoded.email}, jti: ${decoded.jti}`);
    
    return decoded;
  } catch (error) {
    console.error('[AUTH] Access token verification failed:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      throw new Error('Access token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid access token');
    } else {
      throw new Error('Access token verification failed');
    }
  }
};

/**
 * Verify refresh token
 * @param {string} token - JWT refresh token
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, config.jwt.refreshSecret, {
      algorithms: ['HS256']
    });
    
    // Ensure it's a refresh token
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }
    
    console.log(`[AUTH] Refresh token verified for user: ${decoded.id}, jti: ${decoded.jti}`);
    
    return decoded;
  } catch (error) {
    console.error('[AUTH] Refresh token verification failed:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      throw new Error('Refresh token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid refresh token');
    } else {
      throw new Error('Refresh token verification failed');
    }
  }
};

/**
 * Decode token without verification
 * @param {string} token - JWT token
 * @returns {Object|null} Decoded payload or null if invalid
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

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken
};
