"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.favoriteSchema = exports.updateRoleSchema = exports.adminCreateSchema = exports.loginSchema = exports.registerSchema = void 0;
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
exports.adminCreateSchema = joi_1.default.object({
    email: joi_1.default.string()
        .email()
        .required()
        .messages({
        'string.email': 'يجب أن يكون البريد الإلكتروني صالحاً',
        'any.required': 'البريد الإلكتروني مطلوب'
    }),
    password: joi_1.default.string()
        .min(8)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
        .required()
        .messages({
        'string.min': 'يجب أن تكون كلمة المرور 8 أحرف على الأقل',
        'string.pattern.base': 'يجب أن تحتوي كلمة المرور على حرف كبير وحرف صغير ورقم ورمز خاص',
        'any.required': 'كلمة المرور مطلوبة'
    }),
    name: joi_1.default.string()
        .min(3)
        .required()
        .messages({
        'string.min': 'يجب أن يكون الاسم 3 أحرف على الأقل',
        'any.required': 'الاسم مطلوب'
    })
});
exports.updateRoleSchema = joi_1.default.object({
    role: joi_1.default.string()
        .valid('ADMIN', 'EDITOR', 'USER')
        .required()
        .messages({
        'any.only': 'الدور يجب أن يكون ADMIN أو EDITOR أو USER',
        'any.required': 'الدور مطلوب'
    })
});
exports.favoriteSchema = joi_1.default.object({
    productId: joi_1.default.number().integer().required()
});
