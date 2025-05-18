"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNotificationEmail = exports.sendOtpEmail = void 0;
// src/services/emailService.ts
const nodemailer_1 = __importDefault(require("nodemailer"));
const mjml_1 = __importDefault(require("mjml"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const logger_1 = __importDefault(require("./logger"));
const handlebars_1 = __importDefault(require("handlebars"));
const transporter = nodemailer_1.default.createTransport({
    host: process.env.NODEMAILER_HOST ?? "smtp.gmail.com",
    port: Number(process.env.NODEMAILER_PORT ?? 465),
    secure: true,
    auth: {
        user: process.env.NODEMAILER_USER || "devcommunity43@gmail.com",
        pass: process.env.NODEMAILER_PASSWORD || "dnpb gnrl atua aiml",
    },
});
const sendOtpEmail = async (to, subject, otp, time, lang = "en") => {
    try {
        const templatePath = path_1.default.join(__dirname, "../locales/emailTemplates/emailTemplate.mjml");
        const template = fs_1.default.readFileSync(templatePath, "utf8");
        const templateData = {
            OTP: otp,
            time: time,
            isArabic: lang === "ar"
        };
        const { html } = (0, mjml_1.default)(template);
        const compiledTemplate = handlebars_1.default.compile(html);
        const finalHtml = compiledTemplate(templateData);
        const info = await transporter.sendMail({
            from: `"SurveyLand" <${process.env.NODEMAILER_USER}>`,
            to,
            subject,
            html: finalHtml,
        });
        logger_1.default.info("OTP email sent", { email: to, messageId: info.messageId });
        return info;
    }
    catch (error) {
        console.error("Error sending OTP email:", error);
        throw error;
    }
};
exports.sendOtpEmail = sendOtpEmail;
const sendNotificationEmail = async (to, subject, creatorName, responseCount, surveyTitle, lang = "en") => {
    try {
        const templatePath = path_1.default.join(__dirname, "../locales/emailTemplates/notificationTemplate.mjml");
        const template = fs_1.default.readFileSync(templatePath, "utf8");
        const templateData = {
            creatorName,
            responseCount,
            surveyTitle,
            isArabic: lang === "ar"
        };
        const { html } = (0, mjml_1.default)(template);
        const compiledTemplate = handlebars_1.default.compile(html);
        const finalHtml = compiledTemplate(templateData);
        const info = await transporter.sendMail({
            from: `"SurveyLand" <${process.env.NODEMAILER_USER}>`,
            to,
            subject,
            html: finalHtml,
        });
        logger_1.default.info("Notification email sent", { email: to, messageId: info.messageId });
        return info;
    }
    catch (error) {
        console.error("Error sending notification email:", error);
        throw error;
    }
};
exports.sendNotificationEmail = sendNotificationEmail;
