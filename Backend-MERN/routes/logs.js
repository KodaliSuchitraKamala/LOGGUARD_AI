import express from 'express';
import Log from '../models/Log.js';
import { protect } from "../middleware/authMiddleware.js"; // FIXED: ../middleware/

const router = express.Router();

router.get('/latest', protect, async (req, res) => {
  const filter = { $or: [{ userId: req.user._id }, { user: req.user._id }] };
  const logs = await Log.find(filter).sort({ createdAt: -1 }).limit(100);
  res.json(logs);
});

router.get('/search', protect, async (req, res) => {
  const { keyword, level } = req.query;
  let filter = { $or: [{ userId: req.user._id }, { user: req.user._id }] };
  if (keyword) filter.message = { $regex: keyword, $options: 'i' };
  if (level && level!== 'ALL') filter.level = level;
  const logs = await Log.find(filter).sort({ createdAt: -1 }).limit(100);
  res.json(logs);
});

router.get('/me-role', protect, async (req, res) => {
  res.json({ _id: req.user._id, email: req.user.email, role: req.user.role, name: req.user.name });
});

router.put('/:id', protect, async (req, res) => {
  try {
    const { message, level } = req.body;
    const filter = { _id: req.params.id, $or: [{ userId: req.user._id }, { user: req.user._id }] };
    const updated = await Log.findOneAndUpdate(filter, { message, level: level.toUpperCase(), raw: message }, { new: true });
    if (!updated) return res.status(404).json({ message: "Not found or not yours" });
    res.json(updated);
  } catch(e) { res.status(500).json({ message: e.message }); }
});

router.delete('/:id', protect, async (req, res) => {
  const filter = { _id: req.params.id, $or: [{ userId: req.user._id }, { user: req.user._id }] };
  const deleted = await Log.findOneAndDelete(filter);
  if (!deleted) return res.status(404).json({ message: "Not found" });
  res.json({ success: true });
});

export default router;