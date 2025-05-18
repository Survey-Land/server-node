"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const authService_1 = require("../services/authService");
const jwt_util_1 = require("../utils/jwt.util");
const i18n_1 = __importDefault(require("../config/i18n"));
const passport_1 = __importDefault(require("passport"));
const response_1 = require("../utils/response");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class AuthController {
    constructor() {
        this.authService = new authService_1.AuthService();
        this.findAll = async (req, res, next) => {
            try {
                const lang = (0, response_1.setLocale)(req);
                const users = await this.authService.findAll(req.query, lang);
                res.json(users);
            }
            catch (e) {
                next(e);
            }
        };
        this.registerInit = async (req, res, next) => {
            try {
                const lang = (0, response_1.setLocale)(req);
                const { email, password, name } = req.body;
                const { user, mailSent } = await this.authService.registerInit({ email, password, name }, lang);
                res
                    .status(202)
                    .json((0, response_1.sendResponse)(true, mailSent
                    ? i18n_1.default.__("OTP sent to your email")
                    : i18n_1.default.__("OTP created but email failed; please use /otp/resend"), null));
            }
            catch (err) {
                next(err);
            }
        };
        this.registerVerify = async (req, res, next) => {
            try {
                const lang = (0, response_1.setLocale)(req);
                const { email, otp } = req.body;
                const user = await this.authService.verifyOtp({ email, otp }, lang);
                const token = (0, jwt_util_1.generateToken)({
                    id: user.id,
                    email: user.email,
                    role: user.role,
                });
                res.status(201).json((0, response_1.sendResponse)(true, i18n_1.default.__("Registration complete"), {
                    token,
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                    },
                }));
            }
            catch (err) {
                next(err);
            }
        };
        this.resendOtp = async (req, res, next) => {
            try {
                const lang = (0, response_1.setLocale)(req);
                const { email } = req.body;
                await this.authService.resendOtp(email, lang);
                res.json((0, response_1.sendResponse)(true, i18n_1.default.__("OTP resent to your email"), null));
            }
            catch (err) {
                next(err);
            }
        };
        this.login = async (req, res, next) => {
            try {
                const lang = (0, response_1.setLocale)(req);
                const { email, password } = req.body;
                const user = await this.authService.login(email, password, lang);
                const token = (0, jwt_util_1.generateToken)({
                    id: user.id,
                    email: user.email,
                    role: user.role,
                });
                res.json({
                    message: i18n_1.default.__("Logged in successfully"),
                    token,
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                    },
                });
            }
            catch (e) {
                next(e);
            }
        };
        this.adminLogin = async (req, res, next) => {
            try {
                const lang = (0, response_1.setLocale)(req);
                const { email, password } = req.body;
                const user = await this.authService.adminLogin(email, password, lang);
                const token = (0, jwt_util_1.generateToken)({
                    id: user.id,
                    email: user.email,
                    role: user.role,
                });
                res.json({
                    message: i18n_1.default.__("Admin logged in successfully"),
                    token,
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                    },
                });
            }
            catch (e) {
                next(e);
            }
        };
        this.createAdmin = async (req, res, next) => {
            try {
                const lang = (0, response_1.setLocale)(req);
                i18n_1.default.setLocale(lang);
                const user = req.user;
                const { email, password, name } = req.body;
                const newAdmin = await this.authService.createAdmin({ email, password, name }, user.id);
                res.status(201).json((0, response_1.sendResponse)(true, i18n_1.default.__("Admin created successfully"), {
                    admin: {
                        id: newAdmin.id,
                        email: newAdmin.email,
                        name: newAdmin.name,
                        role: newAdmin.role
                    }
                }));
            }
            catch (err) {
                next(err);
            }
        };
        this.deleteAdmin = async (req, res, next) => {
            try {
                const lang = (0, response_1.setLocale)(req);
                i18n_1.default.setLocale(lang);
                const user = req.user;
                const adminId = req.params.id;
                await this.authService.deleteAdmin(adminId, user.id);
                res.json((0, response_1.sendResponse)(true, i18n_1.default.__("Admin deleted successfully"), null));
            }
            catch (e) {
                next(e);
            }
        };
        this.profile = async (req, res, next) => {
            try {
                (0, response_1.setLocale)(req);
                const { id } = req.user;
                const profile = await this.authService.getProfile(id);
                res.json(profile);
            }
            catch (e) {
                next(e);
            }
        };
        this.logout = (_req, res) => {
            (0, response_1.setLocale)(_req);
            res.json({ message: i18n_1.default.__("Logged out successfully") });
        };
        this.googleLogin = (req, res, next) => {
            passport_1.default.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
        };
        this.googleCallback = (req, res, next) => {
            passport_1.default.authenticate("google", { session: false }, (err, user) => {
                if (err || !user)
                    return res
                        .status(400)
                        .json({ message: i18n_1.default.__("Authentication failed") });
                const token = (0, jwt_util_1.generateToken)({
                    id: user.id,
                    email: user.email,
                    role: user.role,
                });
                res.json({
                    message: i18n_1.default.__("Logged in successfully with Google"),
                    token,
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                    },
                });
            })(req, res, next);
        };
        this.githubCallback = (req, res, next) => {
            passport_1.default.authenticate("github", { session: false }, (err, user, _info) => {
                if (err || !user) {
                    return res
                        .status(400)
                        .json({ message: i18n_1.default.__("Authentication failed") });
                }
                const token = (0, jwt_util_1.generateToken)({
                    id: user.id,
                    email: user.email,
                    role: user.role,
                });
                res.json({
                    message: i18n_1.default.__("Logged in successfully with GitHub"),
                    token,
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                    },
                });
            })(req, res, next);
        };
        this.refreshToken = async (req, res, next) => {
            try {
                const refreshToken = req.cookies.refreshToken;
                if (!refreshToken) {
                    throw new Error("Refresh token is missing.");
                }
                const user = (0, jwt_util_1.verifyRefreshToken)(refreshToken);
                if (!user) {
                    throw new Error("Invalid refresh token payload.");
                }
                const accessToken = (0, jwt_util_1.generateToken)({
                    id: user.id,
                    email: user.email,
                    role: user.role,
                });
                res.status(200).json({
                    success: true,
                    message: "Access token refreshed successfully.",
                    accessToken,
                });
            }
            catch (e) {
                next(e);
            }
        };
        this.resetPassword = async (req, res, next) => {
            try {
                (0, response_1.setLocale)(req);
                const user = req.user;
                const { newPassword } = req.body;
                if (!user) {
                    res.status(401).json({ message: "Unauthorized" });
                    return;
                }
                const userId = user.id;
                if (!newPassword) {
                    res.status(400).json({ message: i18n_1.default.__("Password is required") });
                    return;
                }
                await this.authService.resetPassword(userId, newPassword);
                res.json({ message: i18n_1.default.__("Password reset successfully") });
            }
            catch (err) {
                next(err);
            }
        };
        this.checkAdminExists = async (req, res, next) => {
            try {
                const lang = (0, response_1.setLocale)(req);
                i18n_1.default.setLocale(lang);
                const { email } = req.body;
                const existingUser = await prisma.user.findUnique({ where: { email } });
                if (existingUser) {
                    if (existingUser.role === 'admin' || existingUser.role === 'superAdmin') {
                        return res.status(400).json((0, response_1.sendResponse)(false, i18n_1.default.__("Admin already exists"), null));
                    }
                    else {
                        return res.status(400).json((0, response_1.sendResponse)(false, i18n_1.default.__("Email already in use"), null));
                    }
                }
                return res.json((0, response_1.sendResponse)(true, i18n_1.default.__("Email is available"), null));
            }
            catch (err) {
                next(err);
            }
        };
    }
    githubLogin(req, res, next) {
        passport_1.default.authenticate("github", { scope: ["user:email"] })(req, res, next);
    }
}
exports.AuthController = AuthController;
