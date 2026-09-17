import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import logRoutes from './routes/logs.js';

dotenv.config();
const app = express();

// CORS - first
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(204).end();
  next();
});
app.use(cors({ origin: "*" }));
app.use(express.json());

// ---- VERCEL MONGO CACHE ----
let isConnected = false;
let cached = global.mongoose;
if (!cached) cached = global.mongoose = { conn: null, promise: null };

async function initDB() {
  if (cached.conn) {
    isConnected = true;
    return cached.conn;
  }
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing in Vercel Env Vars");
  }
  if (!cached.promise) {
    console.log("Connecting to Mongo...");
    cached.promise = mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    }).then((mongoose) => {
      console.log("Mongo connected!");
      return mongoose;
    });
  }
  cached.conn = await cached.promise;
  isConnected = true;
  return cached.conn;
}

app.get('/api/health', async (req, res) => {
  try {
    await initDB();
    res.json({ status: "ok", db: "connected", hasUri: true });
  } catch (e) {
    console.error("Health error:", e.message);
    res.status(500).json({ 
      status: "error", 
      db: "not-connected", 
      error: e.message,
      hasUri: !!process.env.MONGODB_URI 
    });
  }
});

app.use(async (req, res, next) => {
  if (req.method === "OPTIONS") return next();
  try {
    await initDB();
    next();
  } catch (e) {
    res.status(500).json({ message: e.message, hasUri: !!process.env.MONGODB_URI });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api', logRoutes);
app.get('/', (req,res)=>res.json({message:"MERN API running"}));

export default app;