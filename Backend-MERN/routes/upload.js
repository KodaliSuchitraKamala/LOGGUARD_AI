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
const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });

const LOG_LINE_REGEX = /^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})\s+(INFO|WARN|WARNING|ERROR|CRITICAL|DEBUG)\s+(.+)$/i;
const isGarbageLine = (line) => {
  const t = line.trim();
  if (t.length < 10) return true;
  if (/^0+\s*n+/i.test(t)) return true;
  if (/^0{4,}/.test(t.replace(/\s/g,''))) return true;
  if (/^(.)\1{5,}$/.test(t.replace(/\s/g,''))) return true;
  return false;
};

router.post("/upload", protect, upload.any(), async (req, res) => {
  try {
    if (!req.files?.length) return res.status(400).json({ message: "No file uploaded" });
    const content = req.files[0].buffer.toString("utf-8");
    const lines = content.split("\n").filter(l => l.trim() &&!isGarbageLine(l));
    if (lines.length === 0) return res.status(400).json({ message: "Garbage file! Format: YYYY-MM-DD HH:MM:SS LEVEL Message" });

    const parsedLogs = lines.map(line => {
      try {
        const j = JSON.parse(line);
        const rawMsg = j.message || "";
        const m = rawMsg.match(LOG_LINE_REGEX);
        return {
          message: m? m[4].substring(0,1000) : (rawMsg || line).substring(0,1000),
          level: (m? m[3] : j.level || "INFO").toUpperCase().replace('WARN','WARNING'),
          timestamp: m? new Date(`${m[1]}T${m[2]}`) : (j.timestamp? new Date(j.timestamp) : new Date()),
          source: j.source || req.files[0].originalname,
          userId: req.user._id, user: req.user._id,
        };
      } catch {
        const match = line.match(LOG_LINE_REGEX);
        if (match) {
          const [, date, time, lvl, msg] = match;
          return {
            message: msg.trim().substring(0,1000),
            level: lvl.toUpperCase().replace('WARN','WARNING'),
            timestamp: new Date(`${date}T${time}`),
            source: req.files[0].originalname,
            userId: req.user._id, user: req.user._id,
          };
        }
        const low = line.toLowerCase();
        let level = "INFO";
        if (low.includes("critical") || low.includes("crash") || low.includes("fatal")) level = "CRITICAL";
        else if (low.includes("error") || low.includes("fail") || low.includes("exception")) level = "ERROR";
        else if (low.includes("warn")) level = "WARNING";
        return {
          message: line.replace(/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}\s+\w+\s+/, '').substring(0,1000),
          level, timestamp: new Date(), source: req.files[0].originalname,
          userId: req.user._id, user: req.user._id,
        };
      }
    });

    const savedLogs = await Log.insertMany(parsedLogs, { ordered: false });
    const criticals = savedLogs.filter(l => ['CRITICAL','ERROR'].includes(l.level));

    // Save alerts/notifications immediately
    if (criticals.length) {
      await Alert.insertMany(criticals.map(l => ({
        message: l.message, level: l.level, userId: req.user._id, user: req.user._id, logId: l._id, timestamp: l.timestamp
      }))).catch(e => console.error("Alert save fail", e));

      await Notification.insertMany(criticals.map(l => ({
        message: l.message, level: l.level, type: "CRITICAL_LOG", isRead: false, userId: req.user._id, user: req.user._id, timestamp: l.timestamp, createdAt: new Date()
      }))).catch(e => console.error("Notif save fail", e));

      try {
        const io = req.app.get('io');
        if (io) { io.emit("new_log", savedLogs); io.emit("newNotification", { count: criticals.length }); }
      } catch {}
    }

    // FIXED EMAIL - Don't use setImmediate on Vercel, send now but don't block response
    if (criticals.length) {
      // Respond first, then send email in background without blocking
      res.json({
        message: `${parsedLogs.length} logs uploaded, ${criticals.length} critical - email sending...`,
        count: parsedLogs.length, criticals: criticals.length, logs: savedLogs.slice(-50)
      });

      // Email after response - this runs even after res.json
      (async () => {
        try {
          console.log("📧 Starting email send for", criticals.length, "critical logs");
          const adminUsers = await User.find({ role: 'admin' }).select('email');
          const recipients = [req.user.email,...adminUsers.map(a => a.email)].filter(Boolean);
          const uniqueRecipients = [...new Set(recipients)];

          console.log("📧 Recipients:", uniqueRecipients);

          const htmlTable = `
            <div style="font-family: Arial; max-width: 800px; margin: 0 auto;">
              <h2 style="color:#dc2626;">🚨 LogGuard AI - Critical Logs Detected</h2>
              <p>You uploaded <b>${parsedLogs.length} logs</b> with <b style="color:red;">${criticals.length} CRITICAL/ERROR</b> at ${new Date().toLocaleString('en-IN', {timeZone:'Asia/Kolkata'})}</p>
              <table border="1" cellpadding="10" cellspacing="0" style="border-collapse: collapse; width: 100%; margin: 20px 0;">
                <tr style="background:#111; color:white;"><th>Time</th><th>Level</th><th>Message</th></tr>
                ${criticals.slice(0, 10).map(c => `
                  <tr><td>${new Date(c.timestamp).toLocaleString('en-IN')}</td><td style="color:${c.level==='CRITICAL'?'red':'orange'}; font-weight:bold;">${c.level}</td><td>${c.message}</td></tr>
                `).join('')}
              </table>
              ${criticals.length > 10? `<p>... and ${criticals.length - 10} more critical logs</p>` : ''}
              <p><a href="https://log-guard-ai.vercel.app" style="background:#3b82f6; padding:12px 24px; text-decoration:none; color:white; border-radius:8px; font-weight:bold; display:inline-block;">Open Dashboard</a></p>
            </div>`;

          for (const email of uniqueRecipients) {
            if (!email) continue;
            try {
              await sendEmail(email, `🚨 LogGuard: ${criticals.length} Critical Logs Found`, htmlTable);
              console.log("✅ Email sent to", email);
            } catch (err) {
              console.error("❌ Email failed to", email, err.message);
            }
          }

          await sendAlert('CRITICAL_LOG', 'CRITICAL', `${criticals.length} critical log(s) found`, criticals.length).catch(()=>{});

        } catch (err) {
          console.error("Email/Alert background fail", err);
        }
      })();

      return; // Important - already sent response
    }

    // No criticals - normal response
    return res.status(200).json({
      message: `${parsedLogs.length} logs uploaded, 0 critical`,
      count: parsedLogs.length,
      criticals: 0,
      logs: savedLogs.slice(-50)
    });

  } catch (e) {
    console.error("UPLOAD ERROR:", e);
    return res.status(500).json({ message: e.message });
  }
});

export default router;