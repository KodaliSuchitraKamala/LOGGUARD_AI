import { useState, useEffect } from "react";
import { searchLogs, getLatestLogs } from "../services/api";
import EmptyState from "./EmptyState";

const levelColors = {
  CRITICAL: "bg-red-600 text-white",
  ERROR: "bg-orange-600 text-white",
  ERKOR: "bg-orange-600 text-white",
  WARNING: "bg-yellow-500 text-black",
  WARN: "bg-yellow-500 text-black",
  INFO: "bg-blue-600 text-white",
};

export default function LogTable({ initialLogs = [], onUpdate }) {
  const [logs, setLogs] = useState(initialLogs);
  const [keyword, setKeyword] = useState("");
  const [level, setLevel] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [editingLog, setEditingLog] = useState(null);
  const [editMsg, setEditMsg] = useState("");
  const [editLevel, setEditLevel] = useState("INFO");

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

  // EDIT
  const openEdit = (log) => {
    const { realMessage, realLevel } = parseLogLine(log);
    setEditingLog(log);
    setEditMsg(realMessage);
    setEditLevel(realLevel);
  };

  const saveEdit = async () => {
    try {
      const token = localStorage.getItem('token');
      const API = import.meta.env.VITE_API_URL;
      const res = await fetch(`${API}/logs/${editingLog._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: editMsg, level: editLevel })
      });
      if(res.ok) {
        setEditingLog(null);
        onUpdate?.(); // refresh dashboard + analytics
        handleClear();
      }
    } catch(e) { alert("Edit failed"); }
  };

  // DELETE
  const handleDelete = async (id) => {
    if(!confirm("Delete this log permanently?")) return;
    try {
      const token = localStorage.getItem('token');
      const API = import.meta.env.VITE_API_URL;
      const res = await fetch(`${API}/logs/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if(res.ok) {
        setLogs(prev => prev.filter(l => (l._id || l.id)!== id));
        onUpdate?.();
      }
    } catch(e) { alert("Delete failed"); }
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
          <thead className="bg-zinc-900/80 text-white/60 text-xs uppercase sticky top-0">
            <tr>
              <th className="text-left p-3">TIME</th>
              <th className="text-left p-3">LEVEL</th>
              <th className="text-left p-3">MESSAGE</th>
              <th className="text-left p-3">RESPONSE</th>
              <th className="text-left p-3">EDIT</th>
              <th className="text-left p-3">DELETE</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {logs.map((log, index) => {
              const { displayTime, realLevel, realMessage, response } = parseLogLine(log);
              const lvl = realLevel.toUpperCase();
              return (
                <tr key={log._id || log.id || index} className="hover:bg-white/[0.03]">
                  <td className="p-3 text-white/60 whitespace-nowrap text-xs font-mono">{displayTime}</td>
                  <td className="p-3"><span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${levelColors[lvl] || levelColors.INFO}`}>{lvl}</span></td>
                  <td className="p-3 text-white/90 font-mono text-xs truncate max-w-[400px]">{realMessage}</td>
                  <td className="p-3 text-white/60 text-xs">{response}</td>
                  <td className="p-3"><button onClick={()=>openEdit(log)} className="bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white px-3 py-1 rounded-lg text-xs">Edit</button></td>
                  <td className="p-3"><button onClick={()=>handleDelete(log._id)} className="bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white px-3 py-1 rounded-lg text-xs">Delete</button></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingLog && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a2332] border border-white/10 p-6 rounded-2xl w-full max-w-lg">
            <h3 className="text-white font-bold mb-4">Edit Log</h3>
            <label className="text-xs text-white/60">Level</label>
            <select value={editLevel} onChange={e=>setEditLevel(e.target.value)} className="w-full bg-zinc-800 border border-white/10 p-2.5 rounded-xl text-white text-sm mb-3">
              <option>INFO</option><option>WARNING</option><option>ERROR</option><option>CRITICAL</option>
            </select>
            <label className="text-xs text-white/60">Message</label>
            <textarea value={editMsg} onChange={e=>setEditMsg(e.target.value)} className="w-full bg-zinc-800 border border-white/10 p-2.5 rounded-xl text-white text-sm h-24" />
            <div className="flex gap-2 mt-4 justify-end">
              <button onClick={()=>setEditingLog(null)} className="px-4 py-2 bg-zinc-700 rounded-xl text-sm">Cancel</button>
              <button onClick={saveEdit} className="px-4 py-2 bg-blue-600 rounded-xl text-sm font-semibold">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}