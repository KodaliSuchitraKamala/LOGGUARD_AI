import express from "express";
import Log from "../models/Log.js";
import { Parser } from "json2csv";

const router = express.Router();

// GET /api/logs/latest - Get latest 100 logs for dashboard
router.get("/latest", async (req, res) => {
  try {
    const logs = await Log.find({})
      .sort({ timestamp: -1 })
      .limit(100);
    
    // FIX: your App.jsx expects res.data, not res.data.logs
    res.json(logs); 
  } catch (err) {
    console.error("Latest logs API Error: ", err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/logs/search - Advanced search + pagination + CSV export
router.get("/search", async (req, res) => {
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

    const query = {};
    if (keyword) query.message = { $regex: keyword, $options: "i" };
    if (level && level !== "ALL") query.level = level;
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

    res.json({
      logs,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)) // FIX: wrap limit in Number()
    });
  } catch (err) {
    console.error("Search API Error: ", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;