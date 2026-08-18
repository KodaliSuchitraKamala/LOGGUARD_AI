import express from "express";
import multer from "multer";
import fs from "fs";
import { protect } from "../middleware/authMiddleware.js";
import Log from "../models/Log.js";
import Alert from "../models/Alerts.js";
import { sendEmail } from "../emailService.js"; // ADD THIS
const router = express.Router();

const upload = multer({ dest: "uploads/" });

router.post("/upload", protect, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const fileContent = fs.readFileSync(req.file.path, "utf-8");
    const lines = fileContent.split("\n");
    const logsToInsert = [];
    const alertsToInsert = [];

    lines.forEach(line => {
      if(line.trim()) {
        let level = "INFO";
        if(line.toLowerCase().includes("critical")) level = "CRITICAL";
        else if(line.toLowerCase().includes("error")) level = "ERROR";
        else if(line.toLowerCase().includes("warn")) level = "WARN";

        const logDoc = {
          userId: req.user._id,
          message: line,
          level,
          timestamp: new Date()
        };
        logsToInsert.push(logDoc);

        if(level === "CRITICAL") {
          alertsToInsert.push({
            userId: req.user._id,
            message: `CRITICAL: ${line}`,
            level: "CRITICAL",
            acknowledged: false
          });
        }
      }
    });

    const insertedLogs = await Log.insertMany(logsToInsert);

    if(alertsToInsert.length > 0) {
      const insertedAlerts = await Alert.insertMany(alertsToInsert);

      // Send Email + Socket for each CRITICAL
      for(const alert of insertedAlerts) {
        req.app.get('io').emit('new_alert', alert);

        const emailBody = `
          <h2>🚨 LogGuard AI - CRITICAL ALERT</h2>
          <p><b>Message:</b> ${alert.message}</p>
          <p><b>Time:</b> ${new Date(alert.timestamp).toLocaleString('en-IN', {timeZone: 'Asia/Kolkata'})}</p>
          <p>Please login to dashboard to acknowledge.</p>
        `;
        await sendEmail(req.user.email, `LogGuard AI - CRITICAL Alert`, emailBody);
      }
    }

    fs.unlinkSync(req.file.path);
    req.app.get('io').emit('new_log');

    res.status(200).json({ message: `${logsToInsert.length} logs uploaded, ${alertsToInsert.length} critical alerts created` });
  } catch (error) {
    console.error("UPLOAD ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

export default router;