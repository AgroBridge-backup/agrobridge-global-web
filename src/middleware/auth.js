const authService = require('../services/authService');

const logger = {
  info: (message, meta = {}) => console.log(`[INFO] ${message}`, meta),
  warn: (message, meta = {}) => console.warn(`[WARN] ${message}`, meta),
  error: (message, meta = {}) => console.error(`[ERROR] ${message}`, meta)
};

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('Authentication failed: Missing or invalid Authorization header', {
        ip: req.ip,
        path: req.path,
        method: req.method
      });
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please provide a valid Bearer token.',
        code: 'AUTH_REQUIRED',
        requestId: req.id,
      });
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      logger.warn('Authentication failed: Empty token provided', {
        ip: req.ip,
        path: req.path,
        method: req.method
      });
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Token cannot be empty.',
        code: 'AUTH_REQUIRED',
        requestId: req.id,
      });
    }

    const decoded = await authService.verifyAccessToken(token);
    
    req.user = decoded;
    
    logger.info('Authentication successful', {
      userId: decoded.id || decoded.userId,
      role: decoded.role,
      ip: req.ip,
      path: req.path,
      method: req.method
    });
    
    next();
  } catch (error) {
    logger.error('Authentication failed: Token verification error', {
      error: error.message,
      ip: req.ip,
      path: req.path,
      method: req.method
    });
    
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Please log in again.',
      code: 'AUTH_INVALID_TOKEN',
      requestId: req.id,
    });
  }
};

const authorize = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      logger.warn('Authorization failed: No user attached to request', {
        ip: req.ip,
        path: req.path,
        method: req.method
      });
      return res.status(401).json({
        success: false,
        message: 'Authentication required before authorization.',
        code: 'AUTH_REQUIRED',
        requestId: req.id,
      });
    }

    const userRole = req.user.role;
    
    if (!roles.includes(userRole)) {
      logger.warn('Authorization failed: User role not permitted', {
        userId: req.user.id || req.user.userId,
        userRole,
        requiredRoles: roles,
        ip: req.ip,
        path: req.path,
        method: req.method
      });
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role(s): ${roles.join(', ')}`,
        code: 'AUTH_FORBIDDEN',
        requestId: req.id,
      });
    }

    logger.info('Authorization successful', {
      userId: req.user.id || req.user.userId,
      role: userRole,
      ip: req.ip,
      path: req.path,
      method: req.method
    });
    
    next();
  };
};

const optionalAuth = async (req, res, next) => {
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
      const decoded = await authService.verifyAccessToken(token);
      req.user = decoded;
      
      logger.info('Optional authentication successful', {
        userId: decoded.id || decoded.userId,
        role: decoded.role,
        ip: req.ip,
        path: req.path,
        method: req.method
      });
    } catch (error) {
      req.user = null;
      logger.info('Optional authentication: Invalid token, proceeding as unauthenticated', {
        ip: req.ip,
        path: req.path,
        method: req.method
      });
    }
    
    next();
  } catch (error) {
    req.user = null;
    logger.error('Optional authentication error', {
      error: error.message,
      ip: req.ip,
      path: req.path,
      method: req.method
    });
    next();
  }
};

module.exports = {
  authenticate,
  authorize,
  optionalAuth
};
