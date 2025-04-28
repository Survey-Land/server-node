import { Request, Response, NextFunction } from 'express';
import createError from 'http-errors';

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  next(createError(404, 'الصفحة غير موجودة'));
};
