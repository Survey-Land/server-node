"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.idSchema = exports.userQuerySchema = void 0;
const baseQueryValidation_1 = require("./baseQueryValidation");
const joi_1 = __importDefault(require("joi"));
exports.userQuerySchema = baseQueryValidation_1.baseQuerySchema.keys({
    email: joi_1.default.alternatives()
        .try(joi_1.default.string(), joi_1.default.object().pattern(joi_1.default.string(), joi_1.default.string()))
        .optional(),
    name: joi_1.default.alternatives()
        .try(joi_1.default.string(), joi_1.default.object().pattern(joi_1.default.string(), joi_1.default.string()))
        .optional(),
    role: joi_1.default.string().valid('VISITOR', 'EDITOR', 'ADMIN').optional(),
    include: joi_1.default.object().pattern(joi_1.default.string(), joi_1.default.any()).optional(),
});
exports.idSchema = joi_1.default.object({
    id: joi_1.default.string().required(),
});
