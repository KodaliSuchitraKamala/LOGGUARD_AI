import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "logguard_secret_123";
const generateToken = (id) => jwt.sign({ id }, JWT_SECRET, { expiresIn: "30d" });

router.post("/register", async (req, res) => {
  try {
    let { name, email, password } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ message: "Full Name is required" });
    if (!email || !password) return res.status(400).json({ message: "Email & Password required" });
    
    name = name.trim().replace(/\s+/g, ' ');
    email = email.toLowerCase().trim();
    
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists - Please Login" });

    const user = await User.create({ name, email, password });
    console.log("NEW USER CREATED:", user.name, user.email); // will show in Vercel logs
    res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role, token: generateToken(user._id) });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;
    email = email.toLowerCase().trim();
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "User not found - Please Register" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: "Invalid password" });

    await User.updateOne({ _id: user._id }, { $set: { lastLogin: new Date() } });
    res.json({ _id: user._id, name: user.name, email: user.email, role: user.role, token: generateToken(user._id) });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/me", protect, async (req, res) => { res.json(req.user); });
export default router;