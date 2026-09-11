import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

if(!process.env.EMAIL_USER || !process.env.EMAIL_PASS){
  console.warn("⚠️ EMAIL_USER or EMAIL_PASS missing - Mail will be disabled");
}

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
  });
  return transporter;
};

// Non-blocking verify
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  getTransporter().verify()
    .then(() => console.log(`✅ Email ready - ${process.env.EMAIL_USER}`))
    .catch(err => console.warn(`⚠️ Email not ready (${err.message}) - API will still work. Fix App Password.`));
}

export const sendEmail = async (to, subject, html) => {
  try {
    if(!to) throw new Error("No recipient");
    if(!process.env.EMAIL_USER || !process.env.EMAIL_PASS){
      console.log(`📧 Mock Email to ${to}: ${subject}`);
      return true;
    }
    const info = await getTransporter().sendMail({
      from: `"LogGuard AI 🚨" <${process.env.EMAIL_USER}>`,
      to, subject, html,
    });
    console.log(`📧 Email sent to: ${to} | ${info.messageId}`);
    return true;
  } catch (error) {
    console.error("❌ EMAIL ERROR:", error.message);
    return false;
  }
};

export default { sendEmail };