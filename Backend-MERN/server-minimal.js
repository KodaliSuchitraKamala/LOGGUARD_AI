import express from 'express';
const app = express();
app.get("/", (req,res)=>res.send("LogGuard API MINIMAL WORKING ✅"));
app.get("/api/health", (req,res)=>res.json({ status: "Working", time: new Date() }));
export default app;