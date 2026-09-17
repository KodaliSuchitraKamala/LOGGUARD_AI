import express from 'express';
import Log from '../models/Log.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

// me-role
router.get('/me-role', (req,res)=> {
  res.json({ role: req.user.role || 'user', user: req.user });
});

// latest - ADMIN SEES ALL
router.get('/latest', async (req,res)=>{
  try {
    const isAdmin = req.user.role === 'admin';
    const filter = isAdmin? {} : { $or: [{ user: req.user._id }, { userId: req.user._id }] };
    const logs = await Log.find(filter).sort({createdAt:-1}).limit(100);
    res.json(logs);
  } catch(e){ res.status(500).json({message:e.message, logs: []}) }
});

// analytics - ADMIN SEES ALL
router.get('/analytics', async (req,res)=>{
  try {
    const isAdmin = req.user.role === 'admin';
    const filter = isAdmin? {} : { $or: [{ user: req.user._id }, { userId: req.user._id }] };
    const allLogs = await Log.find(filter);
    res.json({
      total: allLogs.length,
      critical: allLogs.filter(l=>l.level==='CRITICAL').length,
      errors: allLogs.filter(l=>l.level==='ERROR').length,
      warnings: allLogs.filter(l=>['WARNING','WARN'].includes(l.level)).length,
      info: allLogs.filter(l=>l.level==='INFO').length,
      health: 100
    });
  } catch(e){ res.json({ total:0, critical:0, errors:0, warnings:0, info:0, health:100 }) }
});

// search
router.get('/search', async (req,res)=>{
  try {
    const { keyword, q, level } = req.query;
    const search = keyword || q;
    const isAdmin = req.user.role === 'admin';

    let filter = isAdmin? {} : { $or: [{ user: req.user._id }, { userId: req.user._id }] };

    if(search || (level && level!=='ALL')){
      let conditions = [];
      if(!isAdmin) conditions.push({ $or: [{ user: req.user._id }, { userId: req.user._id }] });
      if(search) conditions.push({ message: { $regex: search, $options:'i' } });
      if(level && level!=='ALL') conditions.push({ level: level.toUpperCase() });

      filter = conditions.length>1? { $and: conditions } : conditions[0] || filter;
    }

    const logs = await Log.find(filter).sort({createdAt:-1}).limit(200);
    res.json({ logs, count: logs.length, data: logs });
  } catch(e){ res.json({ logs: [], count:0, data:[] }) }
});

// get all logs
router.get('/', async (req,res)=>{
  try {
    const isAdmin = req.user.role === 'admin';
    const filter = isAdmin? {} : { $or: [{ user: req.user._id }, { userId: req.user._id }] };
    const logs = await Log.find(filter).sort({createdAt:-1}).limit(500);
    res.json(logs);
  } catch(e){ res.json([]) }
});

// EDIT
router.put('/:id', async (req,res)=>{
  try{
    const log = await Log.findById(req.params.id);
    if(!log) return res.status(404).json({message:"Log not found"});
    const isOwner = log.user?.toString()===req.user._id.toString() || log.userId?.toString()===req.user._id.toString();
    if(req.user.role!=='admin' &&!isOwner) return res.status(403).json({message:"Not allowed"});

    if(req.body.message) log.message = req.body.message;
    if(req.body.level) log.level = req.body.level.toUpperCase();
    await log.save();
    res.json(log);
  }catch(e){ res.status(500).json({message:e.message}) }
});

// DELETE
router.delete('/:id', async (req,res)=>{
  try{
    const log = await Log.findById(req.params.id);
    if(!log) return res.status(404).json({message:"Log not found"});
    const isOwner = log.user?.toString()===req.user._id.toString() || log.userId?.toString()===req.user._id.toString();
    if(req.user.role!=='admin' &&!isOwner) return res.status(403).json({message:"Not allowed"});

    await Log.findByIdAndDelete(req.params.id);
    res.json({message:"Deleted", id: req.params.id});
  }catch(e){ res.status(500).json({message:e.message}) }
});

export default router;