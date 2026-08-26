import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { initDB } from './db.js';
import { initAlertSocket } from './services/alertService.js';
import { sendEmail } from './emailService.js';
import Alert from './models/Alerts.js';
import User from './models/User.js';
import authRoute from './routes/auth.js';
import uploadRoute from './routes/upload.js';
import analyticsRoutes from './routes/analytics.js';
import logRoutes from './routes/logRoutes.js';
import alertRoutes from './routes/alerts.js';
import userRoutes from './routes/users.js';
import notificationRoutes from './routes/notification.js';
import aiAnalysisRoute from './routes/aiAnalysis.js';

dotenv.config();
const app = express();
const server = http.createServer(app);

export const io = new Server(server, {
  cors: { origin: ["http://localhost:5173", "http://localhost:3000"], methods: ["GET", "POST"] }
});
app.set('io', io);
initAlertSocket(io);

app.use(cors({ origin: ["http://localhost:5173", "http://localhost:3000"], credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

await initDB();

app.get("/", (req,res)=>res.send("LogGuard API Running - Email Enabled ✅"));
app.get("/api/health", (req,res)=>res.json({ status: "LogGuard AI Running 🚀", time: new Date() }));

app.use('/api/auth', authRoute);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api', aiAnalysisRoute);
app.use('/api', uploadRoute); // MUST BE LAST

// Cron Job - 9 PM IST
cron.schedule('0 21 * * *', async () => {
  console.log('Running Daily Summary Job...');
  try {
    const today = new Date(); today.setHours(0,0,0,0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate()+1);
    const todaysCriticals = await Alert.find({ level: { $regex: /^critical$/i }, acknowledged: false, timestamp: { $gte: today, $lt: tomorrow } }).populate('userId');
    if (todaysCriticals.length === 0) return console.log("No criticals today");
    const alertsByUser = {};
    todaysCriticals.forEach(alert => { if (!alert.userId) return; const userId = alert.userId._id.toString(); if (!alertsByUser[userId]) alertsByUser[userId] = []; alertsByUser[userId].push(alert); });
    for (const userId in alertsByUser) {
      const user = await User.findById(userId);
      if (!user) continue;
      const userAlerts = alertsByUser[userId];
      let htmlTable = `<table border="1" cellpadding="5"><tr><th>Time</th><th>Message</th></tr>`;
      userAlerts.forEach(a => { htmlTable += `<tr><td>${new Date(a.timestamp).toLocaleString('en-IN', {timeZone: 'Asia/Kolkata'})}</td><td>${a.message}</td></tr>`; });
      htmlTable += `</table>`;
      const emailBody = `<h2>🚨 LogGuard AI - Daily Critical Summary</h2><p>You had <b>${userAlerts.length} CRITICAL</b> today</p>${htmlTable}`;
      await sendEmail(user.email, `Daily Summary: ${userAlerts.length} Critical`, emailBody);
    }
  } catch (error) { console.error("Cron job error:", error); }
}, { timezone: "Asia/Kolkata" });

app.use((err, req, res, next) => { console.error(err.stack); res.status(500).json({ message: err.message }); });
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));