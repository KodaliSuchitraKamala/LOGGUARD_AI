import { sendEmail } from '../emailService.js';
import Alert from '../models/Alerts.js';
import Notification from '../models/Notification.js';

let io;

export const initAlertSocket = (serverIo) => {
  io = serverIo;
  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);
  });
};

export const sendAlert = async (type, level, message, count) => {
  const payload = {
    type,
    level,
    message,
    count,
    timestamp: new Date().toISOString(),
    createdAt: new Date()
  };

  try {
    const saved = await Alert.create({
      type,
      level: level || 'CRITICAL',
      message: `${type}: ${message} (Count: ${count})`,
      timestamp: new Date(),
      acknowledged: false
    });
    payload._id = saved._id;

    // ALSO save to notifications collection - so Atlas shows data
    await Notification.create({
      message: `${type}: ${message} (Count: ${count})`,
      level: level || 'CRITICAL',
      type: type,
      isRead: false,
      timestamp: new Date()
    });
    console.log("Saved to Alert + Notification collections");

  } catch(e){ console.log('Alert save error', e.message); }

  if (io) {
    io.emit('new_alert', payload);
    io.emit('newNotification', payload);
    io.emit('new_log', payload);
    io.emit('newAlert', payload);
  }

  if ((level || '').toUpperCase() === 'CRITICAL') {
    const subject = `🚨 LogGuard AI Alert: ${type}`;
    const html = `<h3>${type}</h3><p><b>Level:</b> ${level}</p><p><b>Message:</b> ${message}</p><p><b>Count:</b> ${count}</p><p><b>Time:</b> ${payload.timestamp}</p>`;
    await sendEmail(process.env.ALERT_EMAIL, subject, html).catch(()=>{});
    console.log(`Alert email sent for: ${type}`);
  }
};