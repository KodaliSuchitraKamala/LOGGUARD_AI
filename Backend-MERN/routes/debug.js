import User from "../models/User.js";
import mongoose from "mongoose";
import express from "express";
const router = express.Router();

router.delete('/nuke/:email', async (req, res) => {
    try {
        const email = req.params.email.toLowerCase().trim();
        const result = await User.deleteMany({ email });
        const all = await User.find({}, {email: 1}).lean();
        const dbName = mongoose.connection.name;
        res.json({ dbName, deletedCount: result.deletedCount, remaining: all });
    } catch(e) {
        res.status(500).json({ error: e.message })
    }
});

router.delete('/nuke-all', async (req, res) => {
    try {
        await User.deleteMany({});
        res.json({ message: "All users deleted", dbName: mongoose.connection.name });
    } catch(e) {
        res.status(500).json({ error: e.message })
    }
});

export default router;