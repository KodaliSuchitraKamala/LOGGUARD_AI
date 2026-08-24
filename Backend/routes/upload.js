import express from "express";
import multer from "multer";
import fs from "fs";
import Log from "../models/Log.js";
import Alert from "../models/Alerts.js";
import User from "../models/User.js";
import { protect } from "../middleware/authMiddleware.js";
import { sendEmail } from "../emailService.js";

const router = express.Router();
const upload = multer({ dest: "uploads/", limits: { fileSize: 20 * 1024 * 1024 } });

// use.any() so it never throws "Unexpected field"
router.post("/upload", protect, upload.any(), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const file = req.files[0];
    const content = fs.readFileSync(file.path, "utf-8");
    const lines = content.split("\n").filter(l => l.trim());

    const parsedLogs = lines.map(line => {
      try {
        const j = JSON.parse(line);
        return {
          message: j.message || line,
          level: (j.level || "INFO").toUpperCase(),
          timestamp: j.timestamp? new Date(j.timestamp) : new Date(),
          source: j.source || "upload",
          userId: req.user._id
        };
      } catch {
        let level = "INFO";
        const low = line.toLowerCase();
        if (low.includes("critical") || low.includes("crash") || low.includes("down")) level = "CRITICAL";
        else if (low.includes("error") || low.includes("fail")) level = "ERROR";
        else if (low.includes("warn")) level = "WARNING";
        return { message: line, level, timestamp: new Date(), source: "upload", userId: req.user._id };
      }
    });

    let savedLogs = [];
    if (parsedLogs.length > 0) {
      savedLogs = await Log.insertMany(parsedLogs);
    }
    fs.unlinkSync(file.path);

    // --- CREATE ALERTS FOR CRITICAL ---
    const criticals = savedLogs.filter(l => l.level === "CRITICAL" || l.level === "ERROR");
    if (criticals.length > 0) {
      const alertsToInsert = criticals.map(l => ({
        message: l.message,
        level: l.level,
        userId: req.user._id,
        logId: l._id,
        timestamp: l.timestamp
      }));
      await Alert.insertMany(alertsToInsert);
    }

    // --- INSTANT EMAIL LOGIC ---
    if (criticals.length > 0) {
      // Send to uploader + all admins
      const recipients = new Set();
      recipients.add(req.user.email);
      const admins = await User.find({ role: 'admin' }).select('email');
      admins.forEach(a => recipients.add(a.email));

      const htmlTable = `
        <div style="font-family: Arial;">
          <h2 style="color:#dc2626;">🚨 LogGuard AI - Critical Logs Detected</h2>
          <p>You uploaded <b>${parsedLogs.length} logs</b> with <b style="color:red;">${criticals.length} CRITICAL/ERROR</b> logs at ${new Date().toLocaleString('en-IN', {timeZone:'Asia/Kolkata'})}</p>
          <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%;">
            <tr style="background:#111; color:white;"><th>Time</th><th>Level</th><th>Message</th></tr>
            ${criticals.slice(0, 10).map(c => `
              <tr><td>${new Date(c.timestamp).toLocaleString('en-IN')}</td><td style="color:${c.level==='CRITICAL'?'red':'orange'}"><b>${c.level}</b></td><td>${c.message}</td></tr>
            `).join('')}
          </table>
          <p style="margin-top:15px;"><a href="http://localhost:5173" style="background:#a3ff12; padding:10px 20px; text-decoration:none; color:black; border-radius:8px; font-weight:bold;">Open Dashboard</a></p>
        </div>
      `;

      for (const email of recipients) {
        if(email) await sendEmail(email, `🚨 LogGuard: ${criticals.length} Critical Logs Found in Upload`, htmlTable);
      }
    }

    // Socket emit
    try {
      const io = req.app.get('io');
      if (io) {
        io.emit("new_log", savedLogs);
        if (criticals.length > 0) io.emit("new_alert", { count: criticals.length });
      }
    } catch (e) {}

    res.json({ message: `${parsedLogs.length} logs uploaded, ${criticals.length} critical`, count: parsedLogs.length, criticals: criticals.length });

  } catch (e) {
    console.error("UPLOAD ERROR:", e);
    res.status(500).json({ message: e.message });
  }
});

export default router;