import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import logRoutes from './routes/logs.js';

dotenv.config();
const app = express();

// CRASH PROOF CORS - must be first
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(204).end();
  next();
});

app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "10mb" }));

let isConnected = false;
async function initDB() {
  if (isConnected) return;
  if (!process.env.MONGODB_URI) {
    console.error("MISSING MONGODB_URI");
    return;
  }
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;
    console.log("Mongo connected");
  } catch (e) {
    console.error("Mongo error", e.message);
  }
}

// Lazy DB connect middleware
app.use(async (req, res, next) => {
  if (req.method === "OPTIONS") return next();
  await initDB();
  next();
});

app.get('/api/health', (req, res) => {
  res.json({ status: "ok", db: isConnected ? "connected" : "not-connected", time: new Date() });
});

app.use('/api/auth', authRoutes);
app.use('/api', logRoutes);

app.get('/', (req,res) => res.json({ message: "LogGuard MERN API running" }));

// IMPORTANT FOR VERCEL - don't use app.listen()
export default app;