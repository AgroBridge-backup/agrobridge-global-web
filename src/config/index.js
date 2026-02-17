import 'dotenv/config';

const parseInteger = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseCsv = (value, fallback) => {
  const source = value || fallback;
  return source.split(',').map((entry) => entry.trim()).filter(Boolean);
};

const parseTrustProxy = (value) => {
  if (value === undefined || value === null || value === '') {
    return false;
  }

  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  if (/^\d+$/.test(value)) {
    return Number.parseInt(value, 10);
  }

  return value;
};

const config = {
  app: {
    name: process.env.APP_NAME || 'AgroBridge',
    env: process.env.NODE_ENV || 'development',
    port: parseInteger(process.env.PORT, 3000),
    version: process.env.APP_VERSION || '1.0.0',
  },

  server: {
    host: process.env.SERVER_HOST || '0.0.0.0',
    port: parseInteger(process.env.SERVER_PORT || process.env.PORT, 3000),
    timeout: parseInteger(process.env.SERVER_TIMEOUT, 30000),
    keepAlive: process.env.SERVER_KEEP_ALIVE === 'true',
    trustProxy: parseTrustProxy(process.env.TRUST_PROXY),
  },

  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/agrobridge',
    required: process.env.DB_REQUIRED === 'true',
    indexMode: process.env.DB_INDEX_MODE || 'ensure',
    requireIndexes: process.env.DB_REQUIRE_INDEXES === 'true',
    options: {
      maxPoolSize: parseInteger(process.env.DB_POOL_SIZE, 20),
      socketTimeoutMS: parseInteger(process.env.DB_CONNECTION_TIMEOUT, 45000),
      serverSelectionTimeoutMS: parseInteger(process.env.DB_SERVER_SELECTION_TIMEOUT, 5000),
    },
  },

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    issuer: process.env.JWT_ISSUER || 'agrobridge',
    audience: process.env.JWT_AUDIENCE || 'agrobridge-api',
  },

  csrf: {
    secret: process.env.CSRF_SECRET,
    cookieName: process.env.CSRF_COOKIE_NAME || 'csrf-token',
    headerName: process.env.CSRF_HEADER_NAME || 'X-CSRF-Token',
    secure: process.env.CSRF_SECURE === 'true' || process.env.NODE_ENV === 'production',
    sameSite: process.env.CSRF_SAME_SITE || 'strict',
    maxAgeMs: parseInteger(process.env.CSRF_MAX_AGE_MS, 60 * 60 * 1000),
  },

  security: {
    bcryptRounds: parseInteger(process.env.BCRYPT_ROUNDS, 12),
    maxLoginAttempts: parseInteger(process.env.MAX_LOGIN_ATTEMPTS, 5),
    lockoutDuration: parseInteger(process.env.LOCKOUT_DURATION, 900),
    passwordMinLength: parseInteger(process.env.PASSWORD_MIN_LENGTH, 12),
    requireStrongPassword: process.env.REQUIRE_STRONG_PASSWORD !== 'false',
    sessionTimeout: parseInteger(process.env.SESSION_TIMEOUT, 3600),
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
      return parseCsv(origin, '');
    })(),
    credentials: process.env.CORS_CREDENTIALS === 'true',
    methods: parseCsv(process.env.CORS_METHODS, 'GET,POST,PUT,DELETE,PATCH,OPTIONS'),
    allowedHeaders: parseCsv(process.env.CORS_ALLOWED_HEADERS, 'Content-Type,Authorization,X-CSRF-Token'),
    exposedHeaders: parseCsv(process.env.CORS_EXPOSED_HEADERS, 'X-Total-Count,X-Page-Count'),
    maxAge: parseInteger(process.env.CORS_MAX_AGE, 86400),
  },

  rateLimit: {
    enabled: process.env.RATE_LIMIT_ENABLED !== 'false',
    windowMs: parseInteger(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
    maxRequests: parseInteger(process.env.RATE_LIMIT_MAX_REQUESTS, 100),
    skipSuccessfulRequests: process.env.RATE_LIMIT_SKIP_SUCCESS === 'true',
    skipFailedRequests: process.env.RATE_LIMIT_SKIP_FAILED === 'true',
    keyPrefix: process.env.RATE_LIMIT_KEY_PREFIX || 'ratelimit:',
    standardHeaders: process.env.RATE_LIMIT_STANDARD_HEADERS !== 'false',
    legacyHeaders: process.env.RATE_LIMIT_LEGACY_HEADERS === 'true',
  },

  observability: {
    enabled: process.env.OBSERVABILITY_ENABLED !== 'false',
    metricsEnabled: process.env.METRICS_ENDPOINT_ENABLED === 'true',
    metricsPath: process.env.METRICS_PATH || '/metrics',
    metricsBearerToken: process.env.METRICS_BEARER_TOKEN || '',
  },
};

function validateRequiredSecrets() {
  const requiredSecrets = [
    { name: 'CSRF_SECRET', value: config.csrf.secret, minLength: 32 },
    { name: 'JWT_ACCESS_SECRET', value: config.jwt.accessSecret, minLength: 64 },
    { name: 'JWT_REFRESH_SECRET', value: config.jwt.refreshSecret, minLength: 64 },
  ];

  const errors = [];

  for (const secret of requiredSecrets) {
    if (!secret.value) {
      errors.push(`FATAL: ${secret.name} is not set in environment variables`);
    } else if (secret.value.length < secret.minLength) {
      errors.push(`FATAL: ${secret.name} must be at least ${secret.minLength} characters (current: ${secret.value.length})`);
    }
  }

  if (config.jwt.accessSecret && config.jwt.refreshSecret && config.jwt.accessSecret === config.jwt.refreshSecret) {
    errors.push('FATAL: JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be different values');
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }

  return true;
}

function validateConfig() {
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
}

export {
  config,
  validateConfig,
  validateRequiredSecrets,
};

export default config;
