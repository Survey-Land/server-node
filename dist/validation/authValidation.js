"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.favoriteSchema = exports.adminCreateSchema = exports.adminLoginSchema = exports.loginSchema = exports.registerSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.registerSchema = joi_1.default.object({
    email: joi_1.default.string()
        .required()
        .messages({
        'string.email': 'يجب أن يكون البريد الإلكتروني صالحاً',
        'any.required': 'البريد الإلكتروني مطلوب'
    }),
    password: joi_1.default.string().min(8).max(14).pattern(new RegExp(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,14}$/)).message("كلمة المرور يجب أن تتكون من 8 إلى 14 حرفًا، وتحتوي على حروف وأرقام").optional(),
    name: joi_1.default.string().optional(),
    specialization: joi_1.default.string().optional(),
    mobile: joi_1.default.string().optional(),
    address: joi_1.default.string().optional(),
    image: joi_1.default.string().optional(),
});
exports.loginSchema = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().required()
});
exports.adminLoginSchema = joi_1.default.object({
    email: joi_1.default.string().email().required().messages({
        'string.email': 'يجب أن يكون البريد الإلكتروني صالحاً',
        'any.required': 'البريد الإلكتروني مطلوب'
    }),
    password: joi_1.default.string()
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
exports.adminCreateSchema = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().min(8).max(14).pattern(new RegExp(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,14}$/)).message("كلمة المرور يجب أن تتكون من 8 إلى 14 حرفًا، وتحتوي على حروف وأرقام").required(),
    name: joi_1.default.string().required(),
    role: joi_1.default.string().valid('admin').required()
});
exports.favoriteSchema = joi_1.default.object({
    productId: joi_1.default.number().integer().required()
});
