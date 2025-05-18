"use strict";
// src/middleware/validate.middleware.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const validate = (schema, property = 'body') => {
    return async (req, res, next) => {
        try {
            await schema.validateAsync(req[property], { abortEarly: false });
            next();
        }
        catch (error) {
            const errors = error.details.map((detail) => detail.message);
            next((0, http_errors_1.default)(400, errors.join(', ')));
        }
    };
};
exports.validate = validate;
