import express from 'express';
import { db } from '../db.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/logs/latest', auth, async (req, res) => {
    await db.read();
    const logs = db.data.logs.filter(l => l.userId === req.user.id).slice(-50).reverse();
    res.json(logs);
});

router.get('/alerts', auth, async (req, res) => {
  await db.read();
  const alerts = db.data.alerts.filter(a => a.userId === req.user.id &&!a.acknowledged);
  res.json(alerts);
});

router.post('/alerts/:id/acknowledge', auth, async (req, res) => {
  await db.read();
  const alert = db.data.alerts.find(a => a.id == req.params.id && a.userId === req.user.id);
  if(!alert) return res.status(404).json({ error: 'Alert not found' });
  alert.acknowledged = true;
  await db.write();
  res.json({ message: 'Alert acknowledged' });
});

// ADDED ANALYTICS
router.get('/analytics/summary', auth, async (req, res) => {
  await db.read();
  const logs = db.data.logs.filter(l => l.userId === req.user.id);
  const totalLogs = logs.length;
  const errors = logs.filter(l => l.level === 'ERROR' || l.level === 'CRITICAL').length;
  const health = totalLogs > 0? Math.max(0, 100 - errors * 5) : 98;
  res.json({ totalLogs, errors, avgResponse: 120, health });
});

router.get('/analytics/trends', auth, async (req, res) => {
  await db.read();
  const logs = db.data.logs.filter(l => l.userId === req.user.id);
  const trendData = Array.from({length: 7}).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const date = d.toISOString().split('T')[0];
    return {
      date,
      errors: logs.filter(l => l.timestamp.startsWith(date) && (l.level === 'ERROR' || l.level === 'CRITICAL')).length
    }
  }).reverse();
  res.json(trendData);
});

export default router;