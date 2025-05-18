"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSurveySchema = exports.createSurveySchema = void 0;
const joi_1 = __importDefault(require("joi"));
const enums_1 = require("../constants/enums");
exports.createSurveySchema = joi_1.default.object({
    title: joi_1.default.string().required().messages({
        'string.base': 'العنوان يجب أن يكون نصًا',
        'any.required': 'العنوان مطلوب',
    }),
    description: joi_1.default.string().optional(),
    deadline: joi_1.default.date().optional().messages({
        'date.base': 'صيغة التاريخ غير صحيحة',
    }),
    cover: joi_1.default.string().optional(),
    status: joi_1.default.string()
        .valid(...Object.values(enums_1.SurveyStatus))
        .optional()
        .messages({
        'any.only': 'حالة الاستبيان غير صحيحة',
    }),
    image: joi_1.default.string().optional(),
});
exports.updateSurveySchema = joi_1.default.object({
    title: joi_1.default.string().optional().messages({
        'string.base': 'العنوان يجب أن يكون نصًا',
    }),
    description: joi_1.default.string().optional(),
    deadline: joi_1.default.date().optional().messages({
        'date.base': 'صيغة التاريخ غير صحيحة',
    }),
    cover: joi_1.default.string().optional(),
    status: joi_1.default.string()
        .valid(...Object.values(enums_1.SurveyStatus))
        .optional()
        .messages({
        'any.only': 'حالة الاستبيان غير صحيحة',
    }),
    image: joi_1.default.string().optional(),
});
