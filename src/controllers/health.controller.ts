import { Request, Response } from 'express';

export function getHealth(req: Request, res: Response): void {
  res.status(200).json({
    success: true,
    status: 'ok',
    environment: process.env.NODE_ENV ?? 'development',
    timestamp: new Date(),
  });
}
