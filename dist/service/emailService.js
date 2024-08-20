"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sentOtpByEmail = sentOtpByEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = __importDefault(require("../config"));
const transporter = nodemailer_1.default.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: config_1.default.smtpUsername,
        pass: config_1.default.smtpPassword,
    },
});
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const handleEmailError = (error, msg) => __awaiter(void 0, void 0, void 0, function* () {
    if (error.response === 454) {
        console.error("Too many login attempts, retrying after delay...");
        yield delay(60000);
        try {
            transporter.sendMail(msg);
            console.log("Email sent successfully after retry");
        }
        catch (error) {
            console.error("Failed to send email after retry: ", error);
        }
    }
    else {
        console.error("Failed to send email: ", error);
    }
});
const emailWithNodeMailer = (_a) => __awaiter(void 0, [_a], void 0, function* ({ email, subject, html }) {
    const mailOptions = {
        from: config_1.default.smtpUsername,
        to: email,
        subject: subject,
        html: html
    };
    try {
        const info = yield transporter.sendMail(mailOptions);
        console.log("Message sent: %s", info.response);
    }
    catch (error) {
        yield handleEmailError(error, mailOptions);
    }
});
/**
 * Sends an OTP (One Time Password) to the provided email address.
 *
 * @param {string} email - The email address to send the OTP to.
 * @param {string} otp - The OTP to send.
 * @return {Promise<void>} A Promise that resolves when the email is sent.
 */
function sentOtpByEmail(email, oneTimeCode) {
    const subject = "Your One Time Password (OTP) for Verifying your Email";
    const html = `
        <body style="background-color: #f3f4f6; padding: 1rem; font-family: Arial, sans-serif;">
          <div style="max-width: 24rem; margin: 0 auto; background-color: #fff; padding: 1.5rem; border-radius: 0.5rem; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <h1 style="font-size: 1.5rem; font-weight: 600; margin-bottom: 1rem;">Welcome to VALENTINE'S App</h1>
            <h1>Hello</h1>
            <p style="color: #4b5563; margin-bottom: 1rem;">Thank you for joining VALENTINE'S App. Your account is almost ready!</p>
            <div style="background-color: #e5e7eb; padding: 1rem; border-radius: 0.25rem; text-align: center; font-size: 2rem; font-weight: 700; margin-bottom: 1rem;">${oneTimeCode}</div>
            <p style="color: #4b5563; margin-bottom: 1rem;">Enter this code to verify your account.</p>
            <p style="color: red; font-size: 0.8rem; margin-top: 1rem;">This code expires in <span id="timer">3:00</span> minutes.</p>
          </div>
      </body>
      `;
    return emailWithNodeMailer({ email, subject, html });
}
