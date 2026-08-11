import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// Dummy user for testing
const DUMMY_USER = {
  id: '1',
  email: 'admin@logguard.ai',
  password: '1234'
};

// POST /api/auth/login
router.post("/login", async (req, res) =>{
  try {
    const { email, password } = req.body;

    if (email != DUMMY_USER.email) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, DUMMY_USER.password);
    if(!isMarch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // Create JWT
    const payload = { user: { id: DUMMY_USER.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h"
    });

    res.json({ token, user: { id: DUMMY_USER.id, email: DUMMY_USER.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;