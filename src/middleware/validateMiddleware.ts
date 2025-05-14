// src/middleware/validate.middleware.ts

import { Request, Response, NextFunction } from 'express';
import { ObjectSchema } from 'joi';
import createError from 'http-errors';

export const validate = (
  schema: ObjectSchema,
  property: 'body' | 'params' | 'query' = 'body'
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.validateAsync(req[property], { abortEarly: false });
      next();
    } catch (error: any) {
      const errors = error.details.map((detail: any) => detail.message);
      next(createError(400, errors.join(', ')));
    }
  };
};
