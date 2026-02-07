import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';
import mongoSanitize from 'express-mongo-sanitize';
import { doubleCsrf } from 'csrf-csrf';

const isProduction = process.env.NODE_ENV === 'production';

// Redis-backed rate limiting with graceful fallback to in-memory store
let rateLimitStore;
try {
  if (process.env.REDIS_URL) {
    const redisClient = new Redis(process.env.REDIS_URL, {
      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,
      connectTimeout: 5000,
    });
    redisClient.on('error', (err) => {
      console.warn(`[SECURITY] Redis error: ${err.message}. Rate limiting falling back to in-memory.`);
    });
    rateLimitStore = new RedisStore({
      sendCommand: (...args) => redisClient.call(...args),
    });
    console.log('[SECURITY] Rate limiting backed by Redis');
  }
} catch (err) {
  console.warn('[SECURITY] Redis unavailable, using in-memory rate limiting (not suitable for multi-instance)', err.message);
}

const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: { policy: "cross-origin" },
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
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  xssFilter: true,
});

const corsMiddleware = cors({
  origin: (origin, callback) => {
    const allowedOrigins = isProduction
      ? [process.env.FRONTEND_URL, process.env.ADMIN_URL].filter(Boolean)
      : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:8080'];

    // Allow requests with no origin ONLY in development (for curl, Postman, etc.)
    if (!origin) {
      return isProduction
        ? callback(new Error('Origin header is required'))
        : callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Requested-With'],
  exposedHeaders: ['X-CSRF-Token', 'X-Request-ID'],
  credentials: true,
  maxAge: 86400,
  preflightContinue: false,
  optionsSuccessStatus: 204,
});

const rateLimitMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  store: rateLimitStore, // undefined gracefully falls back to MemoryStore
  skip: (req) => req.method === 'OPTIONS',
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later.',
      code: 'RATE_LIMIT',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000),
      requestId: req.id,
    });
  },
  keyGenerator: (req) => req.ip,
});

const mongoSanitizeMiddleware = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    console.warn(`[SECURITY] MongoDB sanitization triggered: ${key} in ${req.method} ${req.path}`);
  },
});

const { doubleCsrfProtection, generateToken } = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET || 'default-csrf-secret',
  cookieName: '_csrf',
  cookieOptions: {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    path: '/',
    maxAge: 3600,
  },
  getTokenFromRequest: (req) => req.headers['x-csrf-token'] || req.headers['X-CSRF-Token'],
});

const csrfErrorHandler = (err, req, res, next) => {
  if (err.message === 'invalid csrf token' || err.code === 'EBADCSRFTOKEN') {
    console.error(`[SECURITY] CSRF validation failed: ${req.method} ${req.path} - ${req.ip}`);
    return res.status(403).json({
      success: false,
      message: 'Invalid or missing CSRF token',
      code: 'CSRF_ERROR',
      requestId: req.id,
    });
  }
  next(err);
};

const stateChangingMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];

const conditionalCsrf = (req, res, next) => {
  if (stateChangingMethods.includes(req.method)) {
    return doubleCsrfProtection(req, res, next);
  }
  next();
};

const setupSecurity = (app) => {
  app.use(helmetMiddleware);
  
  app.use(corsMiddleware);
  
  app.use(rateLimitMiddleware);
  
  app.use(mongoSanitizeMiddleware);
  
  app.use(conditionalCsrf);
  
  app.use(csrfErrorHandler);
  
  app.get('/api/csrf-token', (req, res) => {
    const token = generateToken(req, res);
    res.json({ csrfToken: token });
  });
  
  console.log('[SECURITY] Security middleware initialized successfully');
};

export {
  helmetMiddleware,
  corsMiddleware,
  rateLimitMiddleware,
  mongoSanitizeMiddleware,
  doubleCsrfProtection,
  generateToken,
  conditionalCsrf,
  csrfErrorHandler,
  setupSecurity,
};

export default setupSecurity;
