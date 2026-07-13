/**
 * Central error handler — human error messages outward, structured logs inward
 * (Vol 3 §7, Vol 6 §10.1).
 */
import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../../shared/errors';
import type { Logger } from '../../shared/logger';

export function createErrorHandler(logger: Logger) {
  return (error: unknown, _req: Request, res: Response, _next: NextFunction): void => {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: { code: error.code, message: error.message } });
      return;
    }
    logger.error('unhandled error', {
      error: error instanceof Error ? error.stack : String(error),
    });
    res.status(500).json({
      error: {
        code: 'INTERNAL',
        message: 'Something went wrong on our side. Please try again in a moment.',
      },
    });
  };
}
