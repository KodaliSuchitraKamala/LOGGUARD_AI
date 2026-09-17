import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import logRoutes from './routes/logs.js';
import debugRoutes from './routes/debug.js';
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

// ---- NO DB NEEDED ROUTES FIRST ----
app.get('/', (req,res)=>res.json({message:"MERN API running"}));
app.use('/api/debug', debugRoutes);

app.get('/api/health', async (req, res) => {
  try {
    const conn = await initDB();
    res.json({ status: "ok", db: conn.connection.name, hasUri: !!process.env.MONGODB_URI });
  } catch (e) {
    res.status(500).json({ status: "error", error: e.message, hasUri: !!process.env.MONGODB_URI, envKeys: Object.keys(process.env).filter(k=>k.includes('MONGO')) });
  }
});

// ---- DB MIDDLEWARE AFTER ----
app.use(async (req, res, next) => {
  try {
    await initDB();
    next();
  } catch (e) {
    res.status(500).json({ message: "DB Error: " + e.message });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api', logRoutes);

export default app;