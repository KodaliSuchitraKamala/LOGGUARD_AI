import express from 'express';
import User from '../models/User.js';
import Log from '../models/Log.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes need auth + admin
router.use(protect, admin);

// GET /api/admin/users - All users with counts
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 }).lean();
    
    const withCounts = await Promise.all(users.map(async (u) => {
      const totalLogs = await Log.countDocuments({ 
        $or: [{ user: u._id }, { userId: u._id }] 
      });
      const critical = await Log.countDocuments({ 
        $or: [{ user: u._id }, { userId: u._id }], 
        level: 'CRITICAL' 
      });
      return { 
        ...u, 
        totalLogs, 
        critical, 
        stats: { CRITICAL: critical } 
      };
    }));
    
    res.json(withCounts);
  } catch (e) {
    console.error("admin/users error", e);
    res.status(500).json({ message: e.message });
  }
});

// PUT /api/admin/users/:id/role - Update role with validation
router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    const { id } = req.params;

    // 1. Validate role
    if (!role || !["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role. Must be 'user' or 'admin'" });
    }

    // 2. Check user exists
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // 3. Prevent self-demotion to user without confirmation (frontend already confirms, but backend safety)
    if (id === req.user._id.toString() && role !== 'admin') {
      // Allow but log - CTO audit wants this tracked
      console.warn(`ADMIN SELF-DEMOTION: ${req.user.email} demoted self to ${role}`);
    }

    // 4. Prevent demoting last admin
    if (existingUser.role === 'admin' && role === 'user') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ message: "Cannot demote last admin. Create another admin first." });
      }
    }

    const user = await User.findByIdAndUpdate(
      id, 
      { role }, 
      { new: true, runValidators: true }
    ).select('-password');

    res.json(user);

  } catch (e) {
    console.error("role update error", e);
    res.status(500).json({ message: e.message });
  }
});

// DELETE /api/admin/users/:id - Delete user + logs
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Cannot delete yourself
    if (id === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot delete your own account" });
    }

    // 2. Check exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 3. Prevent deleting last admin
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ message: "Cannot delete last admin" });
      }
    }

    await User.findByIdAndDelete(id);
    await Log.deleteMany({ $or: [{ user: id }, { userId: id }] });
    
    res.json({ message: "User and associated logs deleted" });

  } catch (e) {
    console.error("delete user error", e);
    res.status(500).json({ message: e.message });
  }
});

export default router;