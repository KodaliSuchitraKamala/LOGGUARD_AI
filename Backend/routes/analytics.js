import express from 'express';
import { db } from '../db.js';
import auth from '../middleware/auth.js';
const router = express.Router();

router.get('/analytics', auth, async (req, res) => {
    await db.read();
    const userLogs = db.data.logs.filter(log => log.userId === req.user.id);
    const totalLogs = userLogs.length;
    const errors = userLogs.filter(l => l.level === 'ERROR' || l.level === 'CRITICAL').length;
    const avgResponseTime = userLogs.length > 0? Math.round(userLogs.reduce((sum, l) => sum + (l.responseTime || 0), 0) / userLogs.length) : 0;
    const health = totalLogs > 0? Math.round(100 - (errors / totalLogs * 100)) : 100;
    
    const last7Days = [...Array(7)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() - i); return d.toISOString().split('T')[0]; }).reverse();
    const errorTrend = last7Days.map(date => ({ date, count: userLogs.filter(l => l.level === 'ERROR' && l.timestamp.startsWith(date)).length }));
    const responseTrend = last7Days.map(date => { const dayLogs = userLogs.filter(l => l.timestamp.startsWith(date)); const avg = dayLogs.length > 0? Math.round(dayLogs.reduce((s,l)=>s+(l.responseTime||0),0)/dayLogs.length) : 0; return { date, avg } });
    
    // Pie Chart Data
    const levelCounts = {
        INFO: userLogs.filter(l => l.level === 'INFO').length,
        WARN: userLogs.filter(l => l.level === 'WARN').length,
        ERROR: userLogs.filter(l => l.level === 'ERROR').length,
        CRITICAL: userLogs.filter(l => l.level === 'CRITICAL').length,
    };
    const levelDistribution = Object.keys(levelCounts).map(level => ({ name: level, value: levelCounts[level] })).filter(item => item.value > 0);

    res.json({ totalLogs, errors, avgResponseTime, health, errorTrend, responseTrend, levelDistribution });
});

export default router;