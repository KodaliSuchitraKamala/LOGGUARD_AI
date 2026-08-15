import express from 'express';
import Log from '../models/Log.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    // Get last 24 hours of ERROR and CRITICAL logs
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const alerts = await Log.find({
      level: { $in: ['ERROR', 'CRITICAL'] },
      timestamp: { $gte: oneDayAgo }
    }).sort({ timestamp: -1 }).limit(20);

    res.json(alerts);
  } catch (error) {
    console.error("ALERTS ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;