import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import cron from 'node-cron';
import { initDB, db } from './db.js';
import { sendEmail } from './emailService.js';
import { initAlertSocket } from './services/alertService.js';
import dotenv from 'dotenv';

import authRoute from './routes/auth.js';
import uploadRoute from './routes/upload.js';
import analyticsRoutes from './routes/analytics.js';
import logRoutes from './routes/logs.js';
import alertRoutes from './routes/alerts.js';
import userRoutes from './routes/users.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
export const io = new Server(server, { cors: { origin: "http://localhost:5173" } });

initAlertSocket(io);

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
});

app.use(cors());
app.use(express.json());

await initDB();
console.log("DB Initialized");

app.use('/api', authRoute);
app.use('/api', uploadRoute);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/users', userRoutes);
console.log("All API routes registered");

app.use(express.static('public'));

// Daily summary cron - FIXED: runs at 9 PM IST every day
cron.schedule('0 21 * * *', async () => {
  console.log('Running Daily Summary Job...');
  await db.read();
  const today = new Date().toISOString().split('T')[0];
  const todaysCriticals = db.data.alerts.filter(a =>
    a.level === 'CRITICAL' && a.timestamp.startsWith(today) &&!a.acknowledged
  );
  if (todaysCriticals.length === 0) return;

  const alertsByUser = {};
  todaysCriticals.forEach(alert => {
    if (!alertsByUser[alert.userId]) alertsByUser[alert.userId] = [];
    alertsByUser[alert.userId].push(alert);
  });

  for (const userId in alertsByUser) {
    const user = db.data.users.find(u => u.id === userId);
    if (!user) continue;
    const userAlerts = alertsByUser[userId];
    let htmlTable = `<table border="1"><tr><th>Time</th><th>Message</th></tr>`;
    userAlerts.forEach(a => {
      htmlTable += `<tr><td>${a.timestamp}</td><td>${a.message}</td></tr>`;
    });
    htmlTable += `</table>`;
    const emailBody = `<h2>LogGuardAI - Daily Critical Summary</h2><p>You had <b>${userAlerts.length} CRITICAL alert(s)</b> today</p>${htmlTable}`;
    await sendEmail(user.email, `LogGuardAI Daily Summary: ${userAlerts.length} Critical Alert(s)`, emailBody);
  }
}, { timezone: "Asia/Kolkata" });

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));