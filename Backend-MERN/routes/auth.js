import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { protect } from "../middleware/authMiddleware.js";
dotenv.config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "logguard_secret_123";

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: "30d" });
};

// @desc Register
// @route POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log("REGISTER ATTEMPT:", email);

    if (!email ||!password) {
      return res.status(400).json({ message: "Email & Password required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be 6+ chars" });
    }

    const lowerEmail = email.toLowerCase().trim();
    const userExists = await User.findOne({ email: lowerEmail });

    if (userExists) {
      return res.status(400).json({ message: "User already exists - Please Login" });
    }

    const user = await User.create({
      name: name?.trim() || lowerEmail.split('@')[0],
      email: lowerEmail,
      password
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

// @desc Login
// @route POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("LOGIN ATTEMPT:", email);

    if (!email ||!password) {
      return res.status(400).json({ message: "Email & Password required" });
    }

    const lowerEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: lowerEmail });

    if (!user) {
      return res.status(401).json({ message: "User not found - Please Register" });
    }

    if (!user.password) {
      return res.status(500).json({ message: "User has no password field in DB" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Safe update without triggering pre-save hook
    await User.updateOne({ _id: user._id }, { $set: { lastLogin: new Date() } });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ message: error.message, stack: error.stack });
  }
});

router.get("/me", protect, async (req, res) => {
  res.json(req.user);
});

export default router;