import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if(!name ||!email ||!password) return res.status(400).json({ error: 'All fields required' });

    await db.read();
    db.data = db.data || { users: [], logs: [], alerts: [] };
    
    if ((db.data.users || []).find(u => u.email === email)) return res.status(400).json({ error: 'User exists' });

    const hashed = await bcrypt.hash(password, 10);
    const newUser = { id: Date.now().toString(), name, email, password: hashed };
    db.data.users = db.data.users || [];
    db.data.users.push(newUser);
    await db.write();
    res.json({ message: 'Registered' });
  } catch (error) {
    console.error("REGISTER ERROR:", error)
    res.status(500).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    await db.read();
    db.data = db.data || { users: [], logs: [], alerts: [] };
    
    const user = (db.data.users || []).find(u => u.email === email);
    if (!user ||!await bcrypt.compare(password, user.password)) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    console.error("LOGIN ERROR:", error)
    res.status(500).json({ error: error.message });
  }
});

export default router;