import mongoose from 'mongoose';
import logger from './logger';

export async function connectDatabase(): Promise<void> {
  const uri = process.env.DATABASE_URL;

  if (!uri) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10_000,
      socketTimeoutMS: 45_000,
    });

    logger.info('MongoDB connected successfully', {
      host: mongoose.connection.host,
      name: mongoose.connection.name,
    });
  } catch (error) {
    logger.error('MongoDB connection failed', { error });
    throw error;
  }

  mongoose.connection.on('error', (error) => {
    logger.error('MongoDB connection error', { error });
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
  });

  mongoose.connection.on('reconnected', () => {
    logger.info('MongoDB reconnected');
  });
}
