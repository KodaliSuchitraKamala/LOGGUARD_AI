import User from "../models/User.js";
import mongoose from "mongoose";
import express from "express";
const router = express.Router();

const handler = async (req, res) => {
  try {
    const email = req.params.email ? req.params.email.toLowerCase().trim() : null;
    let result;
    if(email){
      result = await User.deleteMany({ email });
    } else {
      result = await User.deleteMany({});
    }
    const all = await User.find({}, {email:1}).lean();
    res.json({ dbName: mongoose.connection.name, deletedCount: result.deletedCount, remainingEmails: all.map(u=>u.email) });
  } catch(e){ 
    console.error(e);
    res.status(500).json({error: e.message, stack: e.stack}) 
  }
};

router.get('/nuke/:email', handler);
router.delete('/nuke/:email', handler);
router.get('/nuke-all', handler);
router.delete('/nuke-all', handler);

export default router;