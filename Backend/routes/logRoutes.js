import express from 'express';
import { requireRole } from '../middleware/roleMiddleware.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import Log from '../models/Log.js';
import User from '../models/User.js';
import Alert from '../models/Alert.js';

const router = express.Router();

// USER sees only their logs, ADMIN sees all
router.get('/logs', authMiddleware, async (req, res) => {
  try {
    const filter = req.user.role === 'ADMIN' ? {} : { userId: req.user.id }; // make sure Log has userId
    const logs = await Log.find(filter).sort({ timestamp: -1 }).limit(100);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ADMIN only: Get all users
router.get('/users', authMiddleware, requireRole(['ADMIN']), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ADMIN only: Update user role
router.patch('/users/:id/role', authMiddleware, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { role } = req.body;
    if(!['ADMIN', 'USER'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    // prevent admin from demoting themselves
    if (req.params.id === req.user.id && role !== 'ADMIN') {
      return res.status(403).json({ message: 'Cannot demote yourself' });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id, 
      { role }, 
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Acknowledge Alert API
router.patch('/alerts/:id/acknowledge', authMiddleware, async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id, 
      { read: true, acknowledgedBy: req.user.id }, 
      { new: true }
    );
    if(!alert) return res.status(404).json({message: 'Alert not found'});
    res.json(alert);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;