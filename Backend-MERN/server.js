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

// FINAL CORS - WORKS WITH VERCEL
app.use(cors({
  origin: "*",
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["*"],
  credentials: true
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
app.use('/api', aiAnalysisRoute);
app.use('/api', uploadRoute);

// REMOVE this line: app.listen(5000...)
// ADD THIS:

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`Local MERN on ${PORT}`));
}

export default app;
export default app;