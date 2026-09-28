import express from 'express';
import Log from '../models/Log.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

// Central garbage checker
const isGarbage = (msg) => {
  if (!msg) return true;
  const t = msg.trim();
  if (t.length < 5) return true;
  if (/^0+\s*n+/i.test(t)) return true;
  if (/^0{5,}/.test(t.replace(/\s/g,''))) return true;
  if (/^(.)\1{5,}$/.test(t.replace(/\s/g,''))) return true;
  if (t === "00000 n" || t.includes("00000 n")) return true;
  return false;
};

router.get('/latest', async (req,res)=>{
  try {
    const filter = { $or: [{ user: req.user._id }, { userId: req.user._id }] };
    const logs = await Log.find(filter).sort({createdAt:-1}).limit(200);
    const clean = logs.filter(l =>!isGarbage(l.message) &&!isGarbage(l.raw || l.message));

    // Auto-delete garbage in background
    const garbageIds = logs.filter(l => isGarbage(l.message)).map(l=>l._id);
    if(garbageIds.length>0) Log.deleteMany({_id: {$in: garbageIds}}).catch(()=>{});

    res.json(clean.slice(0,100));
  } catch(e){ res.status(500).json({message:e.message}) }
});

router.get('/analytics', async (req,res)=>{
  try {
    const filter = { $or: [{ userId: req.user._id }, { user: req.user._id }] };
    const allLogs = await Log.find(filter).sort({createdAt:-1});
    const cleanLogs = allLogs.filter(l =>!isGarbage(l.message));

    const total = cleanLogs.length;
    const critical = cleanLogs.filter(l=>l.level==='CRITICAL').length;
    const errors = cleanLogs.filter(l=>['ERROR','ERKOR'].includes(l.level)).length;
    const warnings = cleanLogs.filter(l=>['WARN','WARNING'].includes(l.level)).length;
    const info = Math.max(0, total - critical - errors - warnings);

    const errorTrend = [];
    const responseTrend = [];
    for(let i=6;i>=0;i--){
      const d = new Date(); d.setDate(d.getDate()-i);
      const dateStr = d.toISOString().split('T')[0];
      const count = cleanLogs.filter(l=>{
        const ld = new Date(l.timestamp||l.createdAt).toISOString().split('T')[0];
        return ld===dateStr && ['ERROR','CRITICAL'].includes(l.level);
      }).length;
      errorTrend.push({ date: dateStr.slice(5), count, errors: count });
      responseTrend.push({ date: dateStr.slice(5), avg: 80 + count*5, responseTime: 80 + count*5 });
    }

    const levelDistribution = [
      { name:"INFO", value: info },
      { name:"WARN", value: warnings },
      { name:"ERROR", value: errors },
      { name:"CRITICAL", value: critical },
    ].filter(x=>x.value>0);

    res.json({ total, totalLogs: total, errors, critical, criticals: critical, warnings, info, health: total? Math.max(0, 100 - (critical*10 + errors*2 + warnings)) : 100, errorTrend, responseTrend, levelDistribution });
  } catch(e){ res.json({ total:0, errors:0, health:100, errorTrend:[], responseTrend:[], levelDistribution:[] }) }
});

router.get('/me-role', (req,res)=> res.json({ role: req.user.role || 'user', user: req.user }));

router.get('/all', async (req,res)=>{
  if(req.user.role!== 'admin') return res.status(403).json({message:"Admin only"});
  const logs = await Log.find({}).sort({createdAt:-1}).limit(500).populate('userId','name email').populate('user','name email');
  res.json(logs.filter(l=>!isGarbage(l.message)));
});

router.get('/search', async (req,res)=>{
  try {
    const { keyword, q, level } = req.query;
    const search = keyword || q;
    let base = { $or: [{ user: req.user._id }, { userId: req.user._id }] };
    let conditions = [base];
    if(search) conditions.push({ message: { $regex: search, $options:'i' } });
    if(level && level!=='ALL') conditions.push({ level: level.toUpperCase() });
    const filter = conditions.length>1? { $and: conditions } : base;
    const logs = await Log.find(filter).sort({createdAt:-1}).limit(200);
    const clean = logs.filter(l=>!isGarbage(l.message));
    res.json({ logs: clean, count: clean.length, data: clean });
  } catch(e){ res.json({ logs: [], count:0, data:[] }) }
});

router.get('/', async (req,res)=>{
  const filter = { $or: [{ user: req.user._id }, { userId: req.user._id }] };
  const logs = await Log.find(filter).sort({createdAt:-1}).limit(500);
  res.json(logs.filter(l=>!isGarbage(l.message)));
});

router.put('/:id', async (req,res)=>{
  try{
    const log = await Log.findById(req.params.id);
    if(!log) return res.status(404).json({message:"Not found"});
    const isOwner = log.user?.toString()===req.user._id.toString() || log.userId?.toString()===req.user._id.toString();
    if(req.user.role!=='admin' &&!isOwner) return res.status(403).json({message:"Not allowed"});
    if(req.body.message) log.message = req.body.message;
    if(req.body.level) log.level = req.body.level.toUpperCase();
    await log.save();
    res.json(log);
  }catch(e){ res.status(500).json({message:e.message}) }
});

router.delete('/:id', async (req,res)=>{
  try{
    const log = await Log.findById(req.params.id);
    if(!log) return res.status(404).json({message:"Not found"});
    const isOwner = log.user?.toString()===req.user._id.toString() || log.userId?.toString()===req.user._id.toString();
    if(req.user.role!=='admin' &&!isOwner) return res.status(403).json({message:"Not allowed"});
    await Log.findByIdAndDelete(req.params.id);
    res.json({message:"Deleted"});
  }catch(e){ res.status(500).json({message:e.message}) }
});

// NEW: Clean all garbage at once
router.delete('/clean-garbage', async (req,res)=>{
  const all = await Log.find({ $or: [{ user: req.user._id }, { userId: req.user._id }] });
  const garbageIds = all.filter(l=> isGarbage(l.message)).map(l=>l._id);
  await Log.deleteMany({_id: {$in: garbageIds}});
  res.json({ deleted: garbageIds.length });
});

export default router;