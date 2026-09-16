import express from 'express';
import Log from '../models/Log.js';
import Notification from '../models/Notification.js';
import { protect } from "../middleware/auth.js"; // FIXED PATH

const router = express.Router();

// GET Latest - Per User (Your Day 49 fix)
router.get('/latest', protect, async (req, res) => {
  try {
    const filter = { $or: [{ userId: req.user._id }, { user: req.user._id }] };
    const logs = await Log.find(filter).sort({ createdAt: -1, timestamp: -1 }).limit(100);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// NEW: GET /me - To show live role in UI
router.get('/me-role', protect, async (req, res) => {
  res.json({ _id: req.user._id, email: req.user.email, role: req.user.role });
});

// NEW: UPDATE LOG
router.put('/:id', protect, async (req, res) => {
  try {
    const { message, level } = req.body;
    const filter = { _id: req.params.id, $or: [{ userId: req.user._id }, { user: req.user._id }] };
    const updated = await Log.findOneAndUpdate(filter, { message, level, raw: message }, { new: true });
    if (!updated) return res.status(404).json({ message: "Log not found or not yours" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// NEW: DELETE LOG
router.delete('/:id', protect, async (req, res) => {
  try {
    const filter = { _id: req.params.id, $or: [{ userId: req.user._id }, { user: req.user._id }] };
    const deleted = await Log.findOneAndDelete(filter);
    if (!deleted) return res.status(404).json({ message: "Log not found or not yours" });
    try { req.app.get('io')?.emit('log_deleted', deleted._id); } catch {}
    res.json({ success: true, id: deleted._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/create-notifs', protect, async (req, res) => {
  try {
    const { logs } = req.body;
    const criticalLogs = logs.filter(l => l.level === 'CRITICAL' || l.level === 'ERROR');
    if(criticalLogs.length > 0){
      const notifs = criticalLogs.map(log => ({
        userId: req.user._id, user: req.user._id,
        type: 'CRITICAL', message: log.message || log.raw,
        logId: log._id, isRead: false
      }));
      await Notification.insertMany(notifs);
      try { req.app.get('io')?.emit('newNotification'); } catch {}
    }
    res.json({ success: true });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;