import { baseQuerySchema } from './baseQueryValidation';
import Joi from 'joi';

export const userQuerySchema = baseQuerySchema.keys({
  email: Joi.alternatives()
    .try(Joi.string(), Joi.object().pattern(Joi.string(), Joi.string()))
    .optional(),
  name: Joi.alternatives()
    .try(Joi.string(), Joi.object().pattern(Joi.string(), Joi.string()))
    .optional(),
  role: Joi.string().valid('VISITOR', 'EDITOR', 'ADMIN').optional(),
  include: Joi.object().pattern(Joi.string(), Joi.any()).optional(),
});

export const idSchema = Joi.object({
  id: Joi.string().required(),
});