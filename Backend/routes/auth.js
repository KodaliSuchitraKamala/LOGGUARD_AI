import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { protect } from "../middleware/authMiddleware.js";
dotenv.config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "logguard_secret_123";
const generateToken = (id) => jwt.sign({ id }, JWT_SECRET, { expiresIn: "30d" });

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if(!email || !password) return res.status(400).json({ message: "Email & Password required" });
    
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) return res.status(400).json({ message: "User already exists - Please Login" });

    const user = await User.create({ name, email: email.toLowerCase(), password });
    res.status(201).json({
      _id: user._id, name: user.name, email: user.email, role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ message: "User not found - Please Register" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: "Invalid password" });

    // FIX: Use updateOne to avoid triggering password hash hook
    await User.updateOne({ _id: user._id }, { lastLogin: new Date() });

    res.json({
      _id: user._id, name: user.name, email: user.email, role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/me", protect, async (req, res) => {
  res.json(req.user);
});

export default router;