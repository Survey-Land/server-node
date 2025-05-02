import Joi from 'joi';
import {  SurveyStatus } from '../constants/enums';


export const createSurveySchema = Joi.object({
  userId: Joi.string().required().messages({
    'string.base': 'userId يجب أن يكون نصًا',
    'any.required': 'userId مطلوب',
  }),
  title: Joi.string().required().messages({
    'string.base': 'العنوان يجب أن يكون نصًا',
    'any.required': 'العنوان مطلوب',
  }),
  description: Joi.string().optional(),
  deadline: Joi.date().optional().messages({
    'date.base': 'صيغة التاريخ غير صحيحة',
  }),
  cover: Joi.string().optional(),
  status: Joi.string()
    .valid(...Object.values(SurveyStatus))
    .optional()
    .messages({
      'any.only': 'حالة الاستبيان غير صحيحة',
    }),
});

export const updateSurveySchema = Joi.object({
  title: Joi.string().optional().messages({
    'string.base': 'العنوان يجب أن يكون نصًا',
  }),
  description: Joi.string().optional(),
  deadline: Joi.date().optional().messages({
    'date.base': 'صيغة التاريخ غير صحيحة',
  }),
  cover: Joi.string().optional(),
  status: Joi.string()
    .valid(...Object.values(SurveyStatus))
    .optional()
    .messages({
      'any.only': 'حالة الاستبيان غير صحيحة',
    }),
});
