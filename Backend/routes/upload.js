import express from 'express';
import multer from 'multer';
import fs from 'fs';
import { db } from '../db.js';
import auth from '../middleware/auth.js';
import { sendEmail } from '../emailService.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

const parseLogLine = (line) => {
  const parts = line.split('|').map(p => p.trim());
  if(parts.length < 3) return null;

  const timestamp = parts[0];
  const level = parts[1];
  const message = parts[2];
  const responseTime = parts[3]? parseInt(parts[3]) : 0; // NEW

  return {
    timestamp: new Date(timestamp).toISOString(),
    level: level,
    message: message,
    responseTime: responseTime // NEW
  }
}

const getLogLevel = (line) => {
  if(line.includes('CRITICAL')) return 'CRITICAL';
  if(line.includes('ERROR')) return 'ERROR';
  if(line.includes('WARNING')) return 'WARNING';
  return 'INFO';
}

router.post('/upload', auth, upload.single('logFile'), async (req, res) => {
    try {
        if(!req.file) return res.status(400).json({error: 'No file uploaded'});
        const content = fs.readFileSync(req.file.path, 'utf-8');
        const lines = content.split('\n').filter(l => l.trim());

        await db.read();

        const newLogs = [];
        const newAlerts = [];

        for(const line of lines){
          const parsed = parseLogLine(line);
          if(!parsed) continue;

          const logEntry = {
            id: `${Date.now()}-${Math.random()}`,
            userId: req.user.id,
            level: parsed.level,
            message: parsed.message,
            filename: req.file.originalname,
            timestamp: parsed.timestamp, // NOW USING REAL TIMESTAMP
            acknowledged: false
          };
          newLogs.push(logEntry);
          if(['ERROR', 'CRITICAL'].includes(parsed.level)){
            newAlerts.push(logEntry);
          }
        }

        db.data.logs.push(...newLogs);
        db.data.alerts.push(...newAlerts);
        await db.write();
        fs.unlinkSync(req.file.path);

        for(const alert of newAlerts) {
            const html = `<h2>LogGuard AI Alert: ${alert.level}</h2><p><b>Time:</b> ${alert.timestamp}</p><p><b>Message:</b> ${alert.message}</p>`;
            await sendEmail(process.env.ALERT_EMAIL, `LogGuard AI ${alert.level} Alert`, html);
        };

        res.json({ message: `Uploaded ${newLogs.length} logs. Found ${newAlerts.length} alerts.` });
    } catch (err) {
        console.error("Upload Error: ", err);
        res.status(500).json({ error: err.message })
    }
});

export default router;