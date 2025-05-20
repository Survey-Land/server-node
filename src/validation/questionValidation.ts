import Joi from "joi";

const questionText = Joi.string()
  .min(1)
  .max(200)
  .required()
  .messages({
    "string.base": "questionText must be a string",
    "string.empty": "questionText is required",
    "string.max": "questionText must be at most 200 characters",
    "any.required": "questionText is required"
  });

const mcqChoice = Joi.string()
  .min(1)
  .max(50)
  .messages({
    "string.max": "Each choice must be at most 50 characters"
  });

const singleQuestionSchema = Joi.object({
  questionText,
  type: Joi.string()
    .valid("mcq", "textarea")
    .required(),
  choices: Joi.alternatives().conditional("type", {
    is: "mcq",
    then: Joi.array().items(mcqChoice).min(2).required(),
    otherwise: Joi.forbidden(),
  }),
  isRequired: Joi.boolean().optional(),
});

export const createQuestionSchema = Joi.object({
  questions: Joi.array()
    .items(singleQuestionSchema)
    .min(2)
    .max(20)
    .required()
    .messages({
      "array.base": "Questions should be an array of question objects",
      "array.min": "You must provide at least 2 questions",
      "array.max": "You can provide a maximum of 20 questions",
    }),
});


export const updateQuestionSchema = Joi.object({
  questionText: Joi.string()
    .min(1)
    .max(200)
    .optional()
    .messages({
      "string.max": "questionText must be at most 200 characters"
    }),
  type: Joi.string()
    .valid("mcq", "textarea")
    .optional()
    .messages({
      "any.only": 'Type must be either "mcq" or "textarea"'
    }),
  choices: Joi.alternatives().conditional("type", {
    is: "mcq",
    then: Joi.array().items(mcqChoice).min(2).optional().messages({
      "array.min": "At least two choices are required for MCQ"
    }),
    otherwise: Joi.forbidden()
  }),
  isRequired: Joi.boolean().optional()
});
