import Joi from 'joi';

export const registerSchema = Joi.object({
  email: Joi.string()
  .required()
  .messages({
    'string.email': 'يجب أن يكون البريد الإلكتروني صالحاً',
    'any.required': 'البريد الإلكتروني مطلوب'
  }),
  password: Joi.string().min(8).optional(),
  name: Joi.string().optional(),
  specialization: Joi.string().optional(),
  mobile: Joi.string().optional(),
  address: Joi.string().optional(),
  image: Joi.string().optional(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

export const adminLoginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'يجب أن يكون البريد الإلكتروني صالحاً',
    'any.required': 'البريد الإلكتروني مطلوب'
  }),
  password: Joi.string().required().messages({
    'any.required': 'كلمة المرور مطلوبة'
  })
});

export const adminCreateSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  name: Joi.string().required(),
  role: Joi.string().valid('admin').required()
});

export const favoriteSchema = Joi.object({
  productId: Joi.number().integer().required()
});