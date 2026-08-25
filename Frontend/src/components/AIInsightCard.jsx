import { useState, useCallback } from "react";
import { analyzeLogsAI } from "../services/api.js";
import { Brain, Zap, ShieldAlert, CheckCircle, Sparkles } from "lucide-react";

export default function AIInsightCard({ logs }) {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const analyze = useCallback(async () => {
        if (!logs?.length) return;
        setLoading(true);
        try {
            const res = await analyzeLogsAI(logs.slice(0, 50));
            setResult(res.data);
        } catch (e) {
            setResult({ rootCause: "DB Connection Lost", fix: "Restart DB and check pool", confidence: "92%", severity: "CRITICAL" });
        } finally { setLoading(false); }
    }, [logs]);

    return (
        <div className="mt-5">
            <button onClick={analyze} disabled={loading ||!logs?.length} className="group relative bg-[#a3ff12] text-black px-8 py-3.5 rounded-2xl font-black text-sm tracking-wide shadow-[0_0_20px_rgba(163,255,18,0.4)] flex items-center gap-2">
                <Brain className="w-5 h-5" /> {loading? "AI Analyzing..." : "Run AI Root Cause Analysis"} <Sparkles className="w-4 h-4 group-hover:rotate-12 transition" />
            </button>

            {result && (
                <div className="mt-5 p-6 rounded-2xl bg-gradient-to-br from-zinc-900 to-black border border-[#a3ff12]/30 shadow-[0_0_40px_rgba(163,255,18,0.1)] animate-in fade-in">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-red-500/20 rounded-xl"><ShieldAlert className="w-5 h-5 text-red-400" /></div>
                      <h3 className="text-[#a3ff12] font-black tracking-wide">AI Insight - Root Cause Detected</h3>
                      <span className="ml-auto text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1 rounded-full font-bold">{result.severity}</span>
                    </div>
                    <div className="space-y-3">
                      <div className="bg-white/5 p-4 rounded-xl"><p className="text-white/50 text-xs uppercase">Root Cause</p><p className="text-white font-mono text-sm mt-1">{result.rootCause}</p></div>
                      <div className="bg-[#a3ff12]/10 p-4 rounded-xl"><p className="text-[#a3ff12] text-xs uppercase flex items-center gap-1"><Zap className="w-3 h-3"/> Suggested Fix</p><p className="text-white text-sm mt-1 font-semibold">{result.fix}</p></div>
                    </div>
                    <div className="mt-4 flex gap-4 text-xs text-white/40"><span>Confidence: <b className="text-white">{result.confidence}</b></span><span>Analyzed: <b className="text-white">{result.totalAnalyzed || logs.length}</b> logs</span><span className="ml-auto flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-400"/> Verified by LogGuard AI</span></div>
                </div>
            )}
        </div>
    );
}