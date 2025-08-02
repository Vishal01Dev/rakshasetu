import { Request, Response, NextFunction } from 'express';
import { AppError } from './AppError';
import { ZodError } from 'zod';

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal Server Error';

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof ZodError) {
    statusCode = 400;
    message = err.errors?.[0]?.message || 'Validation error';
  } else if (err instanceof Error) {
    message = err.message;
  }

  console.error(`[ERROR] ${req.method} ${req.url} →`, err);

  res.status(statusCode).json({
    success: false,
    message,
    statusCode,
  });
};
