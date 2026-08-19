import express from "express";
import multer from "multer";
import fs from "fs";
import { protect } from "../middleware/authMiddleware.js";
import Log from "../models/Log.js";
import Alert from "../models/Alerts.js";
import { sendEmail } from "../emailService.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Helper to normalize log levels
const normalizeLevel = (line) => {
  const l = line.toLowerCase();
  if(l.includes("critical")) return "CRITICAL";
  if(l.includes("error")) return "ERROR";
  if(l.includes("warn")) return "WARNING";
  return "INFO";
}

// Background tasks - don't await these
const sendCriticalEmailInBackground = (user, alert) => {
  const emailBody = `
    <h2>🚨 LogGuard AI - CRITICAL ALERT</h2>
    <p><b>Message:</b> ${alert.message}</p>
    <p><b>Time:</b> ${new Date(alert.timestamp).toLocaleString('en-IN', {timeZone: 'Asia/Kolkata'})}</p>
    <p>Please login to dashboard to acknowledge.</p>
  `;
  sendEmail(user.email, `LogGuard AI - CRITICAL Alert`, emailBody)
    .catch(err => console.error("Background Email failed:", err));
}

const updateStatsInBackground = async (io) => {
  try {
    const counts = await Log.aggregate([{ $group: { _id: "$level", count: { $sum: 1 } } }]);
    const countObj = {INFO:0, WARNING:0, ERROR:0, CRITICAL:0};
    counts.forEach(c => countObj[c._id] = c.count);
    io.emit('stats_update', countObj);
  } catch(e) {
    console.error("Stats update failed:", e)
  }
}

router.post("/upload", protect, upload.single("file"), async (req, res) => {
  let filePath = req.file?.path;
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const fileContent = fs.readFileSync(filePath, "utf-8");
    const lines = fileContent.split("\n");
    const logsToInsert = [];
    const alertsToInsert = [];

    lines.forEach(line => {
      if(line.trim()) {
        const level = normalizeLevel(line);
        logsToInsert.push({
          userId: req.user._id,
          message: line,
          level,
          timestamp: new Date()
        });

        if(level === "CRITICAL") {
          alertsToInsert.push({
            userId: req.user._id,
            message: `CRITICAL: ${line}`,
            level: "CRITICAL",
            acknowledged: false,
            timestamp: new Date()
          });
        }
      }
    });

    if(logsToInsert.length === 0) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ message: "File is empty" });
    }

    await Log.insertMany(logsToInsert);

    let insertedAlerts = [];
    if(alertsToInsert.length > 0) {
      insertedAlerts = await Alert.insertMany(alertsToInsert);
      for(const alert of insertedAlerts) {
        req.app.get('io').emit('new_alert', alert);
        sendCriticalEmailInBackground(req.user, alert); // fire and forget
      }
    }

    fs.unlinkSync(filePath); // delete temp file

    // Fire and forget: don't wait for these
    req.app.get('io').emit('new_log');
    updateStatsInBackground(req.app.get('io')); // runs in background

    // Respond IMMEDIATELY
    res.status(200).json({ 
      message: `${logsToInsert.length} logs uploaded, ${alertsToInsert.length} critical alerts created`
    });

  } catch (error) {
    console.error("UPLOAD ERROR:", error);
    if(filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.status(500).json({ message: error.message });
  }
});

export default router;