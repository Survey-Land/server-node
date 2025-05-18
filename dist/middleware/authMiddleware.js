"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSuperAdmin = exports.isAdmin = exports.authenticateJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const dotenv_1 = __importDefault(require("dotenv"));
const i18n_1 = __importDefault(require("../config/i18n"));
dotenv_1.default.config();
const authenticateJWT = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            const user = await prisma_1.default.user.findUnique({
                where: { id: decoded.id },
            });
            if (user) {
                req.user = user;
                next();
            }
            else {
                res.status(401).json({ message: i18n_1.default.__('User not found') });
            }
        }
        catch (error) {
            res.status(401).json({ message: i18n_1.default.__('Invalid token') });
        }
    }
    else {
        res.status(401).json({ message: i18n_1.default.__('No token provided') });
    }
};
exports.authenticateJWT = authenticateJWT;
const isAdmin = (req, res, next) => {
    const user = req.user;
    if (user && (user.role === 'admin' || user.role === 'superAdmin')) {
        next();
    }
    else {
        res.status(403).json({ message: i18n_1.default.__('Access denied: Admin permission required') });
    }
};
exports.isAdmin = isAdmin;
const isSuperAdmin = (req, res, next) => {
    const user = req.user;
    if (user && user.role === 'superAdmin') {
        next();
    }
    else {
        res.status(403).json({ message: i18n_1.default.__('Access denied: SuperAdmin permission required') });
    }
};
exports.isSuperAdmin = isSuperAdmin;
