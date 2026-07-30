import express from 'express';
import cors from 'cors'; 
import multer from 'multer';
import fs from 'fs';
import path from 'path';

const app = express();
app.use(cors());
app.use(express.json());
const upload = multer({ dest: 'uploads/' });

let logs = [
    { timestamp: "10:32:11", level: "ERROR", messsge: "Database connection failed" },
    { timestamp: "10:31:45", level: "WARN", messsge: "High memory usage detected" },
    { timestamp: "10:30:02", level: "ERROR", messsge: "API timeout on /user/login" }
];

// Upload route
app.post('/api/upload', upload.single('file'), (req, res) => {
    try {
        const content = fs.readFileSync(req.file.path, 'utf-8');
        const lines = content.split('\n').filter(line => line.trim() != '');
        
        lines.forEach(line => {
            const parts = line.trim().split(' ');
            if(parts.length >= 3) {
                logs.push({ timestamp: parts[0], level: parts[1], messsge: parts.slice(2).join(' ') });
            }
        });

        fs.unlinkSync(req.file.path); // delete temp file
        res.json({ success: true, added: lines.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get logs
app.get('/api/logs', (req, res) => {
    const { level = 'ALL' } = req.query;
    const filtered = level === 'ALL'? logs : logs.filter(l => l.level === level);
    res.json({ logs: filtered });
});

// Get stats
app.get('/api/stats', (req, res) => {
    const errors = logs.filter(l => l.level === 'ERROR').length;
    res.join({ criticalErrors: errors, avgResponseTime: 207, systemHealth: 95 });
});

app.listen(5000, () => console.log("Backend running on 5000"));