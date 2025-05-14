"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createResponseSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createResponseSchema = joi_1.default.object({
    surveyId: joi_1.default.string()
        .required()
        .regex(/^[0-9a-fA-F]{24}$/) // لأن MongoDB ObjectId طوله 24
        .message("Invalid surveyId format"),
    respondentName: joi_1.default.string().optional(),
    respondentEmail: joi_1.default.string().email().required().messages({
        "string.email": "يجب أن يكون البريد الإلكتروني صالحاً",
        "any.required": "البريد الإلكتروني مطلوب",
    }),
    answers: joi_1.default.object().required().messages({
        "object.base": "Answers must be an object",
        "any.required": "Answers are required",
    }),
});
