import express from 'express';
import Log from '../models/Log.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

// FIX 1: me-role - this was 404 in your screenshot
router.get('/me-role', (req,res)=> {
  res.json({ role: req.user.role || 'user', user: req.user });
});

// FIX 2: latest with correct user filter
router.get('/latest', async (req,res)=>{
  try {
    const isAdmin = req.user.role === 'admin';
    const filter = isAdmin ? {} : { $or: [{ user: req.user._id }, { userId: req.user._id }] };
    const logs = await Log.find(filter).sort({createdAt:-1}).limit(100);
    res.json(logs);
  } catch(e){ res.status(500).json({message:e.message}) }
});

router.get('/search', async (req,res)=>{
  try {
    const { keyword, q, level } = req.query;
    const search = keyword || q;
    const isAdmin = req.user.role === 'admin';
    let filter = {};

    if(!isAdmin){
      filter = { $or: [{ user: req.user._id }, { userId: req.user._id }] };
    }

    if(search){
      filter = { ...filter, message: { $regex: search, $options:'i' } };
      if(!isAdmin){
        // need $and for user filter + search
        filter = { $and: [{ $or: [{ user: req.user._id }, { userId: req.user._id }] }, { message: { $regex: search, $options:'i' } }] };
        if(level && level!=='ALL') filter.$and.push({ level: level.toUpperCase() });
      }
    } else if(level && level!=='ALL'){
      if(isAdmin) filter.level = level.toUpperCase();
      else filter = { $and: [{ $or: [{ user: req.user._id }, { userId: req.user._id }] }, { level: level.toUpperCase() }] };
    }

    const logs = await Log.find(filter).sort({createdAt:-1}).limit(200);
    res.json({ logs, count: logs.length, data: logs });
  } catch(e){ res.json({ logs: [], count:0, data: [] }) }
});

router.get('/analytics', async (req,res)=>{
  try {
    const isAdmin = req.user.role === 'admin';
    const base = isAdmin ? {} : { $or: [{ user: req.user._id }, { userId: req.user._id }] };
    const total = await Log.countDocuments(base);
    const critical = await Log.countDocuments({ $and: [base, { level: 'CRITICAL' }] } .length ? { ...base, level:'CRITICAL'} : base );
    // simpler counting for user
    const all = await Log.find(base);
    const counts = {
      total: all.length,
      critical: all.filter(l=>l.level==='CRITICAL').length,
      errors: all.filter(l=>l.level==='ERROR').length,
      warnings: all.filter(l=>['WARNING','WARN'].includes(l.level)).length,
      info: all.filter(l=>l.level==='INFO').length,
      health: 100
    };
    res.json(counts);
  } catch(e){ res.json({ total:0, critical:0, errors:0, warnings:0, health:100 }); }
});

router.get('/', async (req,res)=>{
  const isAdmin = req.user.role === 'admin';
  const filter = isAdmin ? {} : { $or: [{ user: req.user._id }, { userId: req.user._id }] };
  const logs = await Log.find(filter).sort({createdAt:-1}).limit(500);
  res.json(logs);
});

// FIX 3: EDIT - was 404
router.put('/:id', async (req,res)=>{
  try{
    const log = await Log.findById(req.params.id);
    if(!log) return res.status(404).json({message:"Not found"});
    const isOwner = log.user?.toString()===req.user._id.toString() || log.userId?.toString()===req.user._id.toString();
    if(req.user.role!=='admin' && !isOwner) return res.status(403).json({message:"Not allowed"});
    
    log.message = req.body.message || log.message;
    log.level = req.body.level || log.level;
    await log.save();
    res.json(log);
  }catch(e){ res.status(500).json({message:e.message}) }
});

// FIX 4: DELETE - was 404
router.delete('/:id', async (req,res)=>{
  try{
    const log = await Log.findById(req.params.id);
    if(!log) return res.status(404).json({message:"Not found"});
    const isOwner = log.user?.toString()===req.user._id.toString() || log.userId?.toString()===req.user._id.toString();
    if(req.user.role!=='admin' && !isOwner) return res.status(403).json({message:"Not allowed"});
    
    await Log.findByIdAndDelete(req.params.id);
    res.json({message:"Deleted"});
  }catch(e){ res.status(500).json({message:e.message}) }
});

export default router;