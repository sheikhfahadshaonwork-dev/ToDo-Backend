import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import logger from '../config/logger';

interface AppError extends Error {
  statusCode?: number;
  status?: string;
  code?: number;
  keyValue?: Record<string, unknown>;
  errors?: Record<string, mongoose.Error.ValidatorError | mongoose.Error.CastError>;
}

export function errorMiddleware(
  err: AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  logger.error('Unhandled error', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });

  // Mongoose validation error
  if (err instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(err.errors).map((e) => e.message);
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
    return;
  }

  // Mongoose CastError – invalid ObjectId or field type mismatch
  if (err instanceof mongoose.Error.CastError) {
    res.status(400).json({
      success: false,
      message: `Invalid value for field '${err.path}': ${err.value}`,
    });
    return;
  }

  // MongoDB duplicate key error (e.g. unique constraint violation)
  if (err.code === 11000 && err.keyValue) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    res.status(409).json({
      success: false,
      message: `Duplicate value: '${value}' already exists for field '${field}'`,
    });
    return;
  }

  // Known HTTP errors (set by controllers)
  const statusCode = err.statusCode ?? 500;
  const message =
    statusCode === 500 && process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : (err.message ?? 'Internal server error');

  res.status(statusCode).json({
    success: false,
    message,
  });
}
