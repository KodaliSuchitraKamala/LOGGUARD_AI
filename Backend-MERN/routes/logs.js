import express from 'express';
import Log from '../models/Log.js';
import Notification from '../models/Notification.js';
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get('/latest', protect, async (req, res) => {
  try {
    const isAdmin = req.user?.role === 'admin';
    // FIXED: Strict user isolation - removed { $exists: false } leak
    const filter = isAdmin? {} : {
      $or: [
        { userId: req.user._id },
        { user: req.user._id }
      ]
    };
    const logs = await Log.find(filter).sort({ createdAt: -1, timestamp: -1 }).limit(100);
    res.json(logs);
  } catch (error) {
    console.error("LOGS ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/create-notifs', protect, async (req, res) => {
  try {
    const { logs } = req.body;
    const criticalLogs = logs.filter(l => l.level === 'CRITICAL' || l.level === 'ERROR');
    if(criticalLogs.length > 0){
      const notifs = criticalLogs.map(log => ({
        userId: req.user._id,
        user: req.user._id,
        type: 'CRITICAL',
        message: log.message || log.raw,
        logId: log._id,
        isRead: false
      }));
      await Notification.insertMany(notifs);
      try {
        const io = req.app.get('io');
        if(io) io.emit('newNotification');
      } catch {}
    }
    res.json({ success: true });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;