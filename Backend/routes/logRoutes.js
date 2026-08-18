import express from "express";
import Log from "../models/Log.js";
import Alert from "../models/Alerts.js";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();

// POST /api/logs - ingest log
router.post("/", protect, async (req, res) => { // protect it
  const { level, message, source } = req.body;
  const log = await Log.create({ level, message, source, userId: req.user._id });

  if (level === "critical") {
    await Alert.create({ logId: log._id, message: `Critical: ${message}`, userId: req.user._id });
    req.app.get('io').emit('new_alert', { message }); // emit
  }
  req.app.get('io').emit('new_log');
  res.status(201).json(log);
});

// GET /api/logs - get all logs
router.get("/", protect, async (req, res) => {
  const logs = await Log.find().sort({ timestamp: -1 }).limit(100);
  res.json(logs);
});

// GET /api/logs/latest - NEW for App.jsx
router.get("/latest", protect, async (req, res) => {
  const logs = await Log.find().sort({ timestamp: -1 }).limit(50);
  res.json(logs);
});

export default router;