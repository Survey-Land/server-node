"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateQuestionSchema = exports.createQuestionSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const questionText = joi_1.default.string()
    .min(1)
    .max(200)
    .required()
    .messages({
    "string.base": "questionText must be a string",
    "string.empty": "questionText is required",
    "string.max": "questionText must be at most 200 characters",
    "any.required": "questionText is required"
});
const mcqChoice = joi_1.default.string()
    .min(1)
    .max(50)
    .messages({
    "string.max": "Each choice must be at most 50 characters"
});
exports.createQuestionSchema = joi_1.default.object({
    questionText,
    type: joi_1.default.string()
        .valid("mcq", "textarea")
        .required()
        .messages({
        "any.only": 'Type must be either "mcq" or "textarea"',
        "any.required": "type is required"
    }),
    choices: joi_1.default.alternatives().conditional("type", {
        is: "mcq",
        then: joi_1.default.array().items(mcqChoice).min(2).required().messages({
            "array.min": "At least two choices are required for MCQ"
        }),
        otherwise: joi_1.default.forbidden()
    }),
    isRequired: joi_1.default.boolean().optional()
});
exports.updateQuestionSchema = joi_1.default.object({
    questionText: joi_1.default.string()
        .min(1)
        .max(200)
        .optional()
        .messages({
        "string.max": "questionText must be at most 200 characters"
    }),
    type: joi_1.default.string()
        .valid("mcq", "textarea")
        .optional()
        .messages({
        "any.only": 'Type must be either "mcq" or "textarea"'
    }),
    choices: joi_1.default.alternatives().conditional("type", {
        is: "mcq",
        then: joi_1.default.array().items(mcqChoice).min(2).optional().messages({
            "array.min": "At least two choices are required for MCQ"
        }),
        otherwise: joi_1.default.forbidden()
    }),
    isRequired: joi_1.default.boolean().optional()
});
