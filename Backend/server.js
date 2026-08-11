import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import http from 'http';
import { Server } from 'socket.io';
import cron from 'node-cron';
import { sendEmail } from './emailService.js';
import dotenv from 'dotenv';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const USERS_FILE = path.join(__dirname, 'users.json');
const LOGS_FILE = path.join(__dirname, 'logs.json');
const ALERTS_FILE = path.join(__dirname, 'alerts.json');

// FIXED: Crash-proof JSON reader
const readJSON = (file) => {
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, '[]');
    return [];
  }
  const data = fs.readFileSync(file, 'utf8').trim();
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (err) {
    console.error(`Corrupted ${file}. Resetting to []`);
    fs.writeFileSync(file, '[]');
    return [];
  }
};

const writeJSON = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2));
const findUserById = (id) => readJSON(USERS_FILE).find(u => u.id === id);

const getLogLevel = (line) => {
  if(line.includes('CRITICAL')) return 'CRITICAL';
  if(line.includes('ERROR')) return 'ERROR';
  if(line.includes('WARNING')) return 'WARNING';
  return 'INFO';
}

const upload = multer({ dest: 'uploads/' });

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch { return res.status(401).json({ error: 'Invalid token' }); }
};

app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if(!name || !email || !password) return res.status(400).json({ error: 'All fields required' });
    
    const users = readJSON(USERS_FILE);
    if (users.find(u => u.email === email)) return res.status(400).json({ error: 'User exists' });
    
    const hashed = await bcrypt.hash(password, 10);
    const newUser = { id: Date.now().toString(), name, email, password: hashed };
    users.push(newUser);
    writeJSON(USERS_FILE, users);
    console.log("New user registered:", email)
    res.json({ message: 'Registered' });
  } catch (error) {
    console.error("REGISTER ERROR:", error)
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const users = readJSON(USERS_FILE);
    const user = users.find(u => u.email === email);
    if (!user ||!await bcrypt.compare(password, user.password)) return res.status(400).json({ error: 'Invalid credentials' });
    
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    console.log("User logged in:", email)
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    console.error("LOGIN ERROR:", error)
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/logs/latest', auth, (req, res) => {
  const logs = readJSON(LOGS_FILE)
  .filter(l => l.userId === req.user.id)
  .slice(-50)
  .reverse();
  res.json(logs);
});

app.post('/api/logs/upload', auth, upload.single('logfile'), async (req, res) => {
  try {
    if(!req.file) return res.status(400).json({error: 'No file uploaded'});
    
    const fileContent = fs.readFileSync(req.file.path, 'utf8');
    const lines = fileContent.split('\n').filter(l => l.trim());

    const logs = readJSON(LOGS_FILE);
    const alerts = readJSON(ALERTS_FILE);
    const newLogs = [];
    const newAlerts = [];

    lines.forEach(line => {
      const level = getLogLevel(line);
      const logEntry = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId: req.user.id,
        level: level,
        message: line,
        filename: req.file.originalname,
        timestamp: new Date().toISOString(),
        acknowledged: false
      };
      logs.push(logEntry);
      newLogs.push(logEntry);
      if (level === 'CRITICAL' || level === 'ERROR') {
        alerts.push(logEntry);
        newAlerts.push(logEntry);
      }
    });

    writeJSON(LOGS_FILE, logs);
    writeJSON(ALERTS_FILE, alerts);
    fs.unlinkSync(req.file.path);

    if(newAlerts.length > 0){
      io.emit('new_anomaly', newAlerts);
    }
    
    res.json({ message: `Uploaded ${lines.length} logs. Found ${newAlerts.length} alerts.`, logs: newLogs });
  } catch (error) {
    console.log("UPLOAD ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/alerts/:id/acknowledge', auth, (req, res) => {
  const alertId = req.params.id;
  let alerts = readJSON(ALERTS_FILE);
  
  const alertIndex = alerts.findIndex(a => a.id === alertId && a.userId === req.user.id);
  
  if(alertIndex === -1) {
    return res.status(404).json({ error: 'Alert not found' });
  }
  
  alerts[alertIndex].acknowledged = true;
  writeJSON(ALERTS_FILE, alerts);
  
  const userAlerts = alerts.filter(a => a.userId === req.user.id &&!a.acknowledged);
  io.emit('alerts_updated', userAlerts);
  
  res.json({ message: 'Alert acknowledged' });
});

app.get('/api/alerts', auth, (req, res) => {
  const alerts = readJSON(ALERTS_FILE)
   .filter(a => a.userId === req.user.id &&!a.acknowledged);
  res.json(alerts);
});

app.get('/api/analytics/summary', auth, (req, res) => {
  const logs = readJSON(LOGS_FILE).filter(l => l.userId === req.user.id);
  
  const totalLogs = logs.length;
  const errors = logs.filter(l => l.level === 'ERROR' || l.level === 'CRITICAL').length;
  const health = totalLogs > 0? Math.max(0, 100 - errors * 5) : 98;

  res.json({ totalLogs, errors, avgResponse: 120, health });
});

app.get('/api/analytics/trends', auth, (req, res) => {
  const logs = readJSON(LOGS_FILE).filter(l => l.userId === req.user.id);
  
  const trendData = Array.from({length: 7}).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const date = d.toISOString().split('T')[0];
    return {
      date,
      errors: logs.filter(l => l.timestamp.startsWith(date) && (l.level === 'ERROR' || l.level === 'CRITICAL')).length
    }
  }).reverse();

  res.json(trendData);
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
});

// FIXED: 5 STARS NOW
cron.schedule('* * * * *', async () => {
  console.log('Running Daily Summary Job...');
  const alerts = readJSON(ALERTS_FILE);
  const today = new Date().toISOString().split('T')[0];
  const todaysCriticals = alerts.filter(a =>
    a.level === 'CRITICAL' && a.timestamp.startsWith(today)
  );
  if (todaysCriticals.length === 0) return;

  const alertsByUser = {};
  todaysCriticals.forEach(alert => {
    if (!alertsByUser[alert.userId]) alertsByUser[alert.userId] = [];
    alertsByUser[alert.userId].push(alert);
  });

  for (const userId in alertsByUser) {
    const user = findUserById(userId);
    if (!user) continue;
    const userAlerts = alertsByUser[userId];
    let htmlTable = `<table style="width:100%; border-collapse: collapse;"><tr style="background:#dc3545; color:white;"><th style="padding:8px; border:1px solid #ddd;">Time</th><th style="padding:8px; border:1px solid #ddd;">Message</th></tr>`;
    userAlerts.forEach(a => {
      htmlTable += `<tr><td style="padding:8px; border:1px solid #ddd;">${a.timestamp}</td><td style="padding:8px; border:1px solid #ddd;">${a.message}</td></tr>`;
    });
    htmlTable += `</table>`;
    const emailBody = `<h2>LogGuardAI - Daily Critical Summary</h2><p>Hello ${user.name},</p><p>You had <b>${userAlerts.length} CRITICAL alert(s)</b> today</p>${htmlTable}`;
    await sendEmail(user.email, `LogGuardAI Daily Summary: ${userAlerts.length} Critical Alert(s)`, emailBody);
    console.log(`Daily summary sent to: ${user.email}`);
  }
}, { timezone: "Asia/Kolkata" });

const PORT = 5000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));