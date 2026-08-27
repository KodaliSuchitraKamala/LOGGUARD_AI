import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

if(!process.env.EMAIL_USER ||!process.env.EMAIL_PASS){
  console.warn("⚠️ EMAIL_USER or EMAIL_PASS missing in.env - Mail will fail");
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Verify on startup
transporter.verify((err, success) => {
  if(err) console.error("❌ EMAIL CONFIG ERROR:", err.message);
  else console.log("✅ Email server ready -", process.env.EMAIL_USER);
});

export const sendEmail = async (to, subject, html) => {
  try {
    if(!to) throw new Error("No recipient email");
    const info = await transporter.sendMail({
      from: `"LogGuard AI 🚨" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`📧 REAL EMAIL sent to: ${to} | ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error("❌ EMAIL ERROR:", error.message);
    return false;
  }
}