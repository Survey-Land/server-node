"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const authenticateJWT = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_ACCESS_SECRET);
            const user = await prisma_1.default.user.findUnique({
                where: { id: decoded.id },
            });
            if (user) {
                req.user = user;
                next();
            }
            else {
                res.status(401).json({ message: 'غير مصرح: المستخدم غير موجود' });
            }
        }
        catch (error) {
            res.status(401).json({ message: 'غير مصرح: رمز دخول غير صالح' });
        }
    }
    else {
        res.status(401).json({ message: 'غير مصرح: لم يتم تقديم رمز دخول' });
    }
};
exports.authenticateJWT = authenticateJWT;
