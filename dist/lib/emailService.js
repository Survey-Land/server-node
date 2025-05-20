"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOtpEmail = sendOtpEmail;
exports.sendNotificationEmail = sendNotificationEmail;
// src/services/emailService.ts
const nodemailer_1 = __importDefault(require("nodemailer"));
const mjml_1 = __importDefault(require("mjml"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const logger_1 = __importDefault(require("./logger"));
const transporter = nodemailer_1.default.createTransport({
    host: process.env.NODEMAILER_HOST ?? "smtp.gmail.com",
    port: Number(process.env.NODEMAILER_PORT ?? 465),
    secure: true,
    auth: {
        user: process.env.NODEMAILER_USER || 'devcommunity43@gmail.com',
        pass: process.env.NODEMAILER_PASSWORD || 'irzk bufw qdud dedh',
    },
});
async function sendOtpEmail(email, subject, otp, time) {
    const mjmlPath = path_1.default.join(__dirname, "../locales/emailTemplates/emailTemplate.mjml");
    const mjmlTemplate = fs_1.default.readFileSync(mjmlPath, "utf-8");
    const html = (0, mjml_1.default)(mjmlTemplate.replace("{{OTP}}", otp).replace("{{time}}", time)).html;
    const info = await transporter.sendMail({
        from: `"SurveyLand" <${process.env.NODEMAILER_USER}>`,
        to: email,
        subject,
        html,
    });
    logger_1.default.info("OTP email sent", { email, messageId: info.messageId });
    return info;
}
async function sendNotificationEmail(email, subject, creatorName, surveyTitle, responseCount) {
    const mjmlPath = path_1.default.join(__dirname, "../locales/emailTemplates/notificationTemplate.mjml");
    const mjmlTemplate = fs_1.default.readFileSync(mjmlPath, "utf-8");
    const html = (0, mjml_1.default)(mjmlTemplate
        .replace("{{creatorName}}", creatorName)
        .replace("{{surveyTitle}}", surveyTitle)
        .replace("{{responseCount}}", responseCount.toString())).html;
    const info = await transporter.sendMail({
        from: `"SurveyLand" <${process.env.NODEMAILER_USER}>`,
        to: email,
        subject,
        html,
    });
    logger_1.default.info("Notification email sent", { email, messageId: info.messageId });
    return info;
}
