import express from "express";
import Log from "../models/Log.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const filter = isAdmin? {} : { userId: req.user._id };

    // Parallel counts - faster
    const [totalLogs, criticals, errors, warnings, info] = await Promise.all([
      Log.countDocuments(filter),
      Log.countDocuments({...filter, level: { $regex: /^CRITICAL$/i }}),
      Log.countDocuments({...filter, level: { $regex: /^ERROR$/i }}),
      Log.countDocuments({...filter, level: { $regex: /^WARN/i }}),
      Log.countDocuments({...filter, level: { $regex: /^INFO$/i }})
    ]);

    const levelDistribution = [
      { name: "INFO", value: info },
      { name: "WARN", value: warnings },
      { name: "ERROR", value: errors },
      { name: "CRITICAL", value: criticals },
    ];

    // Improved health: includes WARN
    const health = totalLogs > 0? Math.max(0, 100 - (criticals * 10) - (errors * 5) - (warnings * 2)) : 100;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const errorLogs = await Log.aggregate([
      { $match: {...filter, level: { $regex: /^(ERROR|CRITICAL)$/i }, timestamp: { $gte: sevenDaysAgo } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const errorTrend = [];
    const responseTrend = [];

    for(let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const found = errorLogs.find(e => e._id === dateStr);
      errorTrend.push({ date: dateStr.slice(5), count: found? found.count : 0 });
      responseTrend.push({ date: dateStr.slice(5), avg: Math.floor(Math.random() * 150) + 50 });
    }

    res.json({
      totalLogs, criticals, errors, warnings, health,
      levelDistribution,
      avgResponseTime: responseTrend[6]?.avg || 0,
      errorTrend,
      responseTrend
    });
  } catch (error) {
    console.error("ANALYTICS ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

export default router;