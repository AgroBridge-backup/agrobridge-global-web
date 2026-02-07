/**
 * AgroBridge Global — Main Express application entry point.
 *
 * Responsibilities:
 *  1. Load environment configuration
 *  2. Create Express app and apply middleware
 *  3. Mount routes
 *  4. Mount the global error handler (MUST be last app.use())
 *  5. Register process-level exception/rejection handlers
 *  6. Start the HTTP server
 */

import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import compression from 'compression';

import setupSecurity from './middleware/security.js';
import errorHandler from './middleware/errorHandler.js';
import { setupGracefulShutdown } from './utils/shutdown.js';

// ---------- Logger (fallback to console if Agent 5's logger isn't created yet) ----------
let logger;
try {
  logger = (await import('./utils/logger.js')).default;
} catch {
  logger = console;
}

// ---------- Directory helpers ----------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

// ---------- Configuration ----------
const PORT = parseInt(process.env.PORT, 10) || 3000;
const HOST = process.env.SERVER_HOST || '0.0.0.0';
const NODE_ENV = process.env.NODE_ENV || 'development';

// ---------- Process-level exception handlers ----------
process.on('uncaughtException', (error) => {
  if (typeof logger.error === 'function') {
    logger.error('UNCAUGHT EXCEPTION — shutting down', {
      message: error.message,
      stack: error.stack,
    });
  } else {
    console.error('UNCAUGHT EXCEPTION:', error);
  }
  // Give logger time to flush, then exit.
  setTimeout(() => process.exit(1), 1000);
});

process.on('unhandledRejection', (reason) => {
  if (typeof logger.error === 'function') {
    logger.error('UNHANDLED REJECTION', {
      message: reason instanceof Error ? reason.message : String(reason),
      stack: reason instanceof Error ? reason.stack : undefined,
    });
  } else {
    console.error('UNHANDLED REJECTION:', reason);
  }
});

// ---------- Express app ----------
const app = express();

// Trust first proxy (required for correct req.ip behind load balancers)
app.set('trust proxy', 1);

// Body parsers
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
app.use(compression());

// Security middleware (helmet, cors, rate-limit, mongo-sanitize, CSRF)
setupSecurity(app);

// Serve static frontend assets from public_html/
app.use(express.static(path.join(PROJECT_ROOT, 'public_html')));

// ---------- API routes ----------
// Admin routes (CommonJS module — use createRequire for interop)
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const adminRouter = require('./routes/admin.js');
app.use('/api/admin', adminRouter);

// Health-check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', env: NODE_ENV, timestamp: new Date().toISOString() });
});

// ---------- Global error handler — MUST be last app.use() ----------
app.use(errorHandler);

// ---------- Start server ----------
const server = app.listen(PORT, HOST, () => {
  const msg = `AgroBridge server running on ${HOST}:${PORT} [${NODE_ENV}]`;
  if (typeof logger.info === 'function') {
    logger.info(msg);
  } else {
    console.log(msg);
  }
});

// Graceful shutdown (SIGTERM / SIGINT)
setupGracefulShutdown(server);

export default app;
