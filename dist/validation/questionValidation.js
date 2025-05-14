"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateQuestionSchema = exports.createQuestionSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createQuestionSchema = joi_1.default.object({
    questionText: joi_1.default.string().min(1).required(),
    type: joi_1.default.string().valid("mcq", "textarea").required(),
    choices: joi_1.default.alternatives().conditional("type", {
        is: "mcq",
        then: joi_1.default.array().items(joi_1.default.string().min(1)).min(2).required(),
        otherwise: joi_1.default.forbidden()
    }),
    isRequired: joi_1.default.boolean().optional()
});
exports.updateQuestionSchema = joi_1.default.object({
    questionText: joi_1.default.string().min(1).optional(),
    type: joi_1.default.string().valid("mcq", "textarea").optional(),
    choices: joi_1.default.alternatives().conditional("type", {
        is: "mcq",
        then: joi_1.default.array().items(joi_1.default.string().min(1)).min(2).optional(),
        otherwise: joi_1.default.forbidden()
    }),
    isRequired: joi_1.default.boolean().optional()
});
