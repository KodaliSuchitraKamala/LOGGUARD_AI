import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import cron from 'node-cron';
import { initDB, db } from './db.js';
import { sendEmail } from './emailService.js';
import dotenv from 'dotenv';

// IMPORT ALL ROUTES FIRST BEFORE ANY AWAIT
import authRoute from './routes/auth.js';
import uploadRoute from './routes/upload.js';
import logsRoute from './routes/logs.js';
import analyticsRoute from './routes/analytics.js'; 

dotenv.config();

const app = express();
const server = http.createServer(app);
export const io = new Server(server, { cors: { origin: "http://localhost:5173" } }); // ADDED export + specific origin

io.on('connection', (socket) => { // ADDED: for debug
    console.log('Client connected:', socket.id);
});

app.use(cors());
app.use(express.json());

// INIT DB
await initDB();
console.log("DB Initialized");

// REGISTER ALL API ROUTES
app.use('/api', authRoute);
app.use('/api', uploadRoute);
app.use('/api', logsRoute);
app.use('/api', analyticsRoute); 
console.log("All API routes registered");

app.use(express.static('public'));

cron.schedule('* * * * *', async () => {
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
    let htmlTable = `<table><tr><th>Time</th><th>Message</th></tr>`;
    userAlerts.forEach(a => {
      htmlTable += `<tr><td>${a.timestamp}</td><td>${a.message}</td></tr>`;
    });
    htmlTable += `</table>`;
    const emailBody = `<h2>LogGuardAI - Daily Critical Summary</h2><p>You had <b>${userAlerts.length} CRITICAL alert(s)</b> today</p>${htmlTable}`;
    await sendEmail(user.email, `LogGuardAI Daily Summary: ${userAlerts.length} Critical Alert(s)`, emailBody);
  }
}, { timezone: "Asia/Kolkata" });

const PORT = 5000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));