import Joi from "joi";

export const createResponseSchema = Joi.object({
  surveyId: Joi.string()
    .required()
    .regex(/^[0-9a-fA-F]{24}$/) // لأن MongoDB ObjectId طوله 24
    .message("Invalid surveyId format"),

  respondentName: Joi.string().optional(),

  respondentEmail: Joi.string().email().required().messages({
    "string.email": "يجب أن يكون البريد الإلكتروني صالحاً",
    "any.required": "البريد الإلكتروني مطلوب",
  }),

  answers: Joi.object().required().messages({
    "object.base": "Answers must be an object",
    "any.required": "Answers are required",
  }),
});
