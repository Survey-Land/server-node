"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlePrismaError = handlePrismaError;
const client_1 = require("@prisma/client");
const custom_error_1 = require("./custom-error");
const i18n_1 = __importDefault(require("../config/i18n"));
function handlePrismaError(error, modelLabel = i18n_1.default.__('Record')) {
    if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
            case 'P2002':
                throw new custom_error_1.CustomError(i18n_1.default.__('Unique constraint failed, data already exists'), 409);
            case 'P2025':
                throw new custom_error_1.CustomError(i18n_1.default.__('%s not found', modelLabel), 404);
            default:
                throw new custom_error_1.CustomError(i18n_1.default.__('Database error: %s', error.code), 500);
        }
    }
    if (error instanceof client_1.Prisma.PrismaClientValidationError) {
        throw new custom_error_1.CustomError(i18n_1.default.__('Data validation error'), 400);
    }
    throw new custom_error_1.CustomError(i18n_1.default.__('Database connection error'), 500);
}
