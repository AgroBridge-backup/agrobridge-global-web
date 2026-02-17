/**
 * AgroBridge Global — Main Express application entry point.
 */

import 'dotenv/config';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { randomUUID } from 'crypto';
import express from 'express';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { config, validateConfig } from './config/index.js';
import errorHandler from './middleware/errorHandler.js';
import createObservabilityMiddleware from './middleware/observability.js';
import setupSecurity from './middleware/security.js';
import adminRouter from './routes/admin.js';
import { setupGracefulShutdown } from './utils/shutdown.js';

let logger;
try {
  logger = (await import('./utils/logger.js')).default;
} catch {
  logger = console;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

const requestIdMiddleware = (req, res, next) => {
  req.id = req.headers['x-request-id'] || randomUUID();
  res.setHeader('X-Request-ID', req.id);
  next();
};

const createApp = () => {
  const app = express();
  const observability = createObservabilityMiddleware({
    metricsBearerToken: config.observability.metricsBearerToken,
  });

  app.set('trust proxy', config.server.trustProxy);

  app.use(requestIdMiddleware);
  if (config.observability.enabled) {
    app.use(observability.middleware);
  }
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));
  app.use(cookieParser());
  app.use(compression());

  setupSecurity(app);

  app.use(express.static(path.join(PROJECT_ROOT, 'public_html')));

  app.use('/api/admin', adminRouter);

  app.get('/health', (_req, res) => {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || config.app.version || '2.0.0',
    });
  });

  if (config.app.env === 'test' || process.env.ENABLE_TEST_ENDPOINTS === 'true') {
    app.post('/api/test/csrf-protected', (req, res) => {
      res.status(200).json({
        success: true,
        message: 'CSRF validation passed',
        requestId: req.id,
      });
    });
  }

  if (config.observability.metricsEnabled) {
    app.get(
      config.observability.metricsPath,
      observability.metricsAuthMiddleware,
      observability.metricsHandler
    );
  }

  app.use(errorHandler);
  return app;
};

const connectDatabase = async () => {
  let mongoose;
  try {
    mongoose = (await import('mongoose')).default;
    await mongoose.connect(config.database.uri, config.database.options);
    logger.info?.('MongoDB connected');

    try {
      const { synchronizeLeadIndexes } = await import('./models/Lead.js');
      await synchronizeLeadIndexes({ mode: config.database.indexMode, logger });
    } catch (error) {
      logger.error?.('Lead index initialization failed', {
        message: error.message,
        mode: config.database.indexMode,
      });

      if (config.database.requireIndexes) {
        throw error;
      }
    }
  } catch (error) {
    logger.error?.('MongoDB connection failed', { message: error.message });
    if (config.database.required || config.app.env === 'production') {
      throw error;
    }

    if (mongoose?.connection?.readyState === 1) {
      await mongoose.connection.close();
    }
  }
};

const startServer = async (appInstance) => {
  validateConfig();
  await connectDatabase();

  const app = appInstance || createApp();
  const server = app.listen(config.server.port, config.server.host, () => {
    logger.info?.(`AgroBridge server running on ${config.server.host}:${config.server.port} [${config.app.env}]`);
  });

  if (Number.isFinite(config.server.timeout) && config.server.timeout > 0) {
    server.setTimeout(config.server.timeout);
  }

  if (config.server.keepAlive === false) {
    server.keepAliveTimeout = 0;
  }

  setupGracefulShutdown(server);
  return { app, server };
};

const isExecutedDirectly = (() => {
  if (!process.argv[1]) {
    return false;
  }
  return import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
})();

if (isExecutedDirectly) {
  startServer().catch((error) => {
    logger.error?.('Failed to start server', { message: error.message, stack: error.stack });
    process.exit(1);
  });
}

export {
  createApp,
  startServer,
};

export default createApp;
