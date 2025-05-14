"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.favoriteSchema = exports.loginSchema = exports.registerSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.registerSchema = joi_1.default.object({
    email: joi_1.default.string()
        .required()
        .messages({
        'string.email': 'يجب أن يكون البريد الإلكتروني صالحاً',
        'any.required': 'البريد الإلكتروني مطلوب'
    }),
    password: joi_1.default.string().min(8).optional(),
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
exports.favoriteSchema = joi_1.default.object({
    productId: joi_1.default.number().integer().required()
});
