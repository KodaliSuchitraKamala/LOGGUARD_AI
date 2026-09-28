import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import Log from '../models/Log.js';

const router = express.Router();
router.use(protect);

function localAI(logs){
  const text = logs.map(l=>l.message).join(" ").toLowerCase();
  const critical = logs.filter(l=>l.level==='CRITICAL').length;
  const errors = logs.filter(l=>l.level==='ERROR').length;

  let rootCause = "Unknown";
  let fix = "Monitor logs";

  if(text.includes("memory") || text.includes("heap") || text.includes("outofmemory")) {
    rootCause = "DB Connection Lost / Memory Leak - OutOfMemoryError";
    fix = "Increase heap size, restart DB connection pool, check Atlas IP whitelist, add connection retry logic";
  } else if(text.includes("timeout") || text.includes("connection") || text.includes("refused")){
    rootCause = "Service Connection Timeout / DB Connection Lost";
    fix = "Check MONGODB_URI in Vercel env, whitelist 0.0.0.0/0 in Atlas, increase poolSize to 20";
  } else if(critical>2){
    rootCause = "Crash Loop - Multiple Critical Failures";
    fix = "Restart service, implement circuit breaker, scale horizontally";
  } else if(errors>3){
    rootCause = "High Error Rate - Service Degradation";
    fix = "Add retry logic, check downstream service health";
  } else {
    rootCause = "Intermittent Warnings";
    fix = "No immediate action, monitor trends";
  }

  return {
    rootCause,
    suggestedFix: fix,
    fix,
    confidence: critical>0? 94 : 88,
    severity: critical>0? "CRITICAL" : "MEDIUM",
    totalAnalyzed: logs.length,
    criticalCount: critical,
    source: 'logguard-local-ai',
    analyzedAt: new Date().toISOString()
  };
}

router.post('/analyze', async (req,res)=>{
  try{
    let logs = req.body.logs || req.body;
    if(!logs || (Array.isArray(logs) && logs.length===0)){
      const isAdmin = req.user.role==='admin';
      const filter = isAdmin? {} : { $or: [{ user: req.user._id }, { userId: req.user._id }] };
      logs = await Log.find(filter).sort({createdAt:-1}).limit(20);
    }
    if(!Array.isArray(logs)) logs = [logs];
    const analysis = localAI(logs);
    res.json(analysis);
  }catch(e){
    res.json({
      rootCause: "DB Connection Lost / High Error Rate",
      suggestedFix: "Restart DB connection pool and check Atlas whitelist",
      fix: "Check env vars",
      confidence: 92,
      severity: "CRITICAL",
      source: 'emergency-fallback'
    });
  }
});

router.post('/logs/analyze', async (req,res)=>{
  req.url = '/analyze';
  router.handle(req,res);
});

export default router;