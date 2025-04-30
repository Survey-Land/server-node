import Joi from 'joi';
import { QuestionType, SurveyStatus } from '../constants/enums';

export const createQuestionSchema = Joi.object({
  qid: Joi.string().required().messages({
    'string.base': 'qid يجب أن يكون نصًا',
    'any.required': 'qid مطلوب',
  }),
  questionText: Joi.string().required().messages({
    'any.required': 'نص السؤال مطلوب',
  }),
  type: Joi.string()
    .valid(...Object.values(QuestionType))
    .optional()
    .messages({
      'any.only': 'نوع السؤال غير صالح',
    }),
  choices: Joi.array().items(Joi.string()).optional(),
  isRequired: Joi.alternatives().try(
    Joi.boolean(), Joi.string().valid('true', 'false')).optional(),
});

export const updateQuestionSchema = Joi.object({
  qid: Joi.string().optional().messages({
    'string.base': 'qid يجب أن يكون نصًا',
  }),
  questionText: Joi.string().optional().messages({
    'string.base': 'نص السؤال يجب أن يكون نصًا',
  }),
  type: Joi.string()
    .valid(...Object.values(QuestionType))
    .optional()
    .messages({
      'any.only': 'نوع السؤال غير صالح',
    }),
  choices: Joi.array().items(Joi.string()).optional(),
  isRequired: Joi.alternatives().try(
    Joi.boolean(), Joi.string().valid('true', 'false')).optional(),
});


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
  questions: Joi.array().items(createQuestionSchema).optional(),
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
  questions: Joi.array().items(updateQuestionSchema).optional(),
});
