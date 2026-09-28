import { useState, useEffect } from "react";
import { searchLogs, getLatestLogs } from "../services/api";
import EmptyState from "./EmptyState";

const levelColors = { CRITICAL:"bg-red-600 text-white", ERROR:"bg-orange-600 text-white", WARNING:"bg-yellow-500 text-black", WARN:"bg-yellow-500 text-black", INFO:"bg-blue-600 text-white" };
const isGarbage = (msg) => {
  if(!msg) return true;
  const t=msg.trim(); if(t.length<5) return true;
  if(/^0+\s*n+/i.test(t)) return true; if(/^0{5,}/.test(t.replace(/\s/g,''))) return true; return false;
};

export default function LogTable({ initialLogs=[], onUpdate }) {
  const [logs,setLogs]=useState([]); const [keyword,setKeyword]=useState(""); const [level,setLevel]=useState("ALL");
  const [loading,setLoading]=useState(false); const [editingLog,setEditingLog]=useState(null); const [editMsg,setEditMsg]=useState(""); const [editLevel,setEditLevel]=useState("INFO");

  useEffect(()=>{ setLogs((initialLogs||[]).filter(l=>!isGarbage(l.message))); },[initialLogs]);

  const parseLogLine = (log) => {
    const raw = (log.message||"").trim();
    // New clean DB: message already clean, use timestamp field for time
    const timeStr = log.timestamp? new Date(log.timestamp).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',second:'2-digit'}) : "-";
    return {
      displayTime: timeStr,
      realLevel: (log.level||"INFO").toUpperCase().replace('WARN','WARNING'),
      realMessage: raw.replace(/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}\s+\w+\s+/,'').trim(),
      response: "-"
    };
  };

  const handleSearch = async()=>{ setLoading(true); try{ const res=await searchLogs({keyword,level}); const d=Array.isArray(res.data)?res.data:(res.data.logs||[]); setLogs(d.filter(l=>!isGarbage(l.message))); }catch{} setLoading(false); };
  const handleClear = async()=>{ setKeyword(""); setLevel("ALL"); const res=await getLatestLogs(); const d=Array.isArray(res.data)?res.data:(res.data.logs||[]); setLogs(d.filter(l=>!isGarbage(l.message))); onUpdate?.(); };
  const openEdit=(log)=>{ const {realMessage,realLevel}=parseLogLine(log); setEditingLog(log); setEditMsg(realMessage); setEditLevel(realLevel); };
  const saveEdit=async()=>{ try{ const token=localStorage.getItem('token'); const API=import.meta.env.VITE_API_URL; const res=await fetch(`${API}/logs/${editingLog._id}`,{method:'PUT',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({message:editMsg,level:editLevel})}); if(res.ok){ setEditingLog(null); await onUpdate(); } }catch{} };
  const handleDelete=async(id)=>{ if(!confirm("Delete?"))return; const token=localStorage.getItem('token'); const API=import.meta.env.VITE_API_URL; const res=await fetch(`${API}/logs/${id}`,{method:'DELETE',headers:{Authorization:`Bearer ${token}`}}); if(res.ok){ setLogs(p=>p.filter(l=>l._id!==id)); onUpdate?.(); } };

  if(logs.length===0) return <div className="mt-8"><h3 className="text-white font-bold">Live Log Stream <span className="text-xs bg-white/10 px-2 py-1 rounded-full ml-2">0 logs</span></h3><EmptyState/></div>;

  return (
    <div className="mt-6 bg-[#0f172a]/60 border border-white/10 p-5 rounded-2xl">
      <div className="flex justify-between items-center mb-5 flex-wrap gap-3">
        <h3 className="text-white font-bold text-lg">Live Log Stream <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full ml-2">● {logs.length} logs</span></h3>
        <div className="flex gap-2 flex-wrap">
          <input value={keyword} onChange={e=>setKeyword(e.target.value)} placeholder="Search message..." className="bg-zinc-800 border border-white/10 p-2.5 rounded-xl w-full md:w-64 text-white text-sm"/>
          <select value={level} onChange={e=>setLevel(e.target.value)} className="bg-zinc-800 border border-white/10 p-2.5 rounded-xl text-white text-sm"><option value="ALL">ALL</option><option>INFO</option><option>WARNING</option><option>ERROR</option><option>CRITICAL</option></select>
          <button onClick={handleSearch} className="bg-blue-600 px-5 rounded-xl text-sm py-2.5">{loading?"...":"Search"}</button>
          <button onClick={handleClear} className="bg-zinc-700 px-4 rounded-xl text-sm py-2.5">Clear</button>
        </div>
      </div>
      <div className="overflow-auto rounded-xl border border-white/5 max-h-[500px]">
        <table className="w-full text-sm">
          <thead className="bg-zinc-900/80 text-white/60 text-xs uppercase sticky top-0"><tr><th className="p-3 text-left">TIME</th><th className="p-3 text-left">LEVEL</th><th className="p-3 text-left">MESSAGE</th><th className="p-3 text-left">RESPONSE</th><th className="p-3 text-left">EDIT</th><th className="p-3 text-left">DELETE</th></tr></thead>
          <tbody className="divide-y divide-white/5">
            {logs.map((log,i)=>{ const {displayTime,realLevel,realMessage}=parseLogLine(log); return (
              <tr key={log._id||i} className="hover:bg-white/[0.03]">
                <td className="p-3 text-white/60 text-xs font-mono whitespace-nowrap">{displayTime}</td>
                <td className="p-3"><span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${levelColors[realLevel]||levelColors.INFO}`}>{realLevel}</span></td>
                <td className="p-3 text-white/90 text-xs max-w-[400px] truncate" title={realMessage}>{realMessage}</td>
                <td className="p-3 text-white/60 text-xs">-</td>
                <td className="p-3"><button onClick={()=>openEdit(log)} className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-lg text-xs">Edit</button></td>
                <td className="p-3"><button onClick={()=>handleDelete(log._id)} className="bg-red-600/20 text-red-400 px-3 py-1 rounded-lg text-xs">Delete</button></td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>
      {editingLog && <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"><div className="bg-[#1a2332] border border-white/10 p-6 rounded-2xl w-full max-w-lg"><h3 className="text-white font-bold mb-4">Edit Log</h3><select value={editLevel} onChange={e=>setEditLevel(e.target.value)} className="w-full bg-zinc-800 border border-white/10 p-2.5 rounded-xl text-white text-sm mb-3"><option>INFO</option><option>WARNING</option><option>ERROR</option><option>CRITICAL</option></select><textarea value={editMsg} onChange={e=>setEditMsg(e.target.value)} className="w-full bg-zinc-800 border border-white/10 p-2.5 rounded-xl text-white text-sm h-24"/><div className="flex gap-2 mt-4 justify-end"><button onClick={()=>setEditingLog(null)} className="px-4 py-2 bg-zinc-700 rounded-xl text-sm">Cancel</button><button onClick={saveEdit} className="px-4 py-2 bg-blue-600 rounded-xl text-sm">Save</button></div></div></div>}
    </div>
  )
}