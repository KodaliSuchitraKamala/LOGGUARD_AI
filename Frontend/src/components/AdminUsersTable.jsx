import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

export default function AdminUsersTable() {
  const [users, setUsers] = useState([]);
  const [allLogs, setAllLogs] = useState([]);
  const [tab, setTab] = useState('users');
  const [updatingId, setUpdatingId] = useState(null);
  const { user: me } = useAuth();

  const fetchUsers = async () => {
    try {
      const res = await API.get("/admin/users");
      setUsers(res.data);
    } catch (err) {
      console.error("fetchUsers failed", err);
      toast.error("Failed to load users");
    }
  };

  const fetchAllLogs = async () => {
    try {
      const res = await API.get("/logs/all");
      setAllLogs(res.data);
    } catch (err) {
      console.error("fetchAllLogs failed", err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchAllLogs();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    // Prevent self-demote accidentally
    if (userId === me?._id && newRole!== 'admin') {
      if (!window.confirm("You are demoting yourself from admin to user. You will lose admin access. Continue?")) {
        return;
      }
    }

    setUpdatingId(userId);
    try {
      // Your backend route from Day 21: PUT /api/users/:id/role or /admin/users/:id/role
      // Trying both endpoints - adjust as per your backend
      let res;
      try {
        res = await API.put(`/admin/users/${userId}/role`, { role: newRole });
      } catch {
        res = await API.put(`/users/${userId}/role`, { role: newRole });
      }

      // Optimistic update
      setUsers(prev => prev.map(u => u._id === userId? {...u, role: newRole } : u));
      toast.success(`Role changed to ${newRole} ✅`);

      // If you demoted yourself, reload auth
      if (userId === me?._id && newRole!== 'admin') {
        toast("You are no longer admin. Refreshing...");
        setTimeout(() => window.location.reload(), 1000);
      }

    } catch (err) {
      console.error("Role update failed", err);
      toast.error(err.response?.data?.message || "Failed to update role");
      // revert - refetch
      fetchUsers();
    } finally {
      setUpdatingId(null);
    }
  };

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
            <thead>
              <tr className="text-left border-b border-gray-600 text-gray-400">
                <th className="p-2">Name</th>
                <th className="p-2">Email</th>
                <th className="p-2">Role</th>
                <th className="p-2">Total</th>
                <th className="p-2">Critical</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id} className="border-b border-gray-700 hover:bg-gray-700/30">
                  <td className="p-2 whitespace-nowrap">
                    {u.name} {u._id===me?._id && <span className="text-[10px] bg-blue-600 px-1.5 py-0.5 rounded ml-1">You</span>}
                  </td>
                  <td className="p-2 max-w-[120px] md:max-w-none truncate">{u.email}</td>
                  <td className="p-2">
                    <select
                      value={u.role}
                      disabled={updatingId === u._id}
                      onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      className={`px-2 py-1 rounded text-xs font-bold border focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer
                        ${u.role === 'admin'
                         ? 'bg-purple-600 border-purple-500 text-white'
                          : 'bg-green-600 border-green-500 text-white'}
                        ${updatingId === u._id? 'opacity-50 cursor-wait' : ''}
                      `}
                    >
                      <option value="user" className="bg-gray-800">user</option>
                      <option value="admin" className="bg-gray-800">admin</option>
                    </select>
                    {updatingId === u._id && <span className="ml-2 text-[10px] text-gray-400 animate-pulse">...</span>}
                  </td>
                  <td className="p-2 text-center">{u.totalLogs?? 0}</td>
                  <td className="p-2 text-center text-red-400">{u.critical?? 0}</td>
                </tr>
              ))}
            </tbody>
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