import express from "express";
import multer from "multer";
import fs from "fs";
import { protect } from "../middleware/authMiddleware.js";
import Log from "../models/Log.js";
import Alert from "../models/Alerts.js";
import Notification from "../models/Notification.js";
import { sendEmail } from "../emailService.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

const normalizeLevel = (line) => {
  const l = line.toLowerCase();
  if(l.includes("critical")) return "CRITICAL";
  if(l.includes("error")) return "ERROR";
  if(l.includes("warn")) return "WARNING";
  return "INFO";
}

router.post("/upload", protect, upload.single("file"), async (req, res) => {
  let filePath = req.file?.path;
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const lines = fileContent.split("\n");
    const logsToInsert = [];

    lines.forEach(line => {
      if(line.trim()) {
        const level = normalizeLevel(line);
        logsToInsert.push({ userId: req.user._id, message: line, level, timestamp: new Date() });
      }
    });

    if(logsToInsert.length === 0) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ message: "File is empty" });
    }

    const insertedLogs = await Log.insertMany(logsToInsert);
    const criticalLogs = insertedLogs.filter(l => l.level === "CRITICAL");

    if(criticalLogs.length > 0) {
      const alertsToInsert = criticalLogs.map(log => ({
        userId: req.user._id,
        message: `CRITICAL: ${log.message}`,
        level: "CRITICAL",
        acknowledged: false,
        timestamp: new Date()
      }));
      const insertedAlerts = await Alert.insertMany(alertsToInsert);

      const notifsToInsert = criticalLogs.map(log => ({
        userId: req.user._id,
        type: 'CRITICAL',
        message: log.message,
        logId: log._id,
        isRead: false
      }));
      await Notification.insertMany(notifsToInsert);

      const io = req.app.get('io');
      insertedAlerts.forEach(alert => io.emit('new_alert', alert));
      io.emit('new_log');
      io.emit('newNotification');

      // email in background
      insertedAlerts.forEach(alert => {
        const emailBody = `<h2>🚨 CRITICAL ALERT</h2><p>${alert.message}</p><p>${new Date().toLocaleString('en-IN')}</p>`;
        sendEmail(req.user.email, `LogGuard AI - CRITICAL Alert`, emailBody).catch(()=>{});
      });
    } else {
      req.app.get('io').emit('new_log');
    }

    fs.unlinkSync(filePath);
    res.status(200).json({
      message: `${logsToInsert.length} logs uploaded, ${criticalLogs.length} critical alerts created`
    });

  } catch (error) {
    console.error("UPLOAD ERROR:", error);
    if(filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.status(500).json({ message: error.message });
  }
});

export default router;