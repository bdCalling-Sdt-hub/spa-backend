import nodemailer from "nodemailer";
import config from "../config";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: config.smtpUsername,
    pass: config.smtpPassword,
  },
});

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const handleEmailError = async (error: any, msg: any) => {
  if (error.response === 454) {
    console.error("Too many login attempts, retrying after delay...");
    await delay(60000);
    try {
      transporter.sendMail(msg);
      console.log("Email sent successfully after retry");
    } catch (error) {
      console.error("Failed to send email after retry: ", error);
    }
  }else {
    console.error("Failed to send email: ", error);
  }
};

const emailWithNodeMailer = async ({
    email,subject,html
}:{
    email:string,
    subject:string,
    html:string
}) => {
    const mailOptions = {
        from: config.smtpUsername,
        to: email,
        subject: subject,
        html: html
    }
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Message sent: %s", info.response);
    } catch (error) {
        await handleEmailError(error, mailOptions);
    }
};

/**
 * Sends an OTP (One Time Password) to the provided email address.
 *
 * @param {string} email - The email address to send the OTP to.
 * @param {string} otp - The OTP to send.
 * @return {Promise<void>} A Promise that resolves when the email is sent.
 */

export function sentOtpByEmail(email: string, oneTimeCode:number): Promise<void> {
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
      return emailWithNodeMailer({email,subject,html});
}




