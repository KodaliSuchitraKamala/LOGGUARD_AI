import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"LogGuardAI" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`REAL EMAIL sent to: ${to}`)
  } catch (error) {
    console.error("EMAIL ERROR:", error);
  }
}