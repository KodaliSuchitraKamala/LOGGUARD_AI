import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { useAuth } from './AuthContext';

export default function AdminUsersTable() {
  const [users, setUsers] = useState([]);
  const [allLogs, setAllLogs] = useState([]);
  const [tab, setTab] = useState('users'); // users | logs
  const { user: me, setUser } = useAuth();

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
    <div className="bg-gray-800 p-4 rounded-lg mt-6">
      <div className="flex gap-2 mb-4">
        <button onClick={()=>setTab('users')} className={`px-3 py-1 rounded ${tab==='users'?'bg-blue-600':'bg-gray-700'}`}>All Users ({users.length})</button>
        <button onClick={()=>setTab('logs')} className={`px-3 py-1 rounded ${tab==='logs'?'bg-blue-600':'bg-gray-700'}`}>All Logs ({allLogs.length}) - 4 Admin + 5 User = 9</button>
      </div>

      {tab==='users'? (
        <table className="w-full text-sm">
          <thead><tr className="text-left border-b border-gray-600"><th className="p-2">Name</th><th>Email</th><th>Role</th><th>Total</th><th>Critical</th></tr></thead>
          <tbody>{users.map(u => (
            <tr key={u._id} className="border-b border-gray-700">
              <td className="p-2">{u.name} {u._id===me?._id && "(You)"}</td>
              <td className="p-2">{u.email}</td>
              <td className="p-2">{u.role}</td>
              <td className="p-2 text-center">{u.totalLogs}</td>
              <td className="p-2 text-center text-red-400">{u.critical}</td>
            </tr>))}</tbody>
        </table>
      ) : (
        <table className="w-full text-sm">
          <thead><tr className="text-left border-b border-gray-600"><th className="p-2">Time</th><th>Level</th><th>Message</th><th>User</th></tr></thead>
          <tbody>{allLogs.map(l=>(
            <tr key={l._id} className="border-b border-gray-700">
              <td className="p-2 text-xs">{new Date(l.timestamp || l.createdAt).toLocaleString()}</td>
              <td className="p-2"><span className={`px-2 py-0.5 rounded text-xs ${l.level==='CRITICAL'?'bg-red-600': l.level==='ERROR'?'bg-orange-600':'bg-gray-600'}`}>{l.level}</span></td>
              <td className="p-2 truncate max-w-[300px]">{l.message}</td>
              <td className="p-2 text-xs text-gray-400">{l.userId?.email || l.user?.email || l.userId?.toString().slice(-4)}</td>
            </tr>
          ))}</tbody>
        </table>
      )}
    </div>
  );
}