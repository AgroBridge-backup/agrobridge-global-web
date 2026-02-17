import cors from 'cors';
import { doubleCsrf } from 'csrf-csrf';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import Redis from 'ioredis';
import RedisStore from 'rate-limit-redis';
import config from '../config/index.js';
import { cspDirectives } from '../config/csp.js';

const isProduction = config.app.env === 'production';

let rateLimitRedisClient = null;
let rateLimitStore;

if (process.env.REDIS_URL) {
  try {
    rateLimitRedisClient = new Redis(process.env.REDIS_URL, {
      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,
      connectTimeout: 5000,
    });

    rateLimitRedisClient.on('error', (err) => {
      console.warn(`[SECURITY] Redis error: ${err.message}. Rate limiting will rely on in-memory state.`);
    });

    rateLimitStore = new RedisStore({
      sendCommand: (...args) => rateLimitRedisClient.call(...args),
      prefix: config.rateLimit.keyPrefix,
    });

    console.log('[SECURITY] Rate limiting backed by Redis');
  } catch (err) {
    rateLimitRedisClient = null;
    rateLimitStore = undefined;
    console.warn('[SECURITY] Redis unavailable, using in-memory rate limiting', err.message);
  }
}

const buildAllowedOrigins = () => {
  if (config.cors.origin === '*') {
    return '*';
  }

  const fromConfig = Array.isArray(config.cors.origin) ? config.cors.origin : [];
  if (fromConfig.length > 0) {
    return fromConfig;
  }

  if (isProduction) {
    return [process.env.FRONTEND_URL, process.env.ADMIN_URL].filter(Boolean);
  }

  return ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:8080'];
};

const allowedOrigins = buildAllowedOrigins();

const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    useDefaults: false,
    directives: cspDirectives,
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  dnsPrefetchControl: true,
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true,
});

const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Non-browser callers (health probes, CLI tools, server-to-server) do not send Origin.
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins === '*') {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    const error = new Error(isProduction ? 'CORS policy violation' : `Origin ${origin} not allowed by CORS`);
    error.code = 'CORS_ERROR';
    return callback(error);
  },
  methods: config.cors.methods,
  allowedHeaders: config.cors.allowedHeaders,
  exposedHeaders: config.cors.exposedHeaders,
  credentials: config.cors.credentials,
  maxAge: config.cors.maxAge,
  preflightContinue: false,
  optionsSuccessStatus: 204,
});

const corsErrorHandler = (err, req, res, next) => {
  if (err?.code === 'CORS_ERROR') {
    req.securityFailureType = 'cors';
    return res.status(403).json({
      success: false,
      message: 'Origin not allowed by CORS policy',
      code: 'CORS_ERROR',
      requestId: req.id,
    });
  }

  return next(err);
};

const resolveClientIdentity = (req) => {
  if (req.ip) {
    return req.ip;
  }
  if (req.socket?.remoteAddress) {
    return req.socket.remoteAddress;
  }
  return 'unknown';
};

const calculateRetryAfterSeconds = (rateLimitInfo) => {
  const resetTime = rateLimitInfo?.resetTime;
  if (!resetTime) {
    return Math.ceil(config.rateLimit.windowMs / 1000);
  }

  const resetTimestamp = resetTime instanceof Date ? resetTime.getTime() : Number(resetTime);
  if (!Number.isFinite(resetTimestamp)) {
    return Math.ceil(config.rateLimit.windowMs / 1000);
  }

  return Math.max(1, Math.ceil((resetTimestamp - Date.now()) / 1000));
};

const rateLimitMiddleware = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  standardHeaders: config.rateLimit.standardHeaders,
  legacyHeaders: config.rateLimit.legacyHeaders,
  store: rateLimitStore,
  skipSuccessfulRequests: config.rateLimit.skipSuccessfulRequests,
  skipFailedRequests: config.rateLimit.skipFailedRequests,
  skip: (req) => req.method === 'OPTIONS',
  keyGenerator: resolveClientIdentity,
  handler: (req, res) => {
    req.securityFailureType = 'rate_limit';
    const retryAfter = calculateRetryAfterSeconds(req.rateLimit);
    res.setHeader('Retry-After', String(retryAfter));

    res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later.',
      code: 'RATE_LIMIT',
      retryAfter,
      requestId: req.id,
    });
  },
});

const sanitizeDocument = (value, req) => {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeDocument(item, req));
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  const sanitized = {};
  for (const [key, nestedValue] of Object.entries(value)) {
    const sanitizedKey = key.replace(/\$/g, '_').replace(/\./g, '_');
    if (sanitizedKey !== key) {
      console.warn(`[SECURITY] MongoDB sanitization triggered: ${key} in ${req.method} ${req.path}`);
    }
    sanitized[sanitizedKey] = sanitizeDocument(nestedValue, req);
  }
  return sanitized;
};

const mongoSanitizeMiddleware = (req, _res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeDocument(req.body, req);
  }

  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeDocument(req.params, req);
  }

  return next();
};

let doubleCsrfProtection = (_req, _res, next) => next();
let generateToken = () => {
  throw new Error('CSRF system is not initialized.');
};

const initializeCsrf = () => {
  if (!config.csrf.secret || config.csrf.secret.length < 32) {
    throw new Error('FATAL: CSRF_SECRET must be defined and be at least 32 characters.');
  }

  const csrf = doubleCsrf({
    getSecret: () => config.csrf.secret,
    cookieName: config.csrf.cookieName,
    cookieOptions: {
      httpOnly: true,
      secure: config.csrf.secure,
      sameSite: config.csrf.sameSite,
      path: '/',
      maxAge: config.csrf.maxAgeMs,
    },
    getTokenFromRequest: (req) => req.get(config.csrf.headerName) || req.get('X-CSRF-Token'),
  });

  doubleCsrfProtection = csrf.doubleCsrfProtection;
  generateToken = csrf.generateToken;
};

const csrfErrorHandler = (err, req, res, next) => {
  if (err.message === 'invalid csrf token' || err.code === 'EBADCSRFTOKEN') {
    req.securityFailureType = 'csrf';
    console.error(`[SECURITY] CSRF validation failed: ${req.method} ${req.path} - ${req.ip}`);
    return res.status(403).json({
      success: false,
      message: 'Invalid or missing CSRF token',
      code: 'CSRF_ERROR',
      requestId: req.id,
    });
  }
  return next(err);
};

const stateChangingMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];

const conditionalCsrf = (req, res, next) => {
  if (stateChangingMethods.includes(req.method)) {
    return doubleCsrfProtection(req, res, next);
  }
  return next();
};

const setupSecurity = (app) => {
  initializeCsrf();

  app.use(helmetMiddleware);
  app.use(corsMiddleware);
  app.use(corsErrorHandler);

  if (config.rateLimit.enabled) {
    app.use(rateLimitMiddleware);
  }

  app.use(mongoSanitizeMiddleware);
  app.use(conditionalCsrf);
  app.use(csrfErrorHandler);

  app.get('/api/csrf-token', (req, res) => {
    const token = generateToken(req, res);
    res.setHeader('Cache-Control', 'no-store');
    res.json({ csrfToken: token });
  });

  console.log('[SECURITY] Security middleware initialized successfully');
};

const getRateLimitRedisClient = () => rateLimitRedisClient;

export {
  helmetMiddleware,
  corsMiddleware,
  corsErrorHandler,
  rateLimitMiddleware,
  mongoSanitizeMiddleware,
  doubleCsrfProtection,
  generateToken,
  conditionalCsrf,
  csrfErrorHandler,
  getRateLimitRedisClient,
  setupSecurity,
};

export default setupSecurity;
