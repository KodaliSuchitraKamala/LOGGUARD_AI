import express from 'express';
import User from '../models/User.js';
import Log from '../models/Log.js';
import { protect, admin } from '../middleware/authMiddleware.js';
const router = express.Router();

router.use(protect, admin);

router.get('/users', async (req,res)=>{
  try{
    const users = await User.find({}, {password:0}).lean();
    const withCounts = await Promise.all(users.map(async u=>{
      const totalLogs = await Log.countDocuments({ $or: [{user: u._id},{userId: u._id}] });
      const critical = await Log.countDocuments({ $or: [{user: u._id},{userId: u._id}], level: 'CRITICAL' });
      return {...u, totalLogs, critical, stats: { CRITICAL: critical } };
    }));
    res.json(withCounts);
  }catch(e){ res.status(500).json({message:e.message}) }
});

router.put('/users/:id/role', async (req,res)=>{
  const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true }).select('-password');
  res.json(user);
});

router.delete('/users/:id', async (req,res)=>{
  await User.findByIdAndDelete(req.params.id);
  await Log.deleteMany({ $or: [{user: req.params.id},{userId: req.params.id}] });
  res.json({message:"Deleted"});
});

export default router;