"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
// src/services/authService.ts
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const custom_error_1 = require("../utils/custom-error");
const prisma_error_1 = require("../utils/prisma-error");
const query_parser_1 = require("../utils/query-parser");
const i18n_1 = __importDefault(require("../config/i18n"));
const otp_generation_1 = require("../utils/otp-generation");
const emailService_1 = require("../lib/emailService");
const logger_1 = __importDefault(require("../lib/logger"));
class AuthService {
    async findAll(query, lang) {
        i18n_1.default.setLocale(lang);
        try {
            let { page, pageSize, include, orderBy, ...filters } = query;
            if (include)
                include = (0, query_parser_1.parseInclude)(include);
            if (orderBy)
                orderBy = (0, query_parser_1.parseInclude)(orderBy);
            filters = (0, query_parser_1.processFilters)(filters);
            const options = { where: filters, include, orderBy };
            if (page && pageSize) {
                const skip = (+page - 1) * +pageSize;
                const take = +pageSize;
                const [data, total] = await Promise.all([
                    prisma_1.default.user.findMany({ ...options, skip, take }),
                    prisma_1.default.user.count({ where: filters }),
                ]);
                return { data, total, page: +page, pageSize: +pageSize };
            }
            return prisma_1.default.user.findMany(options);
        }
        catch (e) {
            (0, prisma_error_1.handlePrismaError)(e, i18n_1.default.__("User"));
        }
    }
    async login(email, password, lang) {
        i18n_1.default.setLocale(lang);
        const user = await prisma_1.default.user.findUnique({ where: { email } });
        if (!user || !user.password) {
            throw new custom_error_1.CustomError(i18n_1.default.__("Incorrect email or password"), 400);
        }
        const now = new Date();
        if (user.lockUntil && user.lockUntil > now) {
            throw new custom_error_1.CustomError(i18n_1.default.__("Account temporarily locked. Try again later."), 423);
        }
        const passwordCorrect = await bcrypt_1.default.compare(password, user.password);
        if (!passwordCorrect) {
            const failedAttempts = user.failedLoginAttempts += 1;
            let lockUntil = null;
            await prisma_1.default.user.update({
                where: { email },
                data: {
                    failedLoginAttempts: failedAttempts,
                },
            });
            if (failedAttempts === 3) {
                lockUntil = new Date(Date.now() + 30 * 1000);
                throw new custom_error_1.CustomError(i18n_1.default.__("Account temporarily locked. Try again in 30 seconds."), 423);
            }
            else if (failedAttempts > 3) {
                lockUntil = new Date(Date.now() + 15 * 60 * 1000);
                await (0, emailService_1.sendOtpEmail)(email, i18n_1.default.__("OTP resent to your email"), (0, otp_generation_1.generateOtp)(), i18n_1.default.__("valid for %s minutes", ("5")));
                throw new custom_error_1.CustomError(i18n_1.default.__("Account temporarily locked. Check your email for OTP."), 423);
            }
            await prisma_1.default.user.update({
                where: { email },
                data: {
                    failedLoginAttempts: failedAttempts,
                    lockUntil,
                },
            });
            throw new custom_error_1.CustomError(i18n_1.default.__("Incorrect email or password"), 400);
        }
        // Reset failed attempts and lock
        await prisma_1.default.user.update({
            where: { email },
            data: {
                failedLoginAttempts: 0,
                lockUntil: null,
            },
        });
        // Generate and send OTP after successful login
        const otpPlain = (0, otp_generation_1.generateOtp)();
        const otpHash = await (0, otp_generation_1.hashOtp)(otpPlain);
        await prisma_1.default.oTP.upsert({
            where: { email },
            update: { otpHash, expiresAt: (0, otp_generation_1.getExpiry)(5) },
            create: { email, otpHash, expiresAt: (0, otp_generation_1.getExpiry)(5) },
        });
        try {
            await (0, emailService_1.sendOtpEmail)(email, i18n_1.default.__("Login Verification OTP"), otpPlain, i18n_1.default.__("valid for %s minutes", "5"));
            return { user, mailSent: true };
        }
        catch (err) {
            logger_1.default.error("OTP email failed", { email, err: err.message });
            return { user, mailSent: false };
        }
    }
    async registerInit({ email, password, name, }, lang) {
        i18n_1.default.setLocale(lang);
        const hashedPw = await bcrypt_1.default.hash(password, 10);
        const otpPlain = (0, otp_generation_1.generateOtp)();
        const otpHash = await (0, otp_generation_1.hashOtp)(otpPlain);
        const existing = await prisma_1.default.user.findUnique({ where: { email } });
        if (existing?.isEmailVerified)
            throw new Error(i18n_1.default.__("Email already in use"));
        const user = existing ??
            (await prisma_1.default.user.create({
                data: {
                    email,
                    name,
                    password: hashedPw,
                    provider: "local",
                    role: "USER",
                    isEmailVerified: false,
                },
            }));
        await prisma_1.default.oTP.upsert({
            where: { email },
            update: { otpHash, expiresAt: (0, otp_generation_1.getExpiry)(5) },
            create: { email, otpHash, expiresAt: (0, otp_generation_1.getExpiry)(5) },
        });
        try {
            await (0, emailService_1.sendOtpEmail)(email, i18n_1.default.__("Verify your email"), otpPlain, i18n_1.default.__("valid for %s minutes", "5"));
            return { user, mailSent: true };
        }
        catch (err) {
            logger_1.default.error("OTP email failed", { email, err: err.message });
            return { user, mailSent: false };
        }
    }
    async createAdminUser({ email, password, name, }, lang) {
        i18n_1.default.setLocale(lang);
        const hashedPw = await bcrypt_1.default.hash(password, 10);
        // Check if admin already exists
        const existingAdmin = await prisma_1.default.user.findFirst({
            where: { isAdmin: true }
        });
        if (existingAdmin) {
            throw new Error(i18n_1.default.__("Admin user already exists"));
        }
        const user = await prisma_1.default.user.create({
            data: {
                email,
                name,
                password: hashedPw,
                provider: "local",
                role: "ADMIN",
                isAdmin: true,
                isEmailVerified: true,
            },
        });
        return user;
    }
    async deleteUser(id, lang) {
        i18n_1.default.setLocale(lang);
        const user = await prisma_1.default.user.findUnique({ where: { id } });
        if (!user) {
            throw new custom_error_1.CustomError(i18n_1.default.__("User not found"), 404);
        }
        if (user.isAdmin) {
            throw new custom_error_1.CustomError(i18n_1.default.__("Cannot delete admin user"), 403);
        }
        await prisma_1.default.user.delete({ where: { id } });
        return { message: i18n_1.default.__("User deleted successfully") };
    }
    async updateUserRole(id, role, lang) {
        i18n_1.default.setLocale(lang);
        const user = await prisma_1.default.user.findUnique({ where: { id } });
        if (!user) {
            throw new custom_error_1.CustomError(i18n_1.default.__("User not found"), 404);
        }
        if (user.isAdmin) {
            throw new custom_error_1.CustomError(i18n_1.default.__("Cannot modify admin user role"), 403);
        }
        const updatedUser = await prisma_1.default.user.update({
            where: { id },
            data: { role: role },
        });
        return updatedUser;
    }
    async verifyOtp({ email, otp }, lang) {
        i18n_1.default.setLocale(lang);
        return prisma_1.default.$transaction(async (tx) => {
            const otpRecord = await tx.oTP.findFirst({ where: { email } });
            if (!otpRecord)
                throw new Error(i18n_1.default.__("No OTP found, please request one"));
            if (otpRecord.expiresAt < new Date())
                throw new Error(i18n_1.default.__("OTP expired, request a new one"));
            const match = await (0, otp_generation_1.compareOtp)(otp, otpRecord.otpHash);
            if (!match)
                throw new Error(i18n_1.default.__("Invalid OTP"));
            const user = await tx.user.update({
                where: { email },
                data: { isEmailVerified: true },
            });
            await tx.oTP.delete({ where: { id: otpRecord.id } });
            return user;
        });
    }
    async resendOtp(email, lang) {
        i18n_1.default.setLocale(lang);
        const user = await prisma_1.default.user.findUnique({ where: { email } });
        if (!user || user.isEmailVerified)
            throw new Error(i18n_1.default.__("Invalid request"));
        const otpPlain = (0, otp_generation_1.generateOtp)();
        const otpHash = await (0, otp_generation_1.hashOtp)(otpPlain);
        await prisma_1.default.oTP.upsert({
            where: { email },
            update: { otpHash, expiresAt: (0, otp_generation_1.getExpiry)(5) },
            create: { email, otpHash, expiresAt: (0, otp_generation_1.getExpiry)(5) },
        });
        try {
            await (0, emailService_1.sendOtpEmail)(email, i18n_1.default.__("Verify your email"), otpPlain, i18n_1.default.__("valid for %s minutes", "5"));
            return { mailSent: true };
        }
        catch (err) {
            logger_1.default.error("OTP email failed", { email, err: err.message });
            return { mailSent: false };
        }
    }
    async getProfile(id) {
        const user = await prisma_1.default.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                provider: true,
            },
        });
        if (!user)
            throw new custom_error_1.CustomError(i18n_1.default.__("User not found"), 404);
        return user;
    }
    async resetPassword(id, newPassword) {
        const user = await prisma_1.default.user.findUnique({ where: { id } });
        if (!user)
            throw new Error("Invalid userId");
        const hashedPass = await bcrypt_1.default.hash(newPassword, 10);
        await prisma_1.default.user.update({
            where: { id },
            data: { password: hashedPass },
        });
    }
}
exports.AuthService = AuthService;
