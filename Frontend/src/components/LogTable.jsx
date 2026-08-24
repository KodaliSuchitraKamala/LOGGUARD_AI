import { useState, useEffect } from "react";
import { searchLogs, getLatestLogs } from "../services/api";

const levelColors = {
  CRITICAL: "bg-red-500 text-white-400",
  ERROR: "bg-orange-500 text-white-400",
  WARNING: "bg-yellow-500 text-white-400",
  WARN: "bg-yellow-500 text-white-400",
  INFO: "bg-blue-500 text-white-400",
};

export default function LogTable({ initialLogs = [] }) {
  const [logs, setLogs] = useState(initialLogs);
  const [keyword, setKeyword] = useState("");
  const [level, setLevel] = useState("ALL");
  const [loading, setLoading] = useState(false);

  useEffect(() => { if(initialLogs?.length) setLogs(initialLogs); }, [initialLogs]);

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
    setLogs(Array.isArray(res.data)? res.data : []);
  };

  return (
    <div className="mt-8 bg-[#0f172a]/60 backdrop-blur border border-white/10 p-5 rounded-2xl shadow-2xl">
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-white font-bold text-lg">Live Log Stream <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full ml-2">● {logs.length} logs</span></h3>
        <div className="flex gap-2">
          <input value={keyword} onChange={e=>setKeyword(e.target.value)} placeholder="Search message, user, IP..." className="bg-zinc-800/80 border border-white/10 p-2.5 rounded-xl w-64 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          <select value={level} onChange={e=>setLevel(e.target.value)} className="bg-zinc-800 border border-white/10 p-2.5 rounded-xl text-white text-sm">
            <option value="ALL">ALL LEVELS</option><option value="INFO">INFO</option><option value="WARNING">WARNING</option><option value="ERROR">ERROR</option><option value="CRITICAL">CRITICAL</option>
          </select>
          <button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-500 px-5 rounded-xl text-sm font-semibold transition">{loading?"Searching...":"Search"}</button>
          <button onClick={handleClear} className="bg-zinc-700 hover:bg-zinc-600 px-4 rounded-xl text-sm">Clear</button>
        </div>
      </div>

      <div className="overflow-auto rounded-xl border border-white/5">
        <table className="w-full text-sm">
          <thead className="bg-zinc-900/80 text-white/60 text-xs uppercase tracking-wider"><tr><th className="text-left p-3">Time</th><th className="text-left p-3">Level</th><th className="text-left p-3">Message</th><th className="text-left p-3">Response</th></tr></thead>
          <tbody className="divide-y divide-white/5">
            {logs.map((log,i)=>{
              const lvl = (log.level||"INFO").toUpperCase();
              const color = levelColors[lvl] || levelColors.INFO;
              const parts = log.message.split("|");
              return (
                <tr key={i} className="hover:bg-white/[0.03] transition">
                  <td className="p-3 text-white/50 whitespace-nowrap">{new Date(log.timestamp).toLocaleString('en-IN')}</td>
                  <td className="p-3"><span className={`px-2.5 py-1 rounded-full text-xs font-bold ${color}`}>{lvl}</span></td>
                  <td className="p-3 text-white/90 font-mono text-xs truncate max-w-[500px]">{log.message}</td>
                  <td className="p-3 text-white/60">{parts[2]? parts[2].trim() : "-"}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {logs.length===0 && <div className="p-10 text-center text-white/30">No logs. Upload a file to see magic ✨</div>}
      </div>
    </div>
  )
}