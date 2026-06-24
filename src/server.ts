import 'dotenv/config';
import http from 'http';
import app from './app';
import { connectDatabase } from './config/database';
import logger from './config/logger';

const PORT = parseInt(process.env.PORT ?? '4002', 10);

async function start(): Promise<void> {
  try {
    await connectDatabase();

    const server = http.createServer(app);

    server.listen(PORT, () => {
      logger.info(`Server started`, {
        port: PORT,
        environment: process.env.NODE_ENV ?? 'development',
        pid: process.pid,
      });
    });

    // ─── Graceful shutdown ─────────────────────────────────────────────────────
    const shutdown = (signal: string) => {
      logger.info(`Received ${signal}. Starting graceful shutdown…`);
      server.close((err) => {
        if (err) {
          logger.error('Error closing HTTP server', { error: err });
          process.exit(1);
        }
        logger.info('HTTP server closed');
        process.exit(0);
      });

      // Force-exit if not done within 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown due to timeout');
        process.exit(1);
      }, 10_000).unref();
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    process.on('uncaughtException', (error) => {
      logger.error('Uncaught exception', { error });
      shutdown('uncaughtException');
    });

    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled promise rejection', { reason });
      shutdown('unhandledRejection');
    });
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
}

start();
