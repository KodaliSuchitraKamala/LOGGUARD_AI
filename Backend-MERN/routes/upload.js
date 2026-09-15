import express from "express";
import multer from "multer";
import Log from "../models/Log.js";
import Alert from "../models/Alerts.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { protect } from "../middleware/authMiddleware.js";
import { sendEmail } from "../emailService.js";
import { sendAlert } from "../services/alertService.js";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }
});

router.post("/upload", protect, upload.any(), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const file = req.files[0];
    const content = file.buffer.toString("utf-8");
    const lines = content.split("\n").filter(l => l.trim());

    if (lines.length === 0) {
      return res.status(400).json({ message: "File is empty" });
    }

    const parsedLogs = lines.map(line => {
      try {
        const j = JSON.parse(line);
        return {
          message: (j.message || line).substring(0, 1000),
          level: (j.level || "INFO").toUpperCase(),
          timestamp: j.timestamp? new Date(j.timestamp) : new Date(),
          source: j.source || file.originalname || "upload",
          userId: req.user._id,
          user: req.user._id, // FIXED: Add both fields for compatibility
        };
      } catch {
        const low = line.toLowerCase();
        let level = "INFO";
        if (low.includes("critical") || low.includes("crash") || low.includes("down") || low.includes("fatal")) level = "CRITICAL";
        else if (low.includes("error") || low.includes("fail") || low.includes("exception")) level = "ERROR";
        else if (low.includes("warn")) level = "WARNING";
        return {
          message: line.substring(0, 1000),
          level,
          timestamp: new Date(),
          source: file.originalname || "upload",
          userId: req.user._id,
          user: req.user._id,
        };
      }
    });

    const savedLogs = await Log.insertMany(parsedLogs, { ordered: false });
    const criticals = savedLogs.filter(l => l.level === "CRITICAL" || l.level === "ERROR");

    if (criticals.length > 0) {
      const alertsToInsert = criticals.map(l => ({
        message: l.message,
        level: l.level,
        userId: req.user._id,
        user: req.user._id,
        logId: l._id,
        timestamp: l.timestamp
      }));
      await Alert.insertMany(alertsToInsert).catch(e => console.error("Alert save fail", e));

      const notifsToInsert = criticals.map(l => ({
        message: l.message,
        level: l.level,
        type: "CRITICAL_LOG",
        isRead: false,
        userId: req.user._id,
        user: req.user._id,
        timestamp: l.timestamp,
        createdAt: new Date()
      }));
      await Notification.insertMany(notifsToInsert).catch(e => console.error("Notif save fail", e));

      try {
        const io = req.app.get('io');
        if (io) {
          io.emit("new_log", savedLogs);
          io.emit("newNotification", { count: criticals.length });
        }
      } catch {}

      setImmediate(async () => {
        try {
          const recipients = new Set([req.user.email]);
          const admins = await User.find({ role: 'admin' }).select('email');
          admins.forEach(a => { if(a.email) recipients.add(a.email) });

          const htmlTable = `
            <div style="font-family: Arial;">
              <h2 style="color:#dc2626;">🚨 LogGuard AI - Critical Logs Detected</h2>
              <p>You uploaded <b>${parsedLogs.length} logs</b> with <b style="color:red;">${criticals.length} CRITICAL/ERROR</b> at ${new Date().toLocaleString('en-IN', {timeZone:'Asia/Kolkata'})}</p>
              <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%;">
                <tr style="background:#111; color:white;"><th>Time</th><th>Level</th><th>Message</th></tr>
                ${criticals.slice(0, 10).map(c => `
                  <tr><td>${new Date(c.timestamp).toLocaleString('en-IN')}</td><td style="color:${c.level==='CRITICAL'?'red':'orange'}"><b>${c.level}</b></td><td>${c.message}</td></tr>
                `).join('')}
              </table>
              <p><a href="https://logguardai.vercel.app" style="background:#a3ff12; padding:10px 20px; text-decoration:none; color:black; border-radius:8px; font-weight:bold;">Open Dashboard</a></p>
            </div>`;

          for (const email of recipients) {
            if(email) await sendEmail(email, `🚨 LogGuard: ${criticals.length} Critical Logs Found`, htmlTable).catch(()=>{});
          }
          await sendAlert('CRITICAL_LOG', 'CRITICAL', `${criticals.length} critical log(s) found`, criticals.length).catch(()=>{});
        } catch (err) { console.error("Email/Alert background fail", err); }
      });
    }

    return res.status(200).json({
      message: `${parsedLogs.length} logs uploaded, ${criticals.length} critical`,
      count: parsedLogs.length,
      criticals: criticals.length,
      logs: savedLogs.slice(-50)
    });

  } catch (e) {
    console.error("UPLOAD ERROR:", e);
    return res.status(500).json({ message: e.message });
  }
});

export default router;