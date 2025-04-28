import Joi from 'joi';

export const baseQuerySchema = Joi.object({
  page: Joi.number().integer().min(1),
  pageSize: Joi.number().integer().min(1),
  orderBy: Joi.string(),
  include: Joi.string(),
  
});
