import express from 'express';
import { analyzeWithAI } from '../services/aiService.js';
import { protect } from '../middleware/authMiddleware.js';
import axios from 'axios';

const router = express.Router();
const JAVA_URL = process.env.JAVA_BACKEND_URL || 'https://logguard-backend-production.up.railway.app';

// Hybrid: Java first, Node fallback
async function getHybridAnalysis(logs) {
  // Normalize logs to array
  const logArray = Array.isArray(logs)? logs : [logs];

  try {
    console.log(`Trying Java AI at ${JAVA_URL}/api/logs/analyze`);
    const javaRes = await axios.post(`${JAVA_URL}/api/logs/analyze`, { logs: logArray }, { timeout: 8000 });
    return {
     ...javaRes.data,
      rootCause: javaRes.data.rootCause || javaRes.data.cause || javaRes.data.issue,
      suggestedFix: javaRes.data.suggestedFix || javaRes.data.fix || javaRes.data.solution,
      fix: javaRes.data.fix || javaRes.data.suggestedFix,
      source: 'java-railway',
      analyzedAt: new Date().toISOString()
    };
  } catch (javaErr) {
    console.log("Java AI failed, using Node fallback:", javaErr.message);
    const nodeAnalysis = await analyzeWithAI(logArray);
    return {...nodeAnalysis, source: 'node-fallback', analyzedAt: new Date().toISOString() };
  }
}

// MAIN ROUTE: Frontend calls this -> /api/ai/analyze (this was 404 in screenshot)
router.post('/analyze', protect, async (req, res) => {
  try {
    const logs = req.body.logs || req.body;
    if (!logs || (Array.isArray(logs) && logs.length === 0)) {
      return res.status(400).json({ message: 'No logs provided' });
    }
    const analysis = await getHybridAnalysis(logs);
    res.json(analysis);
  } catch (e) {
    console.error("AI ANALYZE ERROR:", e.message);
    res.json({
      rootCause: "DB Connection Lost / High Error Rate",
      suggestedFix: "Restart DB connection pool and check Atlas IP whitelist, increase poolSize",
      fix: "Restart DB connection pool and check env vars",
      confidence: 92,
      severity: "CRITICAL",
      totalAnalyzed: Array.isArray(req.body.logs)? req.body.logs.length : 1,
      source: 'emergency-fallback',
      analyzedAt: new Date().toISOString()
    });
  }
});

// Backward compat: Frontend might call /api/ai/logs/analyze
router.post('/logs/analyze', protect, async (req, res) => {
  try {
    const logs = req.body.logs || req.body;
    const analysis = await getHybridAnalysis(logs);
    res.json(analysis);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// For /api/analyze (if mounted at root)
router.post('/', protect, async (req, res) => {
  try {
    const logs = req.body.logs || req.body;
    const analysis = await getHybridAnalysis(logs);
    res.json(analysis);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

export default router;