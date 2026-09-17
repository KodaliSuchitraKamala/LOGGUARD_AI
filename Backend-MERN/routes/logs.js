import express from 'express';
import Log from '../models/Log.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

// GET /api/logs/latest - user wise
router.get('/latest', async (req,res)=>{
  try {
    const filter = req.user.role === 'admin' ? {} : { user: req.user._id };
    // fallback for old data that has userId not user
    if(req.user.role !== 'admin'){
      filter.$or = [{ user: req.user._id }, { userId: req.user._id }];
    }
    const logs = await Log.find(filter).sort({createdAt:-1}).limit(100);
    res.json(logs);
  } catch(e){ res.status(500).json({message:e.message}) }
});

// GET /api/logs/search?keyword=error&level=CRITICAL
router.get('/search', async (req,res)=>{
  try {
    const { keyword, level, startDate, endDate } = req.query;
    const baseFilter = req.user.role === 'admin' ? {} : { user: req.user._id };

    let filter = { ...baseFilter };

    if(keyword){
      filter.message = { $regex: keyword, $options:'i' };
    }
    if(level && level !== 'ALL'){
      filter.level = level.toUpperCase();
    }
    if(startDate || endDate){
      filter.timestamp = {};
      if(startDate) filter.timestamp.$gte = new Date(startDate);
      if(endDate) filter.timestamp.$lte = new Date(endDate);
    }

    // Handle old userId field
    if(req.user.role !== 'admin'){
      const userOr = [{ user: req.user._id }, { userId: req.user._id }];
      if(filter.message || filter.level || filter.timestamp){
        // merge user filter with other filters using $and
        filter = { $and: [{ $or: userOr }, { ...filter, user: undefined }] };
      } else {
        filter = { $or: userOr };
      }
    }

    const logs = await Log.find(filter).sort({createdAt:-1}).limit(200);
    res.json({ logs, count: logs.length });
  } catch(e){ 
    console.error("SEARCH ERROR", e);
    res.status(500).json({message:e.message}) 
  }
});

// GET /api/logs/analytics + /api/analytics
router.get('/analytics', async (req,res)=>{
  try {
    const filter = req.user.role === 'admin' ? {} : { user: req.user._id };
    const total = await Log.countDocuments(filter);
    const critical = await Log.countDocuments({ ...filter, level: 'CRITICAL' });
    const errors = await Log.countDocuments({ ...filter, level: 'ERROR' });
    const warnings = await Log.countDocuments({ ...filter, level: { $in: ['WARNING','WARN'] } });
    const info = await Log.countDocuments({ ...filter, level: 'INFO' });
    res.json({ total, critical, errors, warnings, info, health: 100 });
  } catch(e){
    res.json({ total:0, critical:0, errors:0, warnings:0, info:0, health:100 });
  }
});

router.get('/', async (req,res)=>{
  try {
    const filter = req.user.role === 'admin' ? {} : { user: req.user._id };
    const logs = await Log.find(filter).sort({createdAt:-1}).limit(500);
    res.json(logs);
  } catch(e){ res.json([]) }
});

export default router;