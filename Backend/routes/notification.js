import express from 'express';
import Notification from '../models/Notification.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(50);
    const unreadCount = await Notification.countDocuments({ userId: req.user._id, isRead: false });
    res.json({ notifications, unreadCount });
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.put('/read-all', protect, async (req, res) => {
  await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true });
  req.app.get('io').emit('notificationRead');
  res.json({ success: true });
});

router.put('/:id/read', protect, async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
  req.app.get('io').emit('notificationRead');
  res.json({ success: true });
});

router.delete('/:id', protect, async (req, res) => {
  await Notification.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

export default router;