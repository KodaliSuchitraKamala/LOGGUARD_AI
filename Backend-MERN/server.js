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

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://logguard-ai-frontend.vercel.app",
  "https://logguard-ai-frontend-cc19eiwcj-log-guard-ai.vercel.app",
  "https://logguard-ai.vercel.app",
  "https://logguardai.vercel.app"
];

app.use(cors({ 
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || origin.includes("vercel.app")) {
      callback(null, true);
    } else {
      callback(null, true); // temporarily allow all for debug
    }
  }, 
  credentials: true,
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization","X-Requested-With"]
}));
app.options('*', cors()); // handle preflight

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

let dbConnected = false;
let dbError = null;

try { 
  await initDB(); 
  dbConnected = true; 
  console.log("✅ MongoDB Connected & API Ready"); 
} catch(e){ 
  dbError = e.message;
  console.log("DB Error:", e.message); 
}

app.get("/", (req,res)=>res.send("LogGuard API Running ✅"));
app.get("/api/health", (req,res)=>{
  res.json({ 
    status: "LogGuard AI Running 🚀", 
    db: mongoose.connection.readyState === 1,
    readyState: mongoose.connection.readyState,
    dbError: mongoose.connection.readyState !== 1 ? dbError : null,
    time: new Date() 
  });
});

app.use('/api/auth', authRoute);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api', aiAnalysisRoute);
app.use('/api', uploadRoute);

export default app;