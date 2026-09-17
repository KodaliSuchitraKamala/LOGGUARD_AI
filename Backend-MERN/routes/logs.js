import express from 'express';
import Log from '../models/Log.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes need auth
router.use(protect);

// Get role - for App.jsx me-role check
router.get('/logs/me-role', (req,res)=> res.json({ role: req.user.role || 'user' }));
router.get('/me-role', (req,res)=> res.json({ role: req.user.role || 'user' }));
router.get('/users/me-role', (req,res)=> res.json({ role: req.user.role || 'user' }));

// Latest logs
router.get('/logs/latest', async (req,res)=>{
  try {
    const logs = await Log.find().sort({createdAt:-1}).limit(50);
    res.json(logs);
  } catch(e){ res.json([]) }
});

router.get('/logs/search', async (req,res)=>{
  try {
    const { q } = req.query;
    const filter = q ? { message: { $regex: q, $options:'i' } } : {};
    const logs = await Log.find(filter).sort({createdAt:-1}).limit(100);
    res.json(logs);
  } catch(e){ res.json([]) }
});

// Analytics
router.get('/analytics', async (req,res)=>{
  try {
    const total = await Log.countDocuments();
    const critical = await Log.countDocuments({ level: 'critical' });
    const errors = await Log.countDocuments({ level: 'error' });
    const warnings = await Log.countDocuments({ level: 'warning' });
    res.json({ total, critical, errors, warnings, health: 100 });
  } catch(e){
    res.json({ total:0, critical:0, errors:0, warnings:0, health:100 });
  }
});

router.get('/logs/analytics', async (req,res)=>{
  res.redirect('/api/analytics');
});

// Alerts / Notifications
router.get('/alerts', async (req,res)=>{
  try {
    const alerts = await Log.find({ level: { $in: ['critical','error'] } }).sort({createdAt:-1}).limit(20);
    res.json(alerts);
  } catch(e){ res.json([]) }
});

router.get('/notifications', async (req,res)=>{
  res.json([]);
});

router.get('/logs/notifications', async (req,res)=>{
  res.json([]);
});

// Upload
router.post('/upload', async (req,res)=>{
  res.json({ message: "Upload endpoint ready - implement multer" });
});

router.get('/users', async (req,res)=>{
  res.json([req.user]);
});

export default router;