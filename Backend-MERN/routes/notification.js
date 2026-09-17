import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import Notification from "../models/Notification.js";
import Alert from "../models/Alerts.js";
import Log from "../models/Log.js";

const router = express.Router();

router.get("/", protect, async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const userFilter = isAdmin ? {} : { $or: [{ userId: req.user._id }, { user: req.user._id }] };

    let notifications = await Notification.find(userFilter).sort({ createdAt: -1 }).limit(20);
    
    if (notifications.length > 0) {
      const unreadCount = await Notification.countDocuments({ ...userFilter, isRead: false });
      return res.json({ notifications, unreadCount });
    }

    let alerts = await Alert.find(userFilter).sort({ timestamp: -1 }).limit(10);
    if (alerts.length > 0) {
      notifications = alerts.map(a => ({
        _id: a._id,
        message: a.message,
        level: a.level,
        isRead: a.acknowledged || false,
        createdAt: a.timestamp
      }));
      return res.json({ notifications, unreadCount: notifications.filter(n=>!n.isRead).length });
    }

    const logFilter = isAdmin ? { level: /critical/i } : { level: /critical/i, $or: [{ user: req.user._id }, { userId: req.user._id }] };
    const criticalLogs = await Log.find(logFilter).sort({ timestamp: -1 }).limit(10);
    notifications = criticalLogs.map(log => ({
      _id: log._id,
      message: log.message,
      level: log.level || 'CRITICAL',
      isRead: false,
      createdAt: log.timestamp
    }));

    res.json({ notifications, unreadCount: notifications.length });
  } catch(e) {
    res.json({ notifications: [], unreadCount: 0 });
  }
});

router.put("/read-all", protect, async (req, res) => {
  const filter = req.user.role === 'admin' ? {} : { $or: [{ userId: req.user._id }, { user: req.user._id }] };
  await Notification.updateMany(filter, { isRead: true });
  await Alert.updateMany(filter, { acknowledged: true });
  res.json({ success: true });
});

export default router;