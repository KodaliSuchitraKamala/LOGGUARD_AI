import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js"; // both
import User from "../models/User.js";
const router = express.Router();

// @route GET /api/users - Admin only
router.get("/", protect, admin, async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;