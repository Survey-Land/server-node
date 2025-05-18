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
  password: Joi.string().pattern(new RegExp(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,14}$/)).message("كلمة المرور يجب أن تتكون من 8 إلى 14 حرفًا، وتحتوي على حروف وأرقام").required()
});


export const adminCreateSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'يجب أن يكون البريد الإلكتروني صالحاً',
      'any.required': 'البريد الإلكتروني مطلوب'
    }),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    .required()
    .messages({
      'string.min': 'يجب أن تكون كلمة المرور 8 أحرف على الأقل',
      'string.pattern.base': 'يجب أن تحتوي كلمة المرور على حرف كبير وحرف صغير ورقم ورمز خاص',
      'any.required': 'كلمة المرور مطلوبة'
    }),
  name: Joi.string()
    .min(3)
    .required()
    .messages({
      'string.min': 'يجب أن يكون الاسم 3 أحرف على الأقل',
      'any.required': 'الاسم مطلوب'
    })
});

export const updateRoleSchema = Joi.object({
  role: Joi.string()
    .valid('ADMIN', 'EDITOR', 'USER')
    .required()
    .messages({
      'any.only': 'الدور يجب أن يكون ADMIN أو EDITOR أو USER',
      'any.required': 'الدور مطلوب'
    })
});

export const favoriteSchema = Joi.object({
  productId: Joi.number().integer().required()
});