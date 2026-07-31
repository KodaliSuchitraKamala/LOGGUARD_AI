import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import multer from 'multer'; // 1. Import multer
import fs from 'fs'; // 2. Import fs

const app = express(); // 3. app must come first
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:5173", methods: ["GET", "POST"] }
});

app.use(cors());
app.use(express.json());

// 4. Setup multer AFTER app is defined
const upload = multer({ dest: 'uploads/' });

// 5. Upload endpoint
app.post('/upload', upload.single('logfile'), (req, res) => {
  const data = fs.readFileSync(req.file.path, 'utf8');
  const lines = data.split('\n').slice(0, 200); // read first 200 lines
  
  lines.forEach(line => {
    if(line.trim() !== '') {
      const level = line.includes('ERROR') ? 'ERROR' : 'INFO';
      io.emit('newLog', { 
        id: Date.now() + Math.random(), 
        timestamp: new Date().toLocaleTimeString(), 
        level: level, 
        message: line.substring(0, 150),
        isAnomaly: line.includes('DDOS') || line.includes('Failed')
      });
    }
  });
  res.json({ message: 'File processed', lines: lines.length });
});


io.on('connection', (socket) => {
  console.log('Client connected');
});

// Fake logs - delete this later
setInterval(() => {
  io.emit('newLog', { 
    id: Date.now(), 
    timestamp: new Date().toLocaleTimeString(), 
    level: 'INFO', 
    message: 'Waiting for file upload...',
    isAnomaly: false
  });
}, 10000);

server.listen(5000, () => console.log('Backend on 5000'));