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
const logger_1 = __importDefault(require("./logger"));
const emailTemplate_1 = require("../locales/emailTemplates/emailTemplate");
const i18n_1 = __importDefault(require("../config/i18n"));
const transporter = nodemailer_1.default.createTransport({
    service: process.env.NODEMAILER_SERVICE,
    auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASSWORD,
    },
});
async function sendOtpEmail(email, subject, otp, time, lang) {
    try {
        // If lang is not provided, try to detect from headers or default to 'en'
        const language = lang || i18n_1.default.getLocale() || "en";
        // Generate the MJML template with the appropriate language
        const mjmlTemplate = (0, emailTemplate_1.generateOtpEmailTemplate)(otp, parseInt(time), language);
        // Convert MJML to HTML
        const html = (0, mjml_1.default)(mjmlTemplate).html;
        const info = await transporter.sendMail({
            from: `"SurveyLand" <${process.env.NODEMAILER_USER}>`,
            to: email,
            subject,
            html,
        });
        logger_1.default.info("OTP email sent", { email, messageId: info.messageId });
        return info;
    }
    catch (err) {
        logger_1.default.error("Failed to send OTP email", {
            email,
            err: err.message,
            stack: err.stack,
        });
        throw err;
    }
}
async function sendNotificationEmail(email, subject, creatorName, surveyTitle, responseCount, lang) {
    try {
        // If lang is not provided, try to detect from headers or default to 'en'
        const language = lang || i18n_1.default.getLocale() || "en";
        i18n_1.default.setLocale(language);
        // Set text direction based on language
        const dir = language === "ar" ? "rtl" : "ltr";
        const fontFamily = language === "ar" ? "Arial, sans-serif" : "Helvetica Neue, Helvetica, Arial, sans-serif";
        // Create MJML template directly
        const mjmlTemplate = `
<mjml>
  <mj-head>
    <mj-title>${subject}</mj-title>
    <mj-attributes>
      <mj-all font-family="${fontFamily}" direction="${dir}" />
    </mj-attributes>
  </mj-head>
  <mj-body background-color="#f4f4f4">
    <mj-section background-color="#ffffff" padding="20px" border-radius="8px">
      <mj-column>
        <mj-text align="center" font-size="22px" font-weight="bold" color="#0a66c2" font-family="${fontFamily}">
          SurveyLand
        </mj-text>
        <mj-text align="center" font-size="20px" color="#333333">
          ${i18n_1.default.__("Hello")} ${creatorName}!
        </mj-text>
        <mj-text align="center" font-size="16px" color="#555555">
          ${i18n_1.default.__("Your survey '%s' has received %s responses.", surveyTitle, responseCount.toString())}
        </mj-text>
        <mj-divider border-color="#cccccc" />
        <mj-text align="center" font-size="14px" color="#888888">
          ${i18n_1.default.__("Thank you for using SurveyLand.")}
        </mj-text>
      </mj-column>
    </mj-section>
    <mj-section padding="10px 20px">
      <mj-column>
        <mj-text align="center" font-size="12px" color="#aaaaaa">
          &copy; 2025 SurveyLand. ${i18n_1.default.__("All rights reserved.")}</br>
          ${i18n_1.default.__("Brought to you by the SurveyLand team.")}
        </mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>
    `;
        const html = (0, mjml_1.default)(mjmlTemplate).html;
        const info = await transporter.sendMail({
            from: `"SurveyLand" <${process.env.NODEMAILER_USER}>`,
            to: email,
            subject,
            html,
        });
        logger_1.default.info("Notification email sent", { email, messageId: info.messageId });
        return info;
    }
    catch (err) {
        logger_1.default.error("Failed to send notification email", {
            email,
            err: err.message,
            stack: err.stack,
        });
        throw err;
    }
}
