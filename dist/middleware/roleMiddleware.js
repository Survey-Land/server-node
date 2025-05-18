"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEditor = exports.isAdmin = void 0;
const i18n_1 = __importDefault(require("../config/i18n"));
const client_1 = require("@prisma/client");
const isAdmin = async (req, res, next) => {
    if (!req.user) {
        res.status(401).json({ message: i18n_1.default.__("Unauthorized: No user found") });
        return;
    }
    const user = req.user;
    if (!user.isAdmin) {
        res.status(403).json({ message: i18n_1.default.__("Forbidden: Admin access required") });
        return;
    }
    next();
};
exports.isAdmin = isAdmin;
const isEditor = async (req, res, next) => {
    if (!req.user) {
        res.status(401).json({ message: i18n_1.default.__("Unauthorized: No user found") });
        return;
    }
    const user = req.user;
    if (user.role !== client_1.UserRole.EDITOR && !user.isAdmin) {
        res.status(403).json({ message: i18n_1.default.__("Forbidden: Editor access required") });
        return;
    }
    next();
};
exports.isEditor = isEditor;
