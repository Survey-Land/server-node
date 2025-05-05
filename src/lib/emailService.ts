// src/services/emailService.ts
import nodemailer from "nodemailer";
import mjml2html from "mjml";
import fs from "fs";
import path from "path";
import logger from "./logger";          

const transporter = nodemailer.createTransport({
  service: process.env.NODEMAILER_SERVICE,
  auth: {
    user: process.env.NODEMAILER_USER,
    pass: process.env.NODEMAILER_PASSWORD,
  },
});


export async function sendOtpEmail(
  email: string,
  subject: string,
  otp: string,
  time: string
) {
  try {
    const mjmlPath = path.join(__dirname, "../locales/emailTemplate.mjml");
    const mjmlTemplate = fs.readFileSync(mjmlPath, "utf-8");
    const html = mjml2html(
      mjmlTemplate
        .replace("{{OTP}}", otp)
        .replace("{{time}}", time)
    ).html;

    const info = await transporter.sendMail({
      from: `"SurveyLand" <${process.env.NODEMAILER_USER}>`,
      to: email,
      subject,
      html,
    });

    logger.info("OTP email sent", { email, messageId: info.messageId });
    return info;
  } catch (err) {
    logger.error("Failed to send OTP email", {
      email,
      err: (err as Error).message,
      stack: (err as Error).stack,
    });

  
    throw err; 
  }
}
