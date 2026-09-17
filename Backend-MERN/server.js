import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { initDB } from './db.js';
import authRoute from './routes/auth.js';
import uploadRoute from './routes/upload.js';
import analyticsRoutes from './routes/analytics.js';
import logRoutes from './routes/logs.js';
import alertRoutes from './routes/alerts.js';
import userRoutes from './routes/users.js';
import notificationRoutes from './routes/notification.js';
import aiAnalysisRoute from './routes/aiAnalysis.js';

dotenv.config();
const app = express();

// CORS FIRST
app.use(cors({ origin: "*", methods: ["GET","POST","PUT","DELETE","OPTIONS"], allowedHeaders: ["Content-Type","Authorization","X-Requested-With"] }));
app.use((req,res,next)=>{
  res.header("Access-Control-Allow-Origin","*");
  res.header("Access-Control-Allow-Methods","GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers","Content-Type, Authorization");
  if(req.method==="OPTIONS") return res.sendStatus(200);
  next();
});

app.use(express.json({ limit: '10mb' }));

let isConnected = false;
app.use(async (req,res,next)=>{
  if(!isConnected){ try{ await initDB(); isConnected=true; } catch(e){ console.log(e.message); } }
  next();
});

app.get("/", (req,res)=>res.json({ status:"Running ✅" }));
app.get("/api/health", (req,res)=>res.json({ status:"Running", db: mongoose.connection.readyState }));

app.use('/api/auth', authRoute);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', aiAnalysisRoute);
app.use('/api', uploadRoute);

export default app;