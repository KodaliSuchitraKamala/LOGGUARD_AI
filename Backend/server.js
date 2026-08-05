import express from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express(); // MUST come before httpServer
const httpServer = createServer(app); // wrap app
const io = new Server(httpServer, { cors: { origin: "http://localhost:5173" } });

const PORT = 5000;

app.use(cors());
app.use(express.json());

// File paths
const LOGS_FILE = path.join(__dirname, 'logs.json');
const ALERTS_FILE = path.join(__dirname, 'alerts.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

const ANOMALY_KEYWORDS = ['ERROR', 'CRITICAL', 'FATAL', 'FAILED', 'TIMEOUT', 'EXCEPTION'];

const parseLogFile = (filePath) => {
  const data = fs.readFileSync(filePath, 'utf8');
  return data.split('\n').filter(l=>l.trim()).map(line => {
    const levelMatch = line.match(/INFO|WARN|ERROR|CRITICAL/i);
    let level = levelMatch? levelMatch[0].toUpperCase() : 'INFO';
    level = level.replace('WARN', 'WARNING');
    const timeMatch = line.match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/);
    return { timestamp: timeMatch? timeMatch[0] : new Date().toISOString(), level, message: line };
  });
};

const detectAnomalies = (logs) => logs
.filter(log => ANOMALY_KEYWORDS.some(k => log.level.includes(k)))
.map(log => ({...log, severity: log.level === 'CRITICAL'? 'High' : 'Medium', detectedAt: new Date().toISOString() }));

const saveAlerts = (alerts) => fs.writeFileSync(ALERTS_FILE, JSON.stringify(alerts, null, 2));
const loadAlerts = () =>!fs.existsSync(ALERTS_FILE)? [] : JSON.parse(fs.readFileSync(ALERTS_FILE, 'utf8'));
const loadLogs = () =>!fs.existsSync(LOGS_FILE)? [] : JSON.parse(fs.readFileSync(LOGS_FILE, 'utf8'));

io.on('connection', (socket) => console.log('Client connected:', socket.id));

// ROUTES
app.post('/api/upload', upload.single('logfile'), (req, res) => {
  try {
    if(!req.file) return res.status(400).json({ error: "No file uploaded" });
    
    const logs = parseLogFile(req.file.path);
    fs.writeFileSync(LOGS_FILE, JSON.stringify(logs, null, 2));

    const newAnomalies = detectAnomalies(logs);
    const allAlerts = [...newAnomalies,...loadAlerts()].slice(0, 100);
    saveAlerts(allAlerts);

    if(newAnomalies.length > 0){
      io.emit('new_anomaly', newAnomalies); // broadcast live
    }

    res.json({ logs, count: logs.length, message: `Loaded ${logs.length} logs. Found ${newAnomalies.length} anomalies.` });
  } catch (error) {
    res.status(500).json({ error: error.message, logs: [] });
  }
});

app.get('/api/logs/latest', (req, res) => res.json(loadLogs().slice(-50)));

app.get('/api/analytics/summary', (req, res) => {
  const logs = loadLogs();
  const errors = logs.filter(l => l.level === 'ERROR' || l.level === 'CRITICAL').length;
  res.json({ totalLogs: logs.length, errors, warnings: logs.filter(l => l.level === 'WARNING').length, info: logs.filter(l => l.level === 'INFO').length, avgResponse: 234, health: logs.length > 0? Math.max(0, 100 - errors * 5) : 98 });
});

app.get('/api/analytics/trends', (req, res) => {
  const logs = loadLogs();
  const last7Days = Array.from({length: 7}, (_, i) => { const d = new Date(); d.setDate(d.getDate() - i); return d.toISOString().split('T')[0]; }).reverse();
  res.json(last7Days.map(date => ({ date: date.split('-').slice(1).join('/'), errors: logs.filter(l => l.timestamp.startsWith(date) && (l.level === 'ERROR' || l.level === 'CRITICAL')).length, responseTime: 200 + Math.floor(Math.random() * 150) })));
});

app.get('/api/alerts', (req, res) => {
  try {
    res.json(loadAlerts());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

httpServer.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`)); // ONLY this listen