"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const passport_1 = __importDefault(require("passport"));
const i18n_1 = __importDefault(require("../config/i18n"));
const authService_1 = require("../services/authService");
const jwt_util_1 = require("../utils/jwt.util");
const response_1 = require("../utils/response");
const cookieOptions = {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
};
class AuthController {
    constructor() {
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
                const { mailSent } = await this.authService.registerInit({ email, password, name }, lang);
                res.status(202).json((0, response_1.sendResponse)(true, mailSent
                    ? i18n_1.default.__("OTP sent to your email")
                    : i18n_1.default.__("OTP created but email failed; please use /otp/resend"), null));
            }
            catch (e) {
                next(e);
            }
        };
        this.registerVerify = async (req, res, next) => {
            try {
                const lang = (0, response_1.setLocale)(req);
                const { email, otp } = req.body;
                const user = await this.authService.verifyOtp({ email, otp }, lang);
                const accessToken = (0, jwt_util_1.signAccess)({
                    id: user.id,
                    email: user.email,
                    role: user.role,
                });
                const refreshToken = (0, jwt_util_1.signRefresh)({ id: user.id });
                res.cookie("refreshToken", refreshToken, cookieOptions)
                    .status(201)
                    .json((0, response_1.sendResponse)(true, i18n_1.default.__("Registration complete"), {
                    accessToken,
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                    },
                }));
            }
            catch (e) {
                next(e);
            }
        };
        this.resendOtp = async (req, res, next) => {
            try {
                const lang = (0, response_1.setLocale)(req);
                const { email } = req.body;
                await this.authService.resendOtp(email, lang);
                res.json((0, response_1.sendResponse)(true, i18n_1.default.__("OTP resent to your email"), null));
            }
            catch (e) {
                next(e);
            }
        };
        this.login = async (req, res, next) => {
            try {
                const lang = (0, response_1.setLocale)(req);
                const { email, password } = req.body;
                const { user, mailSent } = await this.authService.login(email, password, lang);
                const accessToken = (0, jwt_util_1.signAccess)({
                    id: user.id,
                    email: user.email,
                    role: user.role,
                });
                const refreshToken = (0, jwt_util_1.signRefresh)({ id: user.id });
                res.cookie("refreshToken", refreshToken, cookieOptions).json({
                    message: mailSent
                        ? i18n_1.default.__("Login successful. Please check your email for OTP verification.")
                        : i18n_1.default.__("Login successful but OTP email failed. Please try again."),
                    accessToken,
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                    },
                    requiresOtp: true
                });
            }
            catch (e) {
                next(e);
            }
        };
        this.refreshToken = async (req, res, next) => {
            try {
                const { refreshToken } = req.cookies;
                if (!refreshToken)
                    throw new Error("No refresh token");
                const payload = (0, jwt_util_1.verifyRefresh)(refreshToken);
                const accessToken = (0, jwt_util_1.signAccess)({
                    id: payload.id,
                    email: payload.email,
                    role: payload.role,
                });
                res.json({ success: true, accessToken });
            }
            catch (e) {
                next(e);
            }
        };
        this.logout = (_req, res) => {
            (0, response_1.setLocale)(_req);
            res.clearCookie("refreshToken", cookieOptions).json({
                message: i18n_1.default.__("Logged out successfully"),
            });
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
        this.googleLogin = (req, res, next) => passport_1.default.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
        this.googleCallback = (req, res, next) => passport_1.default.authenticate("google", { session: false }, (err, user) => {
            if (err || !user)
                return res
                    .status(400)
                    .json({ message: i18n_1.default.__("Authentication failed") });
            const accessToken = (0, jwt_util_1.signAccess)({
                id: user.id,
                email: user.email,
                role: user.role,
            });
            const refreshToken = (0, jwt_util_1.signRefresh)({ id: user.id });
            res.cookie("refreshToken", refreshToken, cookieOptions).json({
                message: i18n_1.default.__("Logged in successfully with Google"),
                accessToken,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                },
            });
        })(req, res, next);
        this.githubLogin = (req, res, next) => passport_1.default.authenticate("github", { scope: ["user:email"] })(req, res, next);
        this.githubCallback = (req, res, next) => passport_1.default.authenticate("github", { session: false }, (err, user) => {
            if (err || !user)
                return res
                    .status(400)
                    .json({ message: i18n_1.default.__("Authentication failed") });
            const accessToken = (0, jwt_util_1.signAccess)({
                id: user.id,
                email: user.email,
                role: user.role,
            });
            const refreshToken = (0, jwt_util_1.signRefresh)({ id: user.id });
            res.cookie("refreshToken", refreshToken, cookieOptions).json({
                message: i18n_1.default.__("Logged in successfully with GitHub"),
                accessToken,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                },
            });
        })(req, res, next);
        this.twitterLogin = (req, res, next) => {
            passport_1.default.authenticate("twitter", { session: true })(req, res, next);
        };
        this.twitterCallback = (req, res, next) => {
            passport_1.default.authenticate("twitter", { session: true }, async (err, user) => {
                if (err || !user) {
                    const errorDetails = err instanceof Error
                        ? { message: err.message }
                        : err;
                    return res.status(500).json({
                        message: i18n_1.default.__("Authentication failed"),
                        error: errorDetails,
                    });
                }
                const accessToken = (0, jwt_util_1.signAccess)({
                    id: user.id,
                    email: user.email,
                    role: user.role,
                });
                const refreshToken = (0, jwt_util_1.signRefresh)({ id: user.id });
                res.cookie("refreshToken", refreshToken, cookieOptions);
                res.json({
                    message: i18n_1.default.__("Logged in successfully with Twitter"),
                    accessToken,
                    user,
                });
            })(req, res, next);
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
                if (!newPassword) {
                    res.status(400).json({
                        message: i18n_1.default.__("Password is required"),
                    });
                    return;
                }
                await this.authService.resetPassword(user.id, newPassword);
                res.json({ message: i18n_1.default.__("Password reset successfully") });
            }
            catch (e) {
                next(e);
            }
        };
        this.createAdmin = async (req, res, next) => {
            try {
                const lang = (0, response_1.setLocale)(req);
                const { email, password, name } = req.body;
                const user = await this.authService.createAdminUser({ email, password, name }, lang);
                res.status(201).json({
                    message: i18n_1.default.__("Admin user created successfully"),
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
        this.deleteUser = async (req, res, next) => {
            try {
                const lang = (0, response_1.setLocale)(req);
                const { id } = req.params;
                const result = await this.authService.deleteUser(id, lang);
                res.json(result);
            }
            catch (e) {
                next(e);
            }
        };
        this.updateUserRole = async (req, res, next) => {
            try {
                const lang = (0, response_1.setLocale)(req);
                const { id } = req.params;
                const { role } = req.body;
                const user = await this.authService.updateUserRole(id, role, lang);
                res.json({
                    message: i18n_1.default.__("User role updated successfully"),
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
        this.authService = new authService_1.AuthService();
    }
}
exports.AuthController = AuthController;
