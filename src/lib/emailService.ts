// src/services/emailService.ts
import nodemailer from "nodemailer";
import mjml2html from "mjml";
import fs from "fs";
import path from "path";
import logger from "./logger";

const transporter = nodemailer.createTransport({
  host: process.env.NODEMAILER_HOST ?? "smtp.gmail.com",
  port: Number(process.env.NODEMAILER_PORT ?? 465),
  secure: true,
  auth: {
    user: process.env.NODEMAILER_USER||"devcommunity43@gmail.com",
    pass: process.env.NODEMAILER_PASSWORD||"dnpb gnrl atua aiml",
  },
});

export async function sendOtpEmail(
  email: string,
  subject: string,
  otp: string,
  time: string
) {
  const mjmlPath = path.join(
    __dirname,
    "../locales/emailTemplates/emailTemplate.mjml"
  );
  const mjmlTemplate = fs.readFileSync(mjmlPath, "utf-8");
  const html = mjml2html(
    mjmlTemplate.replace("{{OTP}}", otp).replace("{{time}}", time)
  ).html;
  const info = await transporter.sendMail({
    from: `"SurveyLand" <${process.env.NODEMAILER_USER}>`,
    to: email,
    subject,
    html,
  });
  logger.info("OTP email sent", { email, messageId: info.messageId });
  return info;
}

export async function sendNotificationEmail(
  email: string,
  subject: string,
  creatorName: string,
  surveyTitle: string,
  responseCount: number
) {
  const mjmlPath = path.join(
    __dirname,
    "../locales/emailTemplates/notificationTemplate.mjml"
  );
  const mjmlTemplate = fs.readFileSync(mjmlPath, "utf-8");
  const html = mjml2html(
    mjmlTemplate
      .replace("{{creatorName}}", creatorName)
      .replace("{{surveyTitle}}", surveyTitle)
      .replace("{{responseCount}}", responseCount.toString())
  ).html;
  const info = await transporter.sendMail({
    from: `"SurveyLand" <${process.env.NODEMAILER_USER}>`,
    to: email,
    subject,
    html,
  });
  logger.info("Notification email sent", { email, messageId: info.messageId });
  return info;
}
