import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import cron from 'node-cron';
import { initDB } from './db.js';
import { sendEmail } from './emailService.js';
import { initAlertSocket } from './services/alertService.js';
import dotenv from 'dotenv';

import authRoute from './routes/auth.js';
import uploadRoute from './routes/upload.js';
import analyticsRoutes from './routes/analytics.js';
import logRoutes from './routes/logRoutes.js';
import alertRoutes from './routes/alerts.js';
import userRoutes from './routes/users.js';
import notificationRoutes from './routes/notification.js'; // DAY 28 FIX
import Alert from './models/Alerts.js';
import User from './models/User.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

export const io = new Server(server, {
  cors: { origin: ["http://localhost:5173", "http://localhost:3000"], methods: ["GET", "POST"] }
});

app.set('io', io);
initAlertSocket(io);

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});

app.use(cors());
app.use(express.json());
await initDB();

app.use('/api/auth', authRoute);
app.use('/api', uploadRoute);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes); // DAY 28 FIX

app.get("/", (req, res) => res.send("LogGuard AI API Running"));

// Daily summary cron - FIXED: Added 5th * for dayOfWeek
cron.schedule('0 21 * * *', async () => { // <-- FIX: 9PM IST daily
  console.log('Running Daily Summary Job...');
  try {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);

    const todaysCriticals = await Alert.find({
      level: { $regex: /^critical$/i }, // handles CRITICAL, critical, Critical
      acknowledged: false,
      timestamp: { $gte: today, $lt: tomorrow }
    }).populate('userId');

    if (todaysCriticals.length === 0) return;

    const alertsByUser = {};
    todaysCriticals.forEach(alert => {
      if (!alert.userId) return;
      const userId = alert.userId._id.toString();
      if (!alertsByUser[userId]) alertsByUser[userId] = [];
      alertsByUser[userId].push(alert);
    });

    for (const userId in alertsByUser) {
      const user = await User.findById(userId);
      if (!user) continue;
      const userAlerts = alertsByUser[userId];
      let htmlTable = `<table border="1" cellpadding="5"><tr><th>Time</th><th>Message</th></tr>`;
      userAlerts.forEach(a => {
        htmlTable += `<tr><td>${new Date(a.timestamp).toLocaleString('en-IN', {timeZone: 'Asia/Kolkata'})}</td><td>${a.message}</td></tr>`;
      });
      htmlTable += `</table>`;
      const emailBody = `<h2>🚨 LogGuard AI - Daily Critical Summary</h2><p>You had <b>${userAlerts.length} CRITICAL alert(s)</b> today</p>${htmlTable}`;
      await sendEmail(user.email, `LogGuard AI Daily Summary: ${userAlerts.length} Critical Alert(s)`, emailBody);
    }
  } catch (error) {
    console.error("Cron job error:", error);
  }
}, { timezone: "Asia/Kolkata" });


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));