import nodemailer from "nodemailer";
import mjml2html from "mjml"; 
import fs from "fs";
import path from "path";


const transporter = nodemailer.createTransport({
    service: process.env.NODEMAILER_SERVICE,
    auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASSWORD
    }
});

export async function sendOtpEmail(email: string,subject : string, otp: string, time: string) {
  const mjmlPath = path.join(__dirname, "../locales/emailTemplate.mjml")
  const mjmlTemplate = fs.readFileSync(mjmlPath, "utf-8");
  const html = mjml2html(mjmlTemplate.replace("{{OTP}}", otp ).replace("{{time}}",time )).html;

  await transporter.sendMail({
    from: `"SurveyLand" <${process.env.NODEMAILER_USER}>`,
    to: email,
    subject: subject,
    html,
  });
}
