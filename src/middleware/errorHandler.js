/**
 * Global Express error handler middleware.
 *
 * MUST be registered as the LAST app.use() so that errors thrown or
 * forwarded by upstream middleware/routes are caught here.
 *
 * - Logs full details server-side (including stack in non-production).
 * - Returns a JSON response with sanitised info in production (no stack leak).
 */

// Logger may be created by another agent; fall back to console gracefully.
let logger;
try {
  logger = (await import('../utils/logger.js')).default;
} catch {
  logger = console;
}

const isProduction = () => process.env.NODE_ENV === 'production';

/**
 * Express error-handling middleware (4-argument signature is required).
 */
const errorHandler = (err, req, res, _next) => {
  const statusCode = err.statusCode || err.status || 500;
  const prod = isProduction();

  const logPayload = {
    message: err.message,
    statusCode,
    path: req.path,
    method: req.method,
    ip: req.ip,
    ...(prod ? {} : { stack: err.stack }),
  };

  if (typeof logger.error === 'function') {
    logger.error('Unhandled error', logPayload);
  } else {
    console.error('Unhandled error', logPayload);
  }

  // Prevent sending after headers are already flushed.
  if (res.headersSent) {
    return;
  }

  res.status(statusCode).json({
    success: false,
    message: prod ? 'An unexpected error occurred' : err.message,
    ...(prod ? {} : { stack: err.stack }),
  });
};

export default errorHandler;
