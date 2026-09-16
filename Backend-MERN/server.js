import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { initDB } from './db.js';
import authRoute from './routes/auth.js';
import uploadRoute from './routes/upload.js';
import analyticsRoutes from './routes/analytics.js';
import logRoutes from './routes/logs.js'; // FIXED NAME
import alertRoutes from './routes/alerts.js';
import userRoutes from './routes/users.js';
import notificationRoutes from './routes/notification.js';
import aiAnalysisRoute from './routes/aiAnalysis.js';

dotenv.config();
const app = express();

app.use(cors({ origin: true, methods: ["GET","POST","PUT","DELETE","OPTIONS"], allowedHeaders: ["Content-Type", "Authorization"], credentials: false }));
app.use(express.json({ limit: '10mb' }));

await initDB().catch(e => console.log("DB Error", e.message));

app.get("/", (req,res)=>res.send("LogGuard API Running ✅"));
app.get("/api/health", (req,res)=>res.json({ status: "Running", db: mongoose.connection.readyState === 1 }));

app.use('/api/auth', authRoute);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', aiAnalysisRoute);
app.use('/api', uploadRoute);

app.use((req, res) => res.status(404).json({ message: `Route ${req.originalUrl} not found` }));

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') app.listen(PORT, () => console.log(`Local on ${PORT}`));
export default app;