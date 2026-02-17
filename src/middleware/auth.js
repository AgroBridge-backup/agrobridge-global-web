import authService from '../services/authService.js';

let logger;
try {
  logger = (await import('../utils/logger.js')).default;
} catch {
  logger = {
    info: (message, meta = {}) => console.log(`[INFO] ${message}`, meta),
    warn: (message, meta = {}) => console.warn(`[WARN] ${message}`, meta),
    error: (message, meta = {}) => console.error(`[ERROR] ${message}`, meta),
  };
}

const unauthorized = (req, res, message, code = 'AUTH_REQUIRED') => {
  req.securityFailureType = 'auth';
  return res.status(401).json({
    success: false,
    message,
    code,
    requestId: req.id,
  });
};

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('Authentication failed: Missing or invalid Authorization header', {
        ip: req.ip,
        path: req.path,
        method: req.method,
      });
      return unauthorized(req, res, 'Authentication required. Please provide a valid Bearer token.');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      logger.warn('Authentication failed: Empty token provided', {
        ip: req.ip,
        path: req.path,
        method: req.method,
      });
      return unauthorized(req, res, 'Authentication required. Token cannot be empty.');
    }

    const decoded = authService.verifyAccessToken(token);
    req.user = decoded;

    logger.info('Authentication successful', {
      userId: decoded.id || decoded.userId,
      role: decoded.role,
      ip: req.ip,
      path: req.path,
      method: req.method,
    });

    return next();
  } catch (error) {
    logger.error('Authentication failed: Token verification error', {
      error: error.message,
      ip: req.ip,
      path: req.path,
      method: req.method,
    });

    return unauthorized(req, res, 'Invalid or expired token. Please log in again.', 'AUTH_INVALID_TOKEN');
  }
};

const authorize = (roles) => {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  return (req, res, next) => {
    if (!req.user) {
      logger.warn('Authorization failed: No user attached to request', {
        ip: req.ip,
        path: req.path,
        method: req.method,
      });
      return unauthorized(req, res, 'Authentication required before authorization.');
    }

    const userRole = req.user.role;

    if (!allowedRoles.includes(userRole)) {
      logger.warn('Authorization failed: User role not permitted', {
        userId: req.user.id || req.user.userId,
        userRole,
        requiredRoles: allowedRoles,
        ip: req.ip,
        path: req.path,
        method: req.method,
      });
      req.securityFailureType = 'auth';
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role(s): ${allowedRoles.join(', ')}`,
        code: 'AUTH_FORBIDDEN',
        requestId: req.id,
      });
    }

    logger.info('Authorization successful', {
      userId: req.user.id || req.user.userId,
      role: userRole,
      ip: req.ip,
      path: req.path,
      method: req.method,
    });

    return next();
  };
};

const optionalAuth = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      req.user = null;
      return next();
    }

    try {
      const decoded = authService.verifyAccessToken(token);
      req.user = decoded;

      logger.info('Optional authentication successful', {
        userId: decoded.id || decoded.userId,
        role: decoded.role,
        ip: req.ip,
        path: req.path,
        method: req.method,
      });
    } catch {
      req.user = null;
      logger.info('Optional authentication: Invalid token, proceeding as unauthenticated', {
        ip: req.ip,
        path: req.path,
        method: req.method,
      });
    }

    return next();
  } catch (error) {
    req.user = null;
    logger.error('Optional authentication error', {
      error: error.message,
      ip: req.ip,
      path: req.path,
      method: req.method,
    });
    return next();
  }
};

export {
  authenticate,
  authorize,
  optionalAuth,
};

export default {
  authenticate,
  authorize,
  optionalAuth,
};
