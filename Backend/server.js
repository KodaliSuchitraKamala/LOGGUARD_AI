import express from 'express';
import http from 'http';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { Server } from 'socket.io';
import 'dotenv/config';

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "logguard_secret";

// --- FAKE DB ---
const users = [];

// --- MIDDLEWARE ---
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

// --- AUTH ROUTES ---
app.post('/api/auth/register', (req, res) => {
  const { email, password } = req.body;
  const user = { id: Date.now(), email, password };
  users.push(user);
  const token = jwt.sign({ id: user.id }, JWT_SECRET);
  res.json({ token, user: { email } });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(400).json({ message: "Invalid credentials" });
  const token = jwt.sign({ id: user.id }, JWT_SECRET);
  res.json({ token, user: { email } });
});

// --- PROTECTED LOG ROUTES ---
app.get('/api/logs', authMiddleware, (req, res) => {
  res.json({ logs: [] });
});

// --- SOCKET.IO ---
io.on('connection', (socket) => {
  console.log("Client connected:", socket.id);
  setInterval(() => {
    socket.emit("newLog", {
      id: Date.now(),
      level: "ERROR",
      message: "Live error from server",
      timestamp: new Date()
    });
  }, 5000);
});

const PORT = 5000;
server.listen(PORT, () => console.log(`Server running on ${PORT}`));