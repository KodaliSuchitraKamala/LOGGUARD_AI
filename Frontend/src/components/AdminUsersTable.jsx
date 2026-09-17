import React, { useEffect, useState } from 'react';
import API from '../services/api'; // use your central api instance
import { useAuth } from './AuthContext';

export default function AdminUsersTable() {
  const [users, setUsers] = useState([]);
  const { user: me, setUser } = useAuth();
  const fetchUsers = async () => { 
    try { 
      const res = await API.get("/admin/users"); 
      setUsers(res.data); 
    } catch(e){ console.log(e.response?.data) } 
  }
  useEffect(() => { fetchUsers(); }, []);
  const updateRole = async (id, role) => {
    await API.put(`/admin/users/${id}/role`, {role});
    if (me && (me._id === id || me.id === id)) { 
      const updated = {...me, role}; 
      setUser(updated); 
      localStorage.setItem('user', JSON.stringify(updated)); 
    }
    fetchUsers();
  }
  const deleteUser = async (id) => { 
    if(!confirm("Delete user and all his logs?")) return; 
    await API.delete(`/admin/users/${id}`); 
    fetchUsers(); 
  }
  return (
    <div className="bg-gray-800 p-4 rounded-lg mt-6">
      <h2 className="text-xl font-bold mb-4">Admin Panel - All Users ({users.length})</h2>
      <table className="w-full text-sm">
        <thead><tr className="text-left border-b border-gray-600"><th className="p-2">Name</th><th>Email</th><th>Role</th><th>Total Logs</th><th>Critical</th><th>Actions</th></tr></thead>
        <tbody>{users.map(u => (
          <tr key={u._id} className="border-b border-gray-700">
            <td className="p-2 font-semibold">{u.name} {(u._id===me?._id) && "(You)"}</td>
            <td className="p-2">{u.email}</td>
            <td><select value={u.role} onChange={e=>updateRole(u._id, e.target.value)} className="bg-gray-700 p-1 rounded"><option value="user">user</option><option value="admin">admin</option></select></td>
            <td className="p-2 text-center">{u.totalLogs || 0}</td>
            <td className="text-red-400 text-center">{u.critical || 0}</td>
            <td><button onClick={()=>deleteUser(u._id)} className="bg-red-600 px-2 py-1 rounded text-xs">Delete</button></td>
          </tr>))}</tbody>
      </table>
    </div>
  );
}