import Joi from "joi";

export const createQuestionSchema = Joi.object({
  questionText: Joi.string().min(1).required(),
  type: Joi.string().valid("mcq", "textarea").required(),
  choices: Joi.alternatives().conditional("type", {
    is: "mcq",
    then: Joi.array().items(Joi.string().min(1)).min(2).required(),
    otherwise: Joi.forbidden()
  }),
  isRequired: Joi.boolean().optional()
});
export const updateQuestionSchema = Joi.object({
    questionText: Joi.string().min(1).optional(),
    type: Joi.string().valid("mcq", "textarea").optional(),
    choices: Joi.alternatives().conditional("type", {
      is: "mcq",
      then: Joi.array().items(Joi.string().min(1)).min(2).optional(),
      otherwise: Joi.forbidden()
    }),
    isRequired: Joi.boolean().optional()
  });
