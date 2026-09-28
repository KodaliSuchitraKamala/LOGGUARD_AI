import User from "../models/User.js";
import mongoose from "mongoose";
import express from "express";
const router = express.Router();

// MUST be first, before :email routes
router.get('/users', async (req,res)=>{
  try{
    const users = await User.find({}, {name:1, email:1, role:1, createdAt:1}).lean();
    res.json({ dbName: mongoose.connection.name, count: users.length, users });
  }catch(e){ res.status(500).json({error:e.message}) }
});

const handler = async (req, res) => {
  try {
    const email = req.params.email ? req.params.email.toLowerCase().trim() : null;
    let result;
    if(email){
      result = await User.deleteMany({ email });
    } else {
      result = await User.deleteMany({});
    }
    const all = await User.find({}, {name:1, email:1}).lean();
    res.json({ dbName: mongoose.connection.name, deletedCount: result.deletedCount, remaining: all });
  } catch(e){ 
    res.status(500).json({error: e.message, stack: e.stack}) 
  }
};

router.get('/nuke/:email', handler);
router.delete('/nuke/:email', handler);
router.get('/nuke-all', handler);
router.delete('/nuke-all', handler);

export default router;