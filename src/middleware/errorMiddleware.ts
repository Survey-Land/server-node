import { Request, Response, NextFunction } from 'express';
import { HttpError } from 'http-errors';
import logger from '../lib/logger';

export const errorHandler = (err: HttpError, req: Request, res: Response, next: NextFunction) => {
  const status = err.status || (err as any).statusCode || 500;
  const message = err.message || 'خطا في الخادم';

  logger.error(`${req.method} ${req.url} - ${status} - ${message}`);

  if (process.env.NODE_ENV === 'development') {
    res.status(status).json({
      status,
      message,
      stack: err.stack,
    });
  } else {
    res.status(status).json({
      status,
      message,
    });
  }
};
