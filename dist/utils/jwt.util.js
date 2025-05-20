"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = generateToken;
exports.generateRefetchToken = generateRefetchToken;
exports.verifyRefreshToken = verifyRefreshToken;
// src/utils/jwt.util.ts
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function generateToken(payload) {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined in environment variables");
    }
    return jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, { expiresIn: "30d" });
}
function generateRefetchToken(payload) {
    if (!process.env.REFRESH_TOKEN) {
        throw new Error("REFRESH_TOKEN is not defined in environment variables");
    }
    return jsonwebtoken_1.default.sign(payload, process.env.REFRESH_TOKEN, { expiresIn: "30d" });
}
function verifyRefreshToken(refreshToken) {
    const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.REFRESH_TOKEN);
    return decoded;
}
