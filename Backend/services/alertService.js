import { sendEmail } from '../emailService.js';

let io;

export const initAlertSocket = (serverIo) => {
  io = serverIo;
};

export const sendAlert = async (type, level, message, count) => {
  const payload = { type, level, message, count, timestamp: new Date().toISOString() };

  // 1. Emit real-time alert to dashboard
  if (io) {
    io.emit('new_alert', payload);
  }

  // 2. Send email
  const subject = `🚨 LogGuardAI Alert: ${type}`;
  const html = `
    <h3>${type}</h3>
    <p><b>Level:</b> ${level}</p>
    <p><b>Message:</b> ${message}</p>
    <p><b>Count:</b> ${count}</p>
    <p><b>Time:</b> ${payload.timestamp}</p>
  `;

  await sendEmail(process.env.ALERT_EMAIL, subject, html);
  console.log(`Alert email sent for: ${type}`);
};