import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import User from "../models/User.js";
import Log from "../models/Log.js";

const router = express.Router();

router.get("/", protect, admin, async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    const orphanLogs = await Log.countDocuments({ userId: { $exists: false } });
    const orphanCriticals = await Log.countDocuments({ userId: { $exists: false }, level: /CRITICAL/i });

    const usersWithStats = await Promise.all(users.map(async (u) => {
      const criticals = await Log.countDocuments({ userId: u._id, level: /CRITICAL/i });
      const totalLogs = await Log.countDocuments({ userId: u._id });
      const isOnlyUser = users.length === 1;
      return {
        ...u.toObject(),
        stats: { CRITICAL: isOnlyUser ? criticals + orphanCriticals : criticals },
        totalLogs: isOnlyUser ? totalLogs + orphanLogs : totalLogs
      };
    }));
    res.json(usersWithStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id/role", protect, admin, async (req,res) => {
  const {role} = req.body;
  if(!["user","admin"].includes(role)) return res.status(400).json({message:"Invalid role"});
  const user = await User.findByIdAndUpdate(req.params.id, {role}, {new:true}).select('-password');
  res.json(user);
});

router.delete("/:id", protect, admin, async (req,res) => {
  if(req.params.id === req.user._id.toString()) return res.status(400).json({message:"Can't delete self"});
  await User.findByIdAndDelete(req.params.id);
  await Log.deleteMany({userId: req.params.id});
  res.json({message:"User deleted"});
});

export default router;