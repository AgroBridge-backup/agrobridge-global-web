require('dotenv').config();

const config = {
  app: {
    name: process.env.APP_NAME || 'AgroBridge',
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT, 10) || 3000,
    version: process.env.APP_VERSION || '1.0.0',
  },

  server: {
    host: process.env.SERVER_HOST || '0.0.0.0',
    port: parseInt(process.env.SERVER_PORT, 10) || 3000,
    timeout: parseInt(process.env.SERVER_TIMEOUT, 10) || 30000,
    keepAlive: process.env.SERVER_KEEP_ALIVE === 'true',
  },

  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/agrobridge',
    options: {
      maxPoolSize: parseInt(process.env.DB_POOL_SIZE, 10) || 20,
      socketTimeoutMS: parseInt(process.env.DB_CONNECTION_TIMEOUT, 10) || 45000,
      serverSelectionTimeoutMS: 5000,
    },
  },

  jwt: {
    accessSecret: (() => {
      const secret = process.env.JWT_ACCESS_SECRET;
      if (!secret) {
        throw new Error('FATAL: JWT_ACCESS_SECRET must be set in environment variables');
      }
      if (secret.length < 64) {
        throw new Error('FATAL: JWT secret must be at least 64 characters for HMAC-SHA256 security');
      }
      return secret;
    })(),
    refreshSecret: (() => {
      const secret = process.env.JWT_REFRESH_SECRET;
      if (!secret) {
        throw new Error('FATAL: JWT_REFRESH_SECRET must be set in environment variables');
      }
      if (secret.length < 64) {
        throw new Error('FATAL: JWT secret must be at least 64 characters for HMAC-SHA256 security');
      }
      if (secret === process.env.JWT_ACCESS_SECRET) {
        throw new Error('FATAL: JWT_REFRESH_SECRET must be different from JWT_ACCESS_SECRET');
      }
      return secret;
    })(),
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    issuer: process.env.JWT_ISSUER || 'agrobridge',
    audience: process.env.JWT_AUDIENCE || 'agrobridge-api',
  },

  csrf: {
    secret: (() => {
      const secret = process.env.CSRF_SECRET;
      if (!secret) {
        throw new Error('FATAL: CSRF_SECRET must be set in environment variables');
      }
      if (secret.length < 32) {
        throw new Error('FATAL: CSRF_SECRET must be at least 32 characters for security');
      }
      return secret;
    })(),
    cookieName: process.env.CSRF_COOKIE_NAME || 'csrf-token',
    headerName: process.env.CSRF_HEADER_NAME || 'X-CSRF-Token',
    secure: process.env.CSRF_SECURE === 'true' || process.env.NODE_ENV === 'production',
    sameSite: process.env.CSRF_SAME_SITE || 'strict',
  },

  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS, 10) || 12,
    maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS, 10) || 5,
    lockoutDuration: parseInt(process.env.LOCKOUT_DURATION, 10) || 900,
    passwordMinLength: parseInt(process.env.PASSWORD_MIN_LENGTH, 10) || 12,
    requireStrongPassword: process.env.REQUIRE_STRONG_PASSWORD !== 'false',
    sessionTimeout: parseInt(process.env.SESSION_TIMEOUT, 10) || 3600,
  },

  cors: {
    origin: (() => {
      const origin = process.env.CORS_ORIGIN || process.env.CORS_ORIGINS;
      if (!origin) {
        return process.env.NODE_ENV === 'production' ? false : '*';
      }
      if (origin === '*') {
        return origin;
      }
      return origin.split(',').map(o => o.trim()).filter(Boolean);
    })(),
    credentials: process.env.CORS_CREDENTIALS === 'true',
    methods: (process.env.CORS_METHODS || 'GET,POST,PUT,DELETE,PATCH,OPTIONS').split(','),
    allowedHeaders: (process.env.CORS_ALLOWED_HEADERS || 'Content-Type,Authorization,X-CSRF-Token').split(','),
    exposedHeaders: (process.env.CORS_EXPOSED_HEADERS || 'X-Total-Count,X-Page-Count').split(','),
    maxAge: parseInt(process.env.CORS_MAX_AGE, 10) || 86400,
  },

  rateLimit: {
    enabled: process.env.RATE_LIMIT_ENABLED !== 'false',
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
    skipSuccessfulRequests: process.env.RATE_LIMIT_SKIP_SUCCESS === 'true',
    skipFailedRequests: process.env.RATE_LIMIT_SKIP_FAILED === 'false',
    keyPrefix: process.env.RATE_LIMIT_KEY_PREFIX || 'ratelimit:',
    standardHeaders: process.env.RATE_LIMIT_STANDARD_HEADERS !== 'false',
    legacyHeaders: process.env.RATE_LIMIT_LEGACY_HEADERS === 'true',
  },
};

function validateRequiredSecrets() {
  const requiredSecrets = [
    { name: 'CSRF_SECRET', value: process.env.CSRF_SECRET, minLength: 32 },
    { name: 'JWT_ACCESS_SECRET', value: process.env.JWT_ACCESS_SECRET, minLength: 64 },
    { name: 'JWT_REFRESH_SECRET', value: process.env.JWT_REFRESH_SECRET, minLength: 64 },
  ];

  const errors = [];

  for (const secret of requiredSecrets) {
    if (!secret.value) {
      errors.push(`FATAL: ${secret.name} is not set in environment variables`);
    } else if (secret.value.length < secret.minLength) {
      errors.push(`FATAL: ${secret.name} must be at least ${secret.minLength} characters (current: ${secret.value.length})`);
    }
  }

  if (process.env.JWT_ACCESS_SECRET && process.env.JWT_REFRESH_SECRET) {
    if (process.env.JWT_ACCESS_SECRET === process.env.JWT_REFRESH_SECRET) {
      errors.push('FATAL: JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be different values');
    }
  }

  if (errors.length > 0) {
    errors.forEach(error => console.error(error));
    throw new Error('Configuration validation failed. Check errors above.');
  }

  return true;
}

function validateConfig() {
  try {
    validateRequiredSecrets();

    if (config.app.env === 'production') {
      if (config.cors.origin === '*') {
        console.warn('WARNING: CORS origin is set to * in production. This is not recommended.');
      }
      if (!config.csrf.secure) {
        console.warn('WARNING: CSRF secure cookies are disabled in production.');
      }
    }

    return true;
  } catch (error) {
    console.error('Configuration Error:', error.message);
    process.exit(1);
  }
}

module.exports = {
  config,
  validateConfig,
  validateRequiredSecrets,
};
