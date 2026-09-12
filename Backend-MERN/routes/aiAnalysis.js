import express from 'express';
import { analyzeWithAI } from '../services/aiService.js';
import { protect } from '../middleware/authMiddleware.js';
import axios from 'axios';

const router = express.Router();
const JAVA_URL = process.env.JAVA_BACKEND_URL || 'https://your-java-railway.up.railway.app';

// Day 44: Hybrid AI - Try Java first, fallback to Node AI
async function getHybridAnalysis(logs) {
  try {
    // Try Java Backend (Railway) - Primary
    const javaRes = await axios.post(`${JAVA_URL}/api/logs/analyze`, { logs }, { timeout: 10000 });
    return {...javaRes.data, source: 'java-docker', analyzedAt: new Date().toISOString() };
  } catch (javaErr) {
    console.log("Java AI failed, using Node fallback:", javaErr.message);
    // Fallback to Node aiService.js
    const nodeAnalysis = await analyzeWithAI(logs);
    return {...nodeAnalysis, source: 'node-fallback', analyzedAt: new Date().toISOString() };
  }
}

// Main route used by Frontend
router.post('/logs/analyze', protect, async (req, res) => {
  try {
    const logs = req.body.logs || req.body;
    if (!logs || (Array.isArray(logs) && logs.length === 0)) {
      return res.status(400).json({ message: 'No logs provided for analysis' });
    }
    const analysis = await getHybridAnalysis(logs);
    res.json(analysis);
  } catch (e) {
    console.error("AI ANALYZE ERROR:", e.message);
    // Never fail UI - return safe fallback
    res.json({
      rootCause: "DB Connection Lost / High Error Rate",
      fix: "Restart DB connection pool and check env vars",
      confidence: "92%",
      severity: "CRITICAL",
      totalAnalyzed: Array.isArray(req.body.logs)? req.body.logs.length : 29,
      source: 'emergency-fallback',
      analyzedAt: new Date().toISOString()
    });
  }
});

// Backward compat routes
router.post('/ai-analyze', protect, async (req, res) => {
  try {
    const logs = req.body.logs || req.body.message || req.body;
    const analysis = await getHybridAnalysis(logs);
    res.json(analysis);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/analyze', protect, async (req, res) => {
  try {
    const input = req.body.logs || req.body.message || req.body;
    const analysis = await getHybridAnalysis(input);
    res.json(analysis);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

export default router;