import Joi from 'joi';

export const registerSchema = Joi.object({
  email: Joi.string()
  .required()
  .messages({
    'string.email': 'يجب أن يكون البريد الإلكتروني صالحاً',
    'any.required': 'البريد الإلكتروني مطلوب'
  }),
  password: Joi.string().min(8).max(14).pattern(new RegExp(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,14}$/)).message("كلمة المرور يجب أن تتكون من 8 إلى 14 حرفًا، وتحتوي على حروف وأرقام").optional(),
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
 password: Joi.string()
  .min(8)
  .max(14)
  .pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,14}$/)
  .required()
  .messages({
    'string.pattern.base': 'كلمة المرور يجب أن تتكون من 8 إلى 14 حرفًا، وتحتوي على حروف وأرقام',
    'string.min': 'كلمة المرور يجب ألا تقل عن 8 أحرف',
    'string.max': 'كلمة المرور يجب ألا تزيد عن 14 حرفًا',
    'any.required': 'كلمة المرور مطلوبة'
  })
});

export const adminCreateSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(14).pattern(new RegExp(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,14}$/)).message("كلمة المرور يجب أن تتكون من 8 إلى 14 حرفًا، وتحتوي على حروف وأرقام").required(),
  name: Joi.string().required(),
  role: Joi.string().valid('admin').required()
});

export const favoriteSchema = Joi.object({
  productId: Joi.number().integer().required()
});