import express from 'express';
import Log from '../models/Log.js';
import Notification from '../models/Notification.js';
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

// This is called from upload route to create notifications
router.post('/create-notifs', authMiddleware, async (req, res) => {
  try {
    const { logs } = req.body;
    const criticalLogs = logs.filter(l => l.level === 'CRITICAL');
    
    if(criticalLogs.length > 0){
      const notifs = criticalLogs.map(log => ({
        userId: req.user._id,
        type: 'CRITICAL',
        message: log.message || log.raw,
        logId: log._id,
        isRead: false
      }));
      await Notification.insertMany(notifs);
      
      // Emit socket
      const io = req.app.get('io');
      io.emit('newNotification');
    }
    res.json({ success: true });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;