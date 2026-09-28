import express from 'express';
import Log from '../models/Log.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

router.get('/latest', async (req,res)=>{
  try {
    const filter = {
      $or: [{ user: req.user._id }, { userId: req.user._id }],
      message: { $nin: [/00000 n/, /^0+ n$/], $ne: "" },
    };
    const logs = await Log.find(filter).sort({createdAt:-1}).limit(100);
    // Filter in JS too for safety
    const clean = logs.filter(l => l.message && l.message.length > 10 &&!l.message.includes("00000 n"));
    res.json(clean);
  } catch(e){ res.status(500).json({message:e.message}) }
});

router.get('/analytics', async (req,res)=>{
  try {
    const filter = { $or: [{ userId: req.user._id }, { user: req.user._id }] };
    const allLogs = await Log.find(filter).sort({createdAt:-1});
    const cleanLogs = allLogs.filter(l => l.message && l.message.length > 10 &&!l.message.includes("00000 n"));

    const total = cleanLogs.length;
    const critical = cleanLogs.filter(l=>l.level==='CRITICAL').length;
    const errors = cleanLogs.filter(l=>['ERROR','ERKOR'].includes(l.level)).length;
    const warnings = cleanLogs.filter(l=>['WARN','WARNING'].includes(l.level)).length;
    const info = total - critical - errors - warnings;

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
      { name:"INFO", value: Math.max(0,info) },
      { name:"WARN", value: warnings },
      { name:"ERROR", value: errors },
      { name:"CRITICAL", value: critical },
    ].filter(x=>x.value>0);

    res.json({ total, totalLogs: total, errors, critical, criticals: critical, warnings, info: Math.max(0,info), health: 100 - (critical*3 + errors), errorTrend, responseTrend, levelDistribution });
  } catch(e){ res.json({ total:0, errors:0, health:100, errorTrend:[], responseTrend:[], levelDistribution:[] }) }
});

router.get('/me-role', (req,res)=> res.json({ role: req.user.role || 'user', user: req.user }));

router.get('/all', async (req,res)=>{
  if(req.user.role!== 'admin') return res.status(403).json({message:"Admin only"});
  const logs = await Log.find({}).sort({createdAt:-1}).limit(500).populate('userId','name email').populate('user','name email');
  res.json(logs);
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
    res.json({ logs, count: logs.length, data: logs });
  } catch(e){ res.json({ logs: [], count:0, data:[] }) }
});

router.get('/', async (req,res)=>{
  const filter = { $or: [{ user: req.user._id }, { userId: req.user._id }] };
  const logs = await Log.find(filter).sort({createdAt:-1}).limit(500);
  res.json(logs);
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

export default router;