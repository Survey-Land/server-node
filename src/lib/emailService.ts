// src/services/emailService.ts
import nodemailer from "nodemailer";
import mjml2html from "mjml";
import fs from "fs";
import path from "path";
import logger from "./logger";
import handlebars from "handlebars";
import i18n from "../config/i18n";

const transporter = nodemailer.createTransport({
  host: process.env.NODEMAILER_HOST ?? "smtp.gmail.com",
  port: Number(process.env.NODEMAILER_PORT ?? 465),
  secure: true,
  auth: {
    user: process.env.NODEMAILER_USER||"devcommunity43@gmail.com",
    pass: process.env.NODEMAILER_PASSWORD||"dnpb gnrl atua aiml",
  },
});

export const sendOtpEmail = async (
  to: string,
  subject: string,
  otp: string,
  time: string,
  lang: string = "en"
) => {
  try {
    const templatePath = path.join(__dirname, "../locales/emailTemplates/emailTemplate.mjml");
    const template = fs.readFileSync(templatePath, "utf8");
    const templateData = {
      OTP: otp,
      time: time,
      isArabic: lang === "ar"
    };

    const { html } = mjml2html(template);
    const compiledTemplate = handlebars.compile(html);
    const finalHtml = compiledTemplate(templateData);

    const info = await transporter.sendMail({
      from: `"SurveyLand" <${process.env.NODEMAILER_USER}>`,
      to,
      subject,
      html: finalHtml,
    });
    logger.info("OTP email sent", { email: to, messageId: info.messageId });
    return info;
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw error;
  }
};

export const sendNotificationEmail = async (
  to: string,
  subject: string,
  creatorName: string,
  responseCount: number,
  surveyTitle: string,
  lang: string = "en"
) => {
  try {
    const templatePath = path.join(__dirname, "../locales/emailTemplates/notificationTemplate.mjml");
    const template = fs.readFileSync(templatePath, "utf8");
    const templateData = {
      creatorName,
      responseCount,
      surveyTitle,
      isArabic: lang === "ar"
    };

    const { html } = mjml2html(template);
    const compiledTemplate = handlebars.compile(html);
    const finalHtml = compiledTemplate(templateData);

    const info = await transporter.sendMail({
      from: `"SurveyLand" <${process.env.NODEMAILER_USER}>`,
      to,
      subject,
      html: finalHtml,
    });
    logger.info("Notification email sent", { email: to, messageId: info.messageId });
    return info;
  } catch (error) {
    console.error("Error sending notification email:", error);
    throw error;
  }
};
