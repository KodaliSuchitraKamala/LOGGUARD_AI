import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import logRoutes from './routes/logs.js';
import uploadRoutes from './routes/upload.js';
import alertRoutes from './routes/alerts.js';
import notificationRoutes from './routes/notification.js';
import adminRoutes from './routes/admin.js';
import debugRoutes from './routes/debug.js';
import aiRoutes from './routes/aiAnalysis.js'; // <-- ADD THIS
import { initDB } from './db.js';

dotenv.config();
const app = express();

app.use(cors({ origin: "*" }));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(204).end();
  next();
});
app.use(express.json());

app.get('/', (req,res)=>res.json({message:"MERN API running - LogGuard AI"}));
app.use('/api/debug', debugRoutes);

app.get('/api/health', async (req, res) => {
  try {
    const conn = await initDB();
    res.json({ status: "ok", db: conn.connection.name });
  } catch (e) {
    res.status(500).json({ status: "error", error: e.message });
  }
});

app.use(async (req, res, next) => {
  try {
    await initDB();
    next();
  } catch (e) {
    res.status(500).json({ message: "DB Error: " + e.message });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/logs', logRoutes);
app.use('/api', uploadRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes); // <-- FIX 404 for /api/ai/analyze
app.use('/api', logRoutes); // for /api/analytics backward compat

export default app;