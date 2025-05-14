"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const logger_1 = __importDefault(require("../lib/logger"));
const errorHandler = (err, req, res, next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || 'خطا في الخادم';
    logger_1.default.error(`${req.method} ${req.url} - ${status} - ${message}`);
    if (process.env.NODE_ENV === 'development') {
        res.status(status).json({
            status,
            message,
            stack: err.stack,
        });
    }
    else {
        res.status(status).json({
            status,
            message,
        });
    }
};
exports.errorHandler = errorHandler;
