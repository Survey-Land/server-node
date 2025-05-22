import Handlebars from 'handlebars';          
import nodemailer from 'nodemailer';
import mjml2html from 'mjml';
import fs from 'fs';
import path from 'path';
import logger from './logger';

const transporter = nodemailer.createTransport({
  host: process.env.NODEMAILER_HOST ?? 'smtp.gmail.com',
  port: Number(process.env.NODEMAILER_PORT ?? 465),
  secure: true,
  auth: {
    user: process.env.NODEMAILER_USER ?? 'devcommunity43@gmail.com',
    pass: process.env.NODEMAILER_PASSWORD ?? 'irzk bufw qdud dedh',
  },
});

export async function sendOtpEmail(
  email: string,
  subject: string,
  otp: string,
  time: string,
  lang: string        
) {
  const tplPath = path.join(
    __dirname,
    '../locales/emailTemplates/emailTemplate.mjml'
  );
  const raw = fs.readFileSync(tplPath, 'utf-8');

  const template = Handlebars.compile(raw);

  const mjmlFilled = template({
    OTP: otp,
    time,
    isArabic: lang === 'ar',
  });

  const html = mjml2html(mjmlFilled).html;

  const info = await transporter.sendMail({
    from: `"SurveyLand" <${process.env.NODEMAILER_USER}>`,
    to: email,
    subject,
    html,
  });

  logger.info('OTP email sent', { email, messageId: info.messageId });
  return info;
}

export async function sendNotificationEmail(
  email: string,
  subject: string,
  creatorName: string,
  surveyTitle: string,
  responseCount: number,
  lang: string      
) {
  const tplPath = path.join(
    __dirname,
    '../locales/emailTemplates/notificationTemplate.mjml'
  );
  const raw = fs.readFileSync(tplPath, 'utf-8');

  const template = Handlebars.compile(raw);
  const mjmlFilled = template({
    creatorName,
    surveyTitle,
    responseCount,
    isArabic: lang === 'ar',
  });

  const html = mjml2html(mjmlFilled).html;

  const info = await transporter.sendMail({
    from: `"SurveyLand" <${process.env.NODEMAILER_USER}>`,
    to: email,
    subject,
    html,
  });

  logger.info('Notification email sent', { email, messageId: info.messageId });
  return info;
}
