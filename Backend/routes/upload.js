import express from 'express';
import multer from 'multer';
import fs from 'fs';
import { db } from '../db.js';
import auth from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';
import { io } from '../server.js';
import { sendAlert } from '../services/alertService.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/upload', auth, upload.single('logfile'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No file uploaded" });

        const fileContent = fs.readFileSync(req.file.path, 'utf8');
        const lines = fileContent.split('\n');
        const newLogs = [];

        await db.read();

        lines.forEach(line => {
            if (line.trim() === '') return;
            const parts = line.split('|').map(p => p.trim());

            if (parts.length >= 4) {
                const [timestamp, level, message, responseTimeStr] = parts;
                const responseTime = parseInt(responseTimeStr.replace('ms', '')) || 0;
                const logId = uuidv4();

                const log = { id: logId, userId: req.user.id, timestamp, level, message, responseTime };
                newLogs.push(log);

                // Auto-generate alerts
                if(level === 'ERROR' || level === 'CRITICAL'){
                    const alert = { id: uuidv4(), userId: req.user.id, logId, level, message, timestamp, acknowledged: false }
                    db.data.alerts.push(alert);
                    io.emit('new_alert', {...alert, userEmail: req.user.email });

                    // Instant email for CRITICAL
                    if(level === 'CRITICAL'){
                        sendAlert('Critical Log Detected', 'CRITICAL', message, 1);
                    }
                }
            }
        });

        if(newLogs.length === 0) return res.status(400).json({ error: "No valid log lines found" });

        db.data.logs.push(...newLogs);
        await db.write();

        // Check threshold for failed logins
        const failedLogins = newLogs.filter(l => l.level === 'ERROR' && l.message.toLowerCase().includes('login failed')).length;
        if(failedLogins >= parseInt(process.env.ALERT_THRESHOLD_FAILED_LOGINS)){
            sendAlert('Failed Login Threshold', 'ERROR', `${failedLogins} Failed Login Attempts`, failedLogins);
        }

        io.emit('new_log', { userId: req.user.id, count: newLogs.length });

        fs.unlinkSync(req.file.path);
        res.json({ success: true, count: newLogs.length, message: `${newLogs.length} logs uploaded successfully` });

    } catch (error) {
        console.error("UPLOAD ERROR:", error);
        res.status(500).json({ error: error.message });
    }
});

export default router;