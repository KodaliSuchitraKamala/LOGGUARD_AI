import express from "express";
import Log from "../models/Log.js";
import { Parser } from "json2csv";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/logs/latest
router.get("/latest", protect, async (req, res) => {
  try {
    const isAdmin = req.user?.role === 'admin';
    const filter = isAdmin ? {} : { userId: req.user._id };
    
    const logs = await Log.find(filter)
     .sort({ timestamp: -1 })
     .limit(100);
    res.json(logs);
  } catch (err) {
    console.error("Latest logs API Error: ", err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/logs/search
router.get("/search", protect, async (req, res) => {
  try {
    const {
      keyword = "",
      level,
      startDate,
      endDate,
      page = 1,
      limit = 50,
      exportCSV = false
    } = req.query;

    const isAdmin = req.user?.role === 'admin';
    const baseFilter = isAdmin ? {} : { userId: req.user._id };

    const query = { ...baseFilter };
    
    if (keyword) query.message = { $regex: keyword, $options: "i" };
    if (level && level !== "ALL") query.level = { $regex: new RegExp(`^${level}`, 'i') }; // case-insensitive
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.timestamp.$lte = end;
      }
    }

    if (exportCSV === "true") {
      const logs = await Log.find(query).sort({ timestamp: -1 }).limit(50000);
      const fields = ["timestamp", "level", "message", "source"];
      const json2csvParser = new Parser({ fields });
      const csv = json2csvParser.parse(logs);
      res.header("Content-Type", "text/csv");
      res.attachment(`logguard_export_${Date.now()}.csv`);
      return res.send(csv);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Log.countDocuments(query);
    const logs = await Log.find(query)
     .sort({ timestamp: -1 })
     .skip(skip)
     .limit(Number(limit));

    // Return both formats to support old and new frontend
    // Old LogTable expects array, new expects {logs, total}
    if (req.query.page) {
      res.json({
        logs,
        total,
        page: Number(page),
        totalPages: Math.ceil(total / Number(limit))
      });
    } else {
      res.json(logs);
    }

  } catch (err) {
    console.error("Search API Error: ", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;