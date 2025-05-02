import { Request, Response, NextFunction } from 'express';
import createError from 'http-errors';

export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.path === '/' || req.originalUrl === '/') {
    return res.status(200).json({
      status: 200,
      message: 'Backend Server is Running 🚀'
    });
  }

  next(createError(404, 'الصفحة غير موجودة'));
};
