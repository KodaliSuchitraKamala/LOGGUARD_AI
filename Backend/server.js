import express from 'express';
import multer from 'multer';
import cors from 'cors';
import 'dotenv/config';
import { createServer } from 'http';
import { Server } from 'socket.io';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });

const PORT = 5000;

// Create uploads folder
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)){ fs.mkdirSync(uploadDir); }

app.use(cors());
app.use(express.json());

// TEST ROUTE
app.get('/', (req, res) => res.send('LogGuard Backend is Running'));

let logs = [];

// Multer setup
const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// GET logs
app.get('/api/logs', (req, res) => {
    res.json(logs);
});

// POST upload - THIS IS WHAT WAS MISSING
app.post('/api/upload', upload.single('file'), (req, res) => {
    console.log("FILE RECEIVED:", req.file.filename); // you should see this in terminal
    if(!req.file) return res.status(400).json({ error: 'No file uploaded' });
    
    const data = fs.readFileSync(req.file.path, 'utf-8');
    const lines = data.split('\n');
    let count = 0;
    
    lines.forEach(line => {
        if(line.trim()){
            const [timestamp, level,...messageParts] = line.split('|');
            const newLog = {
                id: logs.length + 1,
                timestamp: timestamp || new Date().toISOString(),
                level: level || 'INFO',
                message: messageParts.join('|')
            };
            logs.push(newLog);
            io.emit('newLog', newLog); // for Day 10
            count++;
        }
    });
    res.json({ status: 'File Uploaded', logsAdded: count, logs: logs.slice(-50) });
});

httpServer.listen(PORT, () => console.log(`✅ Backend running on http://localhost:${PORT}`));