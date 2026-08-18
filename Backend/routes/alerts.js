import express from "express";
import Alert from "../models/Alerts.js";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();

// GET /api/alerts - get user's alerts
router.get("/", protect, async (req, res) => {
  const alerts = await Alert.find({ userId: req.user._id }).sort({ timestamp: -1 }).limit(50);
  res.json(alerts);
});

// PUT /api/alerts/:id/acknowledge
router.put("/:id/acknowledge", protect, async (req, res) => {
  const alert = await Alert.findById(req.params.id);
  if (!alert) return res.status(404).json({ message: "Alert not found" });
  if (alert.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ message: "Not authorized" });
  }
  alert.acknowledged = true;
  await alert.save();
  res.json(alert);
});

export default router;