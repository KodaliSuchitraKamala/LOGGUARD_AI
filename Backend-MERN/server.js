import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import logRoutes from './routes/logs.js';
import { initDB } from './db.js';
import debugRoutes from 'routes/debug.js';

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

app.get('/api/health', async (req, res) => {
  try {
    const conn = await initDB();
    res.json({ status: "ok", db: "connected", dbName: conn.connection.name, hasUri: !!process.env.MONGODB_URI });
  } catch (e) {
    res.status(500).json({ status: "error", error: e.message, hasUri: !!process.env.MONGODB_URI });
  }
});

app.use(async (req, res, next) => {
  if (req.path === '/api/health' || req.method === "OPTIONS") return next();
  try {
    await initDB();
    next();
  } catch (e) {
    res.status(500).json({ message: "DB not connected: " + e.message });
  }
});

app.use('/api/debug', debugRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', logRoutes);
app.get('/', (req,res)=>res.json({message:"MERN API running - DB: logguard"}));

export default app;