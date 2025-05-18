"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const notFoundHandler = (req, res, next) => {
    if (req.path === "/" || req.originalUrl === "/") {
        res.status(200).json({
            status: 200,
            message: "Backend Server is Running 🚀",
        });
        return;
    }
    next((0, http_errors_1.default)(404, "الصفحة غير موجودة"));
};
exports.notFoundHandler = notFoundHandler;
