import express from 'express';
import Log from '../models/Log.js'; // we need to create this
import User from '../models/User.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const totalLogs = await Log.countDocuments();
    const errors = await Log.countDocuments({ level: 'ERROR' });
    const warnings = await Log.countDocuments({ level: 'WARN' });
    const info = await Log.countDocuments({ level: 'INFO' });
    const critical = await Log.countDocuments({ level: 'CRITICAL' });

    const users = await User.countDocuments();
    const admins = await User.countDocuments({ role: 'ADMIN' });

    const health = totalLogs > 0 ? Math.round(((totalLogs - errors) / totalLogs) * 100) : 100;

    res.json({
      totalLogs,
      errors,
      warnings,
      info,
      critical,
      health,
      roleData: [
        { name: 'USER', value: users - admins },
        { name: 'ADMIN', value: admins }
      ]
    });
  } catch (error) {
    console.error("ANALYTICS ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;