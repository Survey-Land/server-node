"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.baseQuerySchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.baseQuerySchema = joi_1.default.object({
    page: joi_1.default.number().integer().min(1),
    pageSize: joi_1.default.number().integer().min(1),
    orderBy: joi_1.default.string(),
    include: joi_1.default.string(),
});
