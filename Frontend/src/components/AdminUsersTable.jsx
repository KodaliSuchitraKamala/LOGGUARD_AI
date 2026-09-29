import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { useAuth } from './AuthContext';

export default function AdminUsersTable() {
  const [users, setUsers] = useState([]);
  const [allLogs, setAllLogs] = useState([]);
  const [tab, setTab] = useState('users');
  const { user: me } = useAuth();

  const fetchUsers = async () => {
    const res = await API.get("/admin/users");
    setUsers(res.data);
  }
  const fetchAllLogs = async () => {
    const res = await API.get("/logs/all");
    setAllLogs(res.data);
  }

  useEffect(() => { fetchUsers(); fetchAllLogs(); }, []);

  return (
    <div className="bg-gray-800 p-3 md:p-4 rounded-lg mt-6 w-full overflow-hidden border border-gray-700">
      <div className="flex gap-2 mb-4 overflow-x-auto">
        <button onClick={()=>setTab('users')} className={`px-3 py-1.5 rounded text-sm whitespace-nowrap ${tab==='users'?'bg-blue-600':'bg-gray-700'}`}>All Users ({users.length})</button>
        <button onClick={()=>setTab('logs')} className={`px-3 py-1.5 rounded text-sm whitespace-nowrap ${tab==='logs'?'bg-blue-600':'bg-gray-700'}`}>All Logs ({allLogs.length})</button>
      </div>

      <div className="overflow-x-auto -mx-3 md:mx-0">
        <div className="inline-block min-w-full px-3 md:px-0">
        {tab==='users'? (
          <table className="w-full text-xs md:text-sm">
            <thead><tr className="text-left border-b border-gray-600 text-gray-400"><th className="p-2">Name</th><th className="p-2">Email</th><th className="p-2">Role</th><th className="p-2">Total</th><th className="p-2">Critical</th></tr></thead>
            <tbody>{users.map(u => (
              <tr key={u._id} className="border-b border-gray-700 hover:bg-gray-700/30">
                <td className="p-2 whitespace-nowrap">{u.name} {u._id===me?._id && "(You)"}</td>
                <td className="p-2 max-w-[120px] md:max-w-none truncate">{u.email}</td>
                <td className="p-2"><span className="px-2 py-0.5 bg-gray-700 rounded text-xs">{u.role}</span></td>
                <td className="p-2 text-center">{u.totalLogs}</td>
                <td className="p-2 text-center text-red-400">{u.critical}</td>
              </tr>))}</tbody>
          </table>
        ) : (
          <table className="w-full text-xs md:text-sm">
            <thead><tr className="text-left border-b border-gray-600 text-gray-400"><th className="p-2">Time</th><th className="p-2">Level</th><th className="p-2">Message</th><th className="p-2">User</th></tr></thead>
            <tbody>{allLogs.map(l=>(
              <tr key={l._id} className="border-b border-gray-700 hover:bg-gray-700/30">
                <td className="p-2 text-xs whitespace-nowrap">{new Date(l.timestamp || l.createdAt).toLocaleString()}</td>
                <td className="p-2"><span className={`px-2 py-0.5 rounded text-xs whitespace-nowrap ${l.level==='CRITICAL'?'bg-red-600': l.level==='ERROR'?'bg-orange-600':'bg-gray-600'}`}>{l.level}</span></td>
                <td className="p-2 max-w-[150px] md:max-w-[300px] truncate" title={l.message}>{l.message}</td>
                <td className="p-2 text-xs text-gray-400 truncate max-w-[80px]">{l.userId?.email || l.user?.email || "—"}</td>
              </tr>
            ))}</tbody>
          </table>
        )}
        </div>
      </div>
    </div>
  );
}