import { Request, Response, NextFunction } from 'express';

type AppError = Error & {
  statusCode?: number;
  code?: number;
  errors?: Record<string, { message: string }>;
};

export const errorHandler = (err: AppError, req: Request, res: Response, _next: NextFunction): void => {
  console.error('Error:', err.message);

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors ?? {}).map((e) => e.message);
    res.status(400).json({ success: false, error: messages.join(', ') });
    return;
  }

  if (err.name === 'CastError') {
    res.status(400).json({ success: false, error: 'Invalid ID format' });
    return;
  }

  if (err.code === 11000) {
    res.status(409).json({ success: false, error: 'Duplicate entry' });
    return;
  }

  const statusCode = err.statusCode ?? 500;
  const message = statusCode === 500 ? 'Internal server error' : err.message;

  res.status(statusCode).json({ success: false, error: message });
};
