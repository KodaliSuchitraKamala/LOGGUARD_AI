import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import Notification from "../models/Notification.js";
import Alert from "../models/Alerts.js";
import Log from "../models/Log.js";

const router = express.Router();

router.get("/", protect, async (req, res) => {
  try {
    // Priority 1: Real notifications collection
    let notifications = await Notification.find().sort({ createdAt: -1 }).limit(20);
    
    if (notifications.length > 0) {
      const unreadCount = await Notification.countDocuments({ isRead: false });
      console.log(`Returning ${notifications.length} from notifications collection`);
      return res.json({ notifications, unreadCount });
    }

    // Priority 2: Alerts collection fallback
    let alerts = await Alert.find().sort({ timestamp: -1 }).limit(10);
    if (alerts.length > 0) {
      notifications = alerts.map(a => ({
        _id: a._id,
        message: a.message,
        level: a.level,
        isRead: a.acknowledged || false,
        createdAt: a.timestamp || a.createdAt
      }));
      return res.json({ notifications, unreadCount: notifications.filter(n=>!n.isRead).length });
    }

    // Priority 3: Critical logs fallback - GUARANTEED
    const criticalLogs = await Log.find({ level: /critical/i }).sort({ timestamp: -1 }).limit(10);
    notifications = criticalLogs.map(log => ({
      _id: log._id,
      message: log.message,
      level: log.level || 'CRITICAL',
      isRead: false,
      createdAt: log.timestamp || log.createdAt
    }));

    console.log(`Returning ${notifications.length} from logs fallback`);
    res.json({ notifications, unreadCount: notifications.length });

  } catch(e) {
    console.log("Notification error:", e.message);
    res.json({ notifications: [], unreadCount: 0 });
  }
});

router.put("/read-all", protect, async (req, res) => {
  try {
    await Notification.updateMany({}, { isRead: true });
    await Alert.updateMany({}, { acknowledged: true });
    res.json({ success: true });
  } catch(e) {
    res.json({ success: true });
  }
});

export default router;