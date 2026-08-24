import express from "express";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();

router.get("/", protect, (req, res) => {
  res.json({ notifications: [], unreadCount: 0 });
});

router.put("/read-all", protect, (req, res) => {
  res.json({ success: true });
});

export default router;