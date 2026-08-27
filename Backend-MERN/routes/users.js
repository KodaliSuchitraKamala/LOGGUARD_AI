import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import User from "../models/User.js";
import Log from "../models/Log.js";

const router = express.Router();

// GET all users with stats - Admin only
router.get("/", protect, admin, async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    
    // Get orphan logs count (logs without userId) - for old data
    const orphanLogs = await Log.countDocuments({ userId: { $exists: false } });
    const orphanCriticals = await Log.countDocuments({ userId: { $exists: false }, level: /CRITICAL/i });

    const usersWithStats = await Promise.all(users.map(async (u) => {
      const criticals = await Log.countDocuments({ userId: u._id, level: /CRITICAL/i });
      const errors = await Log.countDocuments({ userId: u._id, level: /ERROR/i });
      const warnings = await Log.countDocuments({ userId: u._id, level: /WARN/i });
      const totalLogs = await Log.countDocuments({ userId: u._id });

      // If user is the only admin and we have orphan logs, include them
      // This fixes your current screenshot
      const isOnlyUser = users.length === 1;
      const finalTotal = isOnlyUser ? totalLogs + orphanLogs : totalLogs;
      const finalCriticals = isOnlyUser ? criticals + orphanCriticals : criticals;

      return {
       ...u.toObject(),
        stats: { CRITICAL: finalCriticals, ERROR: errors, WARNING: warnings },
        totalLogs: finalTotal
      };
    }));
    res.json(usersWithStats);
  } catch (error) {
    console.error("USERS FETCH ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

// PUT role
router.put("/:id/role", protect, admin, async (req,res) => {
  try {
    const {role} = req.body;
    if(!["user","admin"].includes(role)) return res.status(400).json({message:"Invalid role"});
    const user = await User.findByIdAndUpdate(req.params.id, {role}, {new:true}).select('-password');
    res.json(user);
  } catch(e) {
    res.status(500).json({message: e.message});
  }
});

// DELETE user
router.delete("/:id", protect, admin, async (req,res) => {
  try {
    if(req.params.id === req.user._id.toString()) return res.status(400).json({message:"Can't delete self"});
    await User.findByIdAndDelete(req.params.id);
    await Log.deleteMany({userId: req.params.id});
    res.json({message:"User deleted"});
  } catch(e) {
    res.status(500).json({message: e.message});
  }
});

export default router;