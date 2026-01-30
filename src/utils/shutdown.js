import logger from './logger.js';

class GracefulShutdown {
  constructor(server) {
    this.server = server;
    this.connections = new Set();
    this.isShuttingDown = false;
    this.shutdownTimeout = 30000;
    
    this.trackConnections();
  }

  trackConnections() {
    if (!this.server) return;

    this.server.on('connection', (connection) => {
      this.connections.add(connection);
      
      connection.on('close', () => {
        this.connections.delete(connection);
      });
    });
  }

  async shutdown(signal) {
    if (this.isShuttingDown) {
      logger.warn('Shutdown already in progress, ignoring signal:', signal);
      return;
    }

    this.isShuttingDown = true;
    logger.info(`Received ${signal}. Starting graceful shutdown...`);

    const forceExit = setTimeout(() => {
      logger.error(`Shutdown timeout (${this.shutdownTimeout}ms) exceeded. Forcing exit.`);
      process.exit(1);
    }, this.shutdownTimeout);

    try {
      logger.info('Stopping server from accepting new connections...');
      await this.closeServer();

      logger.info('Closing active connections...');
      await this.closeConnections();

      logger.info('Closing database connections...');
      await this.closeDatabaseConnections();

      logger.info('Closing Redis connections...');
      await this.closeRedisConnections();

      clearTimeout(forceExit);
      logger.info('Graceful shutdown completed successfully.');
      process.exit(0);
    } catch (error) {
      clearTimeout(forceExit);
      logger.error('Error during graceful shutdown:', error);
      process.exit(1);
    }
  }

  closeServer() {
    return new Promise((resolve) => {
      if (!this.server) {
        resolve();
        return;
      }

      this.server.close(() => {
        logger.info('Server closed successfully.');
        resolve();
      });
    });
  }

  closeConnections() {
    return new Promise((resolve) => {
      const promises = [];
      
      for (const connection of this.connections) {
        promises.push(
          new Promise((resolveClose) => {
            connection.end(() => {
              this.connections.delete(connection);
              resolveClose();
            });
            
            setTimeout(() => {
              connection.destroy();
              this.connections.delete(connection);
              resolveClose();
            }, 5000);
          })
        );
      }

      Promise.all(promises).then(() => {
        logger.info(`Closed ${promises.length} active connections.`);
        resolve();
      });
    });
  }

  async closeDatabaseConnections() {
    try {
      const mongoose = await import('mongoose').catch(() => null);
      
      if (mongoose && mongoose.connection && mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
        logger.info('Mongoose connection closed successfully.');
      }
    } catch (error) {
      logger.error('Error closing database connections:', error);
    }
  }

  async closeRedisConnections() {
    try {
      const redis = await import('redis').catch(() => null);
      
      if (redis && global.redisClient) {
        await global.redisClient.quit();
        logger.info('Redis connection closed successfully.');
      }
    } catch (error) {
      logger.error('Error closing Redis connections:', error);
    }
  }
}

let shutdownInstance = null;

export function setupGracefulShutdown(server) {
  if (shutdownInstance) {
    logger.warn('Graceful shutdown handlers already set up. Skipping duplicate setup.');
    return shutdownInstance;
  }

  shutdownInstance = new GracefulShutdown(server);

  const signals = ['SIGTERM', 'SIGINT'];
  
  signals.forEach((signal) => {
    process.on(signal, () => {
      shutdownInstance.shutdown(signal);
    });
  });

  process.on('exit', (code) => {
    logger.info(`Process exiting with code: ${code}`);
  });

  logger.info('Graceful shutdown handlers registered for SIGTERM and SIGINT');
  
  return shutdownInstance;
}

export { GracefulShutdown };
export default GracefulShutdown;
