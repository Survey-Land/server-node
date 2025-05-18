"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
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
        if (!user || !user.password)
            throw new custom_error_1.CustomError(i18n_1.default.__("Incorrect email or password"), 400);
        const ok = await bcrypt_1.default.compare(password, user.password);
        if (!ok)
            throw new custom_error_1.CustomError(i18n_1.default.__("Incorrect email or password"), 400);
        return user;
    }
    async adminLogin(email, password, lang) {
        i18n_1.default.setLocale(lang);
        const user = await prisma_1.default.user.findUnique({ where: { email } });
        if (!user || !user.password) {
            throw new custom_error_1.CustomError(i18n_1.default.__("Incorrect email or password"), 400);
        }
        if (user.role !== 'admin' && user.role !== 'superAdmin') {
            throw new custom_error_1.CustomError(i18n_1.default.__("Access denied: Admin permission required"), 403);
        }
        const ok = await bcrypt_1.default.compare(password, user.password);
        if (!ok)
            throw new custom_error_1.CustomError(i18n_1.default.__("Incorrect email or password"), 400);
        return user;
    }
    async createAdmin(data, creatorId) {
        const creator = await prisma_1.default.user.findUnique({ where: { id: creatorId } });
        if (!creator || creator.role !== 'superAdmin') {
            throw new custom_error_1.CustomError(i18n_1.default.__("Only superAdmin can create admins"), 403);
        }
        const existingUser = await prisma_1.default.user.findUnique({ where: { email: data.email } });
        if (existingUser) {
            if (existingUser.role === 'admin' || existingUser.role === 'superAdmin') {
                throw new custom_error_1.CustomError(i18n_1.default.__("Admin already exists"), 400);
            }
            else {
                throw new custom_error_1.CustomError(i18n_1.default.__("Email already in use"), 400);
            }
        }
        const hashedPassword = await bcrypt_1.default.hash(data.password, 10);
        return prisma_1.default.user.create({
            data: {
                email: data.email,
                name: data.name,
                password: hashedPassword,
                role: 'admin',
                provider: 'local',
                isEmailVerified: true, // Admin accounts are pre-verified
                userIsActive: true
            }
        });
    }
    async deleteAdmin(adminId, requesterId) {
        const requester = await prisma_1.default.user.findUnique({ where: { id: requesterId } });
        if (!requester || requester.role !== 'superAdmin') {
            throw new custom_error_1.CustomError(i18n_1.default.__("Only superAdmin can delete admins"), 403);
        }
        const adminToDelete = await prisma_1.default.user.findUnique({ where: { id: adminId } });
        if (!adminToDelete) {
            throw new custom_error_1.CustomError(i18n_1.default.__("Admin not found"), 404);
        }
        if (adminToDelete.role === 'superAdmin') {
            throw new custom_error_1.CustomError(i18n_1.default.__("SuperAdmin cannot be deleted"), 403);
        }
        return prisma_1.default.user.delete({ where: { id: adminId } });
    }
    async registerInit({ email, password, name, }, lang) {
        i18n_1.default.setLocale(lang);
        const { user, otpPlain } = await prisma_1.default.$transaction(async (tx) => {
            const existing = await tx.user.findUnique({ where: { email } });
            if (existing?.isEmailVerified)
                throw new Error(i18n_1.default.__("Email already in use"));
            const hashedPw = await bcrypt_1.default.hash(password, 10);
            const user = existing ??
                (await tx.user.create({
                    data: {
                        email,
                        name,
                        password: hashedPw,
                        provider: "local",
                        role: "user",
                        isEmailVerified: false,
                    },
                }));
            const otpPlain = (0, otp_generation_1.generateOtp)();
            const otpHash = await (0, otp_generation_1.hashOtp)(otpPlain);
            await tx.oTP.upsert({
                where: { email },
                update: { otpHash, expiresAt: (0, otp_generation_1.getExpiry)(5) },
                create: { email, otpHash, expiresAt: (0, otp_generation_1.getExpiry)(5) },
            });
            return { user, otpPlain };
        });
        try {
            await (0, emailService_1.sendOtpEmail)(email, i18n_1.default.__("Verify your email"), otpPlain, "5", lang);
            return { user, mailSent: true };
        }
        catch (err) {
            logger_1.default.error("OTP email failed", { email, err: err.message });
            return { user, mailSent: false };
        }
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
        await (0, emailService_1.sendOtpEmail)(email, i18n_1.default.__("Verify your email"), otpPlain, "5", lang);
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
        if (!user) {
            throw new Error("Invalid userId");
        }
        const hashedPass = await bcrypt_1.default.hash(newPassword, 10);
        await prisma_1.default.user.update({
            where: { id },
            data: {
                password: hashedPass,
            },
        });
    }
}
exports.AuthService = AuthService;
