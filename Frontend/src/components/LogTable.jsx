import { useState, useEffect } from "react";
import { searchLogs, getLatestLogs } from "../services/api";
import EmptyState from "./EmptyState";

const levelColors = {
  CRITICAL: "bg-red-600 text-white",
  ERROR: "bg-orange-600 text-white",
  WARNING: "bg-yellow-500 text-black",
  WARN: "bg-yellow-500 text-black",
  INFO: "bg-blue-600 text-white",
};

export default function LogTable({ initialLogs = [] }) {
  const [logs, setLogs] = useState(initialLogs);
  const [keyword, setKeyword] = useState("");
  const [level, setLevel] = useState("ALL");
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (initialLogs?.length) setLogs(initialLogs); }, [initialLogs]);

  const parseLogLine = (log) => {
    const parts = (log.message || "").split("|").map(p => p.trim());
    let realTime = parts[0] || "";
    let realLevel = parts[1] || log.level || "INFO";
    let realMessage = parts[2] || log.message;
    let response = parts[3] || "-";
    let displayTime = realTime || (log.timestamp? new Date(log.timestamp).toLocaleString('en-IN') : "-");
    return { displayTime, realLevel, realMessage, response };
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const res = await searchLogs({ keyword, level, page: 1, limit: 100 });
      const data = Array.isArray(res.data)? res.data : (res.data.logs || []);
      setLogs(data);
    } catch(e) {}
    setLoading(false);
  };

  const handleClear = async () => {
    setKeyword(""); setLevel("ALL");
    const res = await getLatestLogs();
    setLogs(Array.isArray(res.data)? res.data : res.data.logs || []);
  };

  if (logs.length === 0) {
    return (
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white font-bold">Live Log Stream <span className="text-xs bg-white/10 text-white/60 px-2 py-1 rounded-full ml-2">0 logs</span></h3>
        </div>
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="mt-6 bg-[#0f172a]/60 backdrop-blur border border-white/10 p-5 rounded-2xl shadow-2xl">
      <div className="flex justify-between items-center mb-5 flex-wrap gap-3">
        <h3 className="text-white font-bold text-lg">Live Log Stream <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full ml-2">● {logs.length} logs</span></h3>
        <div className="flex gap-2">
          <input value={keyword} onChange={e=>setKeyword(e.target.value)} placeholder="Search message, IP..." className="bg-zinc-800/80 border border-white/10 p-2.5 rounded-xl w-64 text-white text-sm outline-none" />
          <select value={level} onChange={e=>setLevel(e.target.value)} className="bg-zinc-800 border border-white/10 p-2.5 rounded-xl text-white text-sm">
            <option value="ALL">ALL LEVELS</option><option value="INFO">INFO</option><option value="WARNING">WARNING</option><option value="ERROR">ERROR</option><option value="CRITICAL">CRITICAL</option>
          </select>
          <button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-500 px-5 rounded-xl text-sm font-semibold">{loading?"...":"Search"}</button>
          <button onClick={handleClear} className="bg-zinc-700 hover:bg-zinc-600 px-4 rounded-xl text-sm">Clear</button>
        </div>
      </div>

      <div className="overflow-auto rounded-xl border border-white/5 max-h-[500px]">
        <table className="w-full text-sm">
          <thead className="bg-zinc-900/80 text-white/60 text-xs uppercase sticky top-0"><tr><th className="text-left p-3">TIME</th><th className="text-left p-3">LEVEL</th><th className="text-left p-3">MESSAGE</th><th className="text-left p-3">RESPONSE</th></tr></thead>
          <tbody className="divide-y divide-white/5">
            {logs.map((log) => {
              const { displayTime, realLevel, realMessage, response } = parseLogLine(log);
              const lvl = realLevel.toUpperCase();
              return (
                <tr key={log._id} className="hover:bg-white/[0.03]">
                  <td className="p-3 text-white/60 whitespace-nowrap text-xs font-mono">{displayTime}</td>
                  <td className="p-3"><span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${levelColors[lvl] || levelColors.INFO}`}>{lvl}</span></td>
                  <td className="p-3 text-white/90 font-mono text-xs truncate max-w-[500px]">{realMessage}</td>
                  <td className="p-3 text-white/60 text-xs">{response}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}