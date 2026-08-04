import express from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });
const LOGS_FILE = 'logs.json';

// Parse logs
function parseLogFile(filePath) {
  const data = fs.readFileSync(filePath, 'utf8');
  const lines = data.split('\n');

  const logs = []; // <-- must be inside function
  for(let line of lines) {
    line = line.trim();
    if(!line) continue;

    const levelMatch = line.match(/INFO|WARN|ERROR|CRITICAL/i);
    let level = levelMatch? levelMatch[0].toUpperCase() : 'INFO';
    level = level.replace('WARN', 'WARNING'); // match frontend

    // Extract timestamp from log line
    const timeMatch = line.match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/);
    const timestamp = timeMatch? timeMatch[0] : new Date().toISOString();

    logs.push({ // <-- this must be inside the for loop and inside function
        timestamp: timestamp,
        level: level,
        message: line
    });
  }
  return logs;
}

// 1. UPLOAD
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    const logs = parseLogFile(req.file.path);
    fs.writeFileSync(LOGS_FILE, JSON.stringify(logs));

    res.json({
        logs: logs, // send logs back so frontend updates
        count: logs.length,
        message: `Loaded ${logs.length} logs`
    });
  } catch (err) {
    res.status(500).json({ error: err.message, logs: [] });
  }
});

// 2. GET LATEST LOGS
app.get('/api/logs/latest', (req, res) => {
  if (fs.existsSync(LOGS_FILE)) {
    const logs = JSON.parse(fs.readFileSync(LOGS_FILE));
    res.json(logs);
  } else {
    res.json([]);
  }
});

// 3. ANALYTICS SUMMARY
app.get('/api/analytics/summary', (req, res) => {
  const logs = fs.existsSync(LOGS_FILE)? JSON.parse(fs.readFileSync(LOGS_FILE)) : [];
  const errors = logs.filter(l => l.level === 'ERROR' || l.level === 'CRITICAL').length;
  const health = logs.length > 0? Math.max(0, 100 - errors * 5) : 98;

  res.json({
    totalLogs: logs.length,
    errors: errors,
    avgResponse: 234,
    health: health
  });
});

// 4. ANALYTICS TRENDS - FIX FOR EMPTY CHARTS
app.get('/api/analytics/trends', (req, res) => {
  const logs = fs.existsSync(LOGS_FILE)? JSON.parse(fs.readFileSync(LOGS_FILE)) : [];
  
  const last7Days = Array.from({length: 7}, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  const data = last7Days.map(date => {
    const dayLogs = logs.filter(l => l.timestamp.startsWith(date));
    return {
      date: date.split('-').slice(1).join('/'), // "08/03"
      errors: dayLogs.filter(l => l.level === 'ERROR' || l.level === 'CRITICAL').length,
      responseTime: 200 + Math.floor(Math.random() * 150)
    }
  });

  res.json(data);
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));