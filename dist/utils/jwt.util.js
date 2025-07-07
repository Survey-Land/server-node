"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRefresh = exports.signRefresh = exports.signAccess = void 0;
// utils/jwt.ts
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const signAccess = (payload) => jsonwebtoken_1.default.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: "2d" });
exports.signAccess = signAccess;
const signRefresh = (payload) => jsonwebtoken_1.default.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
exports.signRefresh = signRefresh;
const verifyRefresh = (token) => jsonwebtoken_1.default.verify(token, process.env.JWT_REFRESH_SECRET);
exports.verifyRefresh = verifyRefresh;
