import { ErrorRequestHandler } from 'express';
import nodemailer  from 'nodemailer';
import config from '../config';

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
    }

export const emailWithNodeMailer = async ({ email, subject, html }: { email: string, subject: string, html: string }) => {
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
}


