"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOtpEmailTemplate = void 0;
const i18n_1 = __importDefault(require("../../config/i18n"));
const generateOtpEmailTemplate = (OTP, time, lang = "en") => {
    i18n_1.default.setLocale(lang);
    // Set text direction based on language
    const dir = lang === "ar" ? "rtl" : "ltr";
    const fontFamily = lang === "ar" ? "Arial, sans-serif" : "Helvetica Neue, Helvetica, Arial, sans-serif";
    return `
<mjml>
  <mj-head>
    <mj-title>${i18n_1.default.__("Verify your email")}</mj-title>
    <mj-preview>${i18n_1.default.__("OTP sent to your email")}</mj-preview>
    <mj-attributes>
      <mj-all font-family="${fontFamily}" direction="${dir}" />
    </mj-attributes>
    <mj-style inline="inline">
      .otp-code {
        font-size: 32px;
        font-weight: bold;
        color: #0a66c2;
        letter-spacing: 4px;
      }
    </mj-style>
  </mj-head>
  <mj-body background-color="#f4f4f4">
    <mj-section background-color="#ffffff" padding="20px" border-radius="8px">
      <mj-column>
        <mj-text align="center" font-size="22px" font-weight="bold" color="#0a66c2" font-family="${fontFamily}">
          SurveyLand
        </mj-text>
        <mj-text align="center" font-size="20px" color="#333333">
          ${i18n_1.default.__("Hi there!")}
        </mj-text>
        <mj-text align="center" font-size="16px" color="#555555">
          ${i18n_1.default.__("Use the following OTP to complete your verification process. This code will expire in <strong>%s</strong> minutes.", time.toString())}
        </mj-text>
        <mj-text align="center" css-class="otp-code">${OTP}</mj-text>
        <mj-divider border-color="#cccccc" />
        <mj-text align="center" font-size="14px" color="#888888">
          ${i18n_1.default.__("If you did not request this, you can ignore this email.")}
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
};
exports.generateOtpEmailTemplate = generateOtpEmailTemplate;
