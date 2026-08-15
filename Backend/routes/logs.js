import express from 'express';
import Log from '../models/Log.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/latest', authMiddleware, async (req, res) => {
  try {
    const logs = await Log.find().sort({ timestamp: -1 }).limit(50);
    res.json(logs);
  } catch (error) {
    console.error("LOGS ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;