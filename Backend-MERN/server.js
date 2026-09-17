import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import logRoutes from './routes/logs.js';
import uploadRoutes from './routes/upload.js';
import alertRoutes from './routes/alerts.js';
import notificationRoutes from './routes/notification.js';
import adminRoutes from './routes/admin.js';
import aiRoutes from './routes/aiAnalysis.js';
import debugRoutes from './routes/debug.js';
import { initDB } from './db.js';

dotenv.config();
const app = express();

app.use(cors({ origin: "*", methods: ["GET","POST","PUT","DELETE","OPTIONS"], allowedHeaders: ["Content-Type","Authorization"] }));
app.use(express.json({ limit: '10mb' }));

app.get('/', (req,res)=>res.json({message:"MERN API running - LogGuard AI v3"}));
app.use('/api/debug', debugRoutes);

app.get('/api/health', async (req, res) => {
  try {
    const conn = await initDB();
    res.json({ status: "ok", db: conn.connection.name, time: new Date() });
  } catch (e) {
    res.status(500).json({ status: "error", error: e.message });
  }
});

// DB connect middleware
app.use(async (req, res, next) => {
  try {
    await initDB();
    next();
  } catch (e) {
    res.status(500).json({ message: "DB Error: " + e.message });
  }
});

// ALL API ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/logs', logRoutes); // /api/logs/* -> me-role, latest, search, analytics, :id edit/delete
app.use('/api', uploadRoutes); // /api/upload
app.use('/api/alerts', alertRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes); // /api/admin/users
app.use('/api/ai', aiRoutes); // /api/ai/analyze

// Backward compat for frontend that calls /api/analytics directly
app.get('/api/analytics', async (req,res)=>{
  res.redirect(307, '/api/logs/analytics');
});

export default app;