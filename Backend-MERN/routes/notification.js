import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import Notification from "../models/Notification.js";
import Log from "../models/Log.js";

const router = express.Router();

router.get("/", protect, async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    // User sees only own notifications, Admin sees all
    const filter = isAdmin? {} : { $or: [{ userId: req.user._id }, { user: req.user._id }] };

    let notifications = await Notification.find(filter).sort({ createdAt: -1 }).limit(30);

    // If no notifications collection, fallback to critical logs of that user
    if(notifications.length===0){
      const logFilter = isAdmin
       ? { level: { $in: ['CRITICAL','ERROR'] } }
        : { level: { $in: ['CRITICAL','ERROR'] }, $or: [{ user: req.user._id }, { userId: req.user._id }] };
      const criticalLogs = await Log.find(logFilter).sort({createdAt:-1}).limit(15);
      notifications = criticalLogs.map(l=>({
        _id: l._id,
        message: l.message,
        level: l.level,
        isRead: false,
        createdAt: l.timestamp || l.createdAt,
        userId: l.userId || l.user
      }));
    }

    const unreadCount = notifications.filter(n=>!n.isRead).length;
    res.json({ notifications, unreadCount, data: notifications });
  } catch(e) {
    console.error(e);
    res.json({ notifications: [], unreadCount: 0, data: [] });
  }
});

router.put("/read-all", protect, async (req, res) => {
  const isAdmin = req.user.role === 'admin';
  const filter = isAdmin? {} : { $or: [{ userId: req.user._id }, { user: req.user._id }] };
  await Notification.updateMany(filter, { isRead: true });
  res.json({ success: true });
});

export default router;