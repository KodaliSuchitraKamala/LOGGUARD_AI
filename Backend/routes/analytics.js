import express from "express";
import Log from "../models/Log.js";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();

router.get("/", protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const totalLogs = await Log.countDocuments({ userId });
    const criticals = await Log.countDocuments({ userId, level: "CRITICAL" });
    const errors = await Log.countDocuments({ userId, level: "ERROR" });
    const warnings = await Log.countDocuments({ userId, level: "WARN" });
    const info = await Log.countDocuments({ userId, level: "INFO" });

    const levelDistribution = [
      { name: "INFO", value: info },
      { name: "WARN", value: warnings },
      { name: "ERROR", value: errors },
      { name: "CRITICAL", value: criticals },
    ];

    const health = totalLogs > 0? Math.max(0, 100 - (criticals * 10) - (errors * 5)) : 98;

    // 1. Error Trend - Last 7 Days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const errorLogs = await Log.aggregate([
      { $match: { userId, level: { $in: ["ERROR", "CRITICAL"] }, timestamp: { $gte: sevenDaysAgo } } },
      { 
        $group: { 
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } }, 
          count: { $sum: 1 } 
        } 
      },
      { $sort: { _id: 1 } }
    ]);
    
    const errorTrend = [];
    for(let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const found = errorLogs.find(e => e._id === dateStr);
      errorTrend.push({ date: dateStr.slice(5), count: found? found.count : 0 }); // MM-DD
    }

    // 2. Response Time - Mock for now, since we don't track it yet
    const responseTrend = errorTrend.map(d => ({ date: d.date, avg: Math.floor(Math.random() * 200) + 50 }));

    res.json({ 
      totalLogs, 
      criticals, 
      errors, 
      warnings,
      health,
      levelDistribution,
      avgResponseTime: responseTrend[responseTrend.length-1]?.avg || 0,
      errorTrend,
      responseTrend
    });
  } catch (error) {
    console.error("ANALYTICS ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});
export default router;