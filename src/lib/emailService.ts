// src/services/emailService.ts
import nodemailer from "nodemailer";
import mjml2html from "mjml";
import fs from "fs";
import path from "path";
import logger from "./logger";    
import { generateOtpEmailTemplate } from "../locales/emailTemplates/emailTemplate";
import i18n from "../config/i18n";

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
  time: string,
  lang?: string
) {
  try {
    // If lang is not provided, try to detect from headers or default to 'en'
    const language = lang || i18n.getLocale() || "en";
    
    // Generate the MJML template with the appropriate language
    const mjmlTemplate = generateOtpEmailTemplate(otp, parseInt(time), language as "en" | "ar");
    
    // Convert MJML to HTML
    const html = mjml2html(mjmlTemplate).html;

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

export async function sendNotificationEmail(
  email: string,
  subject: string,
  creatorName: string,
  surveyTitle: string,
  responseCount: number,
  lang?: string
) {
  try {
    // If lang is not provided, try to detect from headers or default to 'en'
    const language = lang || i18n.getLocale() || "en";
    i18n.setLocale(language);
    
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
          ${i18n.__("Hello")} ${creatorName}!
        </mj-text>
        <mj-text align="center" font-size="16px" color="#555555">
          ${i18n.__("Your survey '%s' has received %s responses.", surveyTitle, responseCount.toString())}
        </mj-text>
        <mj-divider border-color="#cccccc" />
        <mj-text align="center" font-size="14px" color="#888888">
          ${i18n.__("Thank you for using SurveyLand.")}
        </mj-text>
      </mj-column>
    </mj-section>
    <mj-section padding="10px 20px">
      <mj-column>
        <mj-text align="center" font-size="12px" color="#aaaaaa">
          &copy; 2025 SurveyLand. ${i18n.__("All rights reserved.")}</br>
          ${i18n.__("Brought to you by the SurveyLand team.")}
        </mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>
    `;
    
    const html = mjml2html(mjmlTemplate).html;
    
    const info = await transporter.sendMail({
      from: `"SurveyLand" <${process.env.NODEMAILER_USER}>`,
      to: email,
      subject,
      html,
    });

    logger.info("Notification email sent", { email, messageId: info.messageId });
    return info;
  } catch (err) {
    logger.error("Failed to send notification email", {
      email,
      err: (err as Error).message,
      stack: (err as Error).stack,
    });

  
    throw err; 
  }
}

