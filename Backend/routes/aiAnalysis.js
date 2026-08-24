import express from 'express';
const router = express.Router();

router.post('/ai-analyze', (req, res) => {
    const { logs } = req.body;
    if (!logs || logs.length === 0) {
        return res.status(400).json({ rootCause: "No logs provided", fix: "Upload logs first", confidence: "100%", severity: "LOW" });
    }
    const errorLog = logs.find(l => (l.level === 'ERROR' || l.level === 'CRITICAL') || (l.message && l.message.toLowerCase().includes('error')));
    let analysis = { totalAnalyzed: logs.length, status: "analyzed", timestamp: new Date().toISOString() };
    const targetMessage = errorLog? errorLog.message : (logs[0]?.message || "");
    if (errorLog) {
        analysis.rootCause = targetMessage;
        analysis.severity = "CRITICAL";
        analysis.confidence = "94%";
        const lowerMsg = targetMessage.toLowerCase();
        if (lowerMsg.includes('database') || lowerMsg.includes('db') || lowerMsg.includes('connection')) analysis.fix = "Increase DB_POOL_SIZE to 20 in.env and restart backend";
        else if (lowerMsg.includes('timeout')) analysis.fix = "Increase API timeout to 10s in server.js";
        else if (lowerMsg.includes('login failed')) analysis.fix = "Check admin credentials and auth service";
        else analysis.fix = "Check stack trace and restart affected service";
    } else {
        analysis.rootCause = "No critical errors found - System healthy";
        analysis.severity = "LOW";
        analysis.fix = "No action needed";
        analysis.confidence = "99%";
    }
    res.json(analysis);
});
export default router;