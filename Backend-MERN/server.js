import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { initDB } from './db.js';
import authRoute from './routes/auth.js';
import uploadRoute from './routes/upload.js';
import analyticsRoutes from './routes/analytics.js';
import logRoutes from './routes/logRoutes.js';
import alertRoutes from './routes/alerts.js';
import userRoutes from './routes/users.js';
import notificationRoutes from './routes/notification.js';
import aiAnalysisRoute from './routes/aiAnalysis.js';

dotenv.config();
process.removeAllListeners('warning');
const app = express();

// FINAL CORS - WORKS WITH VERCEL FRONTEND
app.use(cors({
  origin: function(origin, cb) {
    // allow all vercel + localhost for demo
    if (!origin) return cb(null, true);
    cb(null, true);
  },
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  credentials: false // MUST be false when origin is *
}));
app.options("*", cors());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

try { 
  await initDB(); 
  console.log("✅ MongoDB Connected"); 
} catch(e){ console.log("DB Error:", e.message); }

app.get("/", (req,res)=>res.send("LogGuard API Running ✅"));
app.get("/api/health", (req,res)=>res.json({ 
  status: "LogGuard AI Running 🚀", 
  db: mongoose.connection.readyState === 1,
  time: new Date() 
}));

app.use('/api/auth', authRoute);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);

// FIXED TYPO: was /api/ai/analze -> now /api/ai
app.use('/api/ai', aiAnalysisRoute);

// Upload route: handles /api/upload/upload
app.use('/api', uploadRoute);

// 404 handler for debugging
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`Local MERN on ${PORT}`));
}

export default app;