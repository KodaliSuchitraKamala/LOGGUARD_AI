import express from 'express';
import multer from 'multer';
import fs from 'fs';
import readline from 'readline';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

// 1. MIDDLEWARE
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// 2. IN-MEMORY DB + SEED DATA
let allLogs = [
  {id: 1, timestamp: "2025-04-05 10:00:01", level: "INFO", message: "Server started on port 5000"},
  {id: 2, timestamp: "2025-04-05 10:00:05", level: "ERROR", message: "Database connection failed"},
  {id: 3, timestamp: "2025-04-05 10:00:10", level: "WARN", message: "High memory usage: 85%"},
  {id: 4, timestamp: "2025-04-05 10:00:15", level: "INFO", message: "User login: rahul@guntur.com"},
];

// 3. MULTER SETUP
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// 4. ROUTES
// GET all logs
app.get('/api/logs', (req, res) => {
    res.json({ success: true, logs: allLogs.slice(-500) });
});

// UPLOAD and parse log file
app.post('/api/upload', upload.single('logfile'), async (req, res) => {
    try {
        const filePath = req.file.path;
        const newLogs = [];
        const rl = readline.createInterface({ input: fs.createReadStream(filePath), crlfDelay: Infinity });

        for await (const line of rl) {
            if (!line.trim()) continue;
            const parts = line.split('|');
            const log = {
                id: allLogs.length + newLogs.length + 1,
                timestamp: parts[0]?.trim() || new Date().toISOString(),
                level: parts[1]?.trim().toUpperCase() || 'INFO',
                message: parts[2]?.trim() || line
            };
            newLogs.push(log);
            io.emit('newLog', log); // stream live
        }
        allLogs = [...allLogs,...newLogs]; // APPEND
        fs.unlinkSync(filePath);
        res.json({ success: true, totalLogs: newLogs.length, logs: newLogs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 5. SOCKET.IO
const io = new Server(httpServer, {
  cors: { origin: "http://localhost:5173", methods: ["GET", "POST"] }
});
io.on('connection', (socket) => console.log('Client connected:', socket.id));

const PORT = 5000;
httpServer.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));