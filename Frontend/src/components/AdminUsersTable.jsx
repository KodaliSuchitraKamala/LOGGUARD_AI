import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const api = axios.create({ baseURL: API_URL });
api.interceptors.request.use(c => { c.headers.Authorization = `Bearer ${localStorage.getItem('token')}`; return c; });

export default function AdminUsersTable() {
  const [users, setUsers] = useState([]);
  const { user: me, setUser } = useAuth();
  const fetchUsers = async () => { try { const res = await api.get("/users"); setUsers(res.data); } catch {} }
  useEffect(() => { fetchUsers(); }, []);
  const updateRole = async (id, role) => {
    await api.put(`/users/${id}/role`, {role});
    if (me && (me._id === id || me.id === id)) { const updated = {...me, role}; setUser(updated); localStorage.setItem('user', JSON.stringify(updated)); } // LIVE Navbar update
    fetchUsers();
  }
  const deleteUser = async (id) => { if(!confirm("Delete user?")) return; await api.delete(`/users/${id}`); fetchUsers(); }
  return (
    <div className="bg-gray-800 p-4 rounded-lg mt-6">
      <h2 className="text-xl font-bold mb-4">Admin Panel - User Management</h2>
      <p className="text-xs text-gray-400 mb-2">Change role here, Navbar badge updates instantly.</p>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b border-gray-600">
            <th className="p-2">Email</th>
            <th>Role</th>
            <th>Total</th>
            <th>Critical</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>{users.map(u => (
          <tr key={u._id || u.id} className="border-b border-gray-700">
            <td className="p-2">{u.email} {(u._id===me?._id || u.id===me?.id) && "(You)"}</td>
            <td>
              <select value={u.role} onChange={e=>updateRole(u._id || u.id, e.target.value)} className="bg-gray-700 p-1 rounded">
                <option value="user">user</option>
                <option value="admin">admin</option>
              </select>
            </td>
            <td>{u.totalLogs || 0}</td>
            <td className="text-red-400">{u.stats?.CRITICAL || u.critical || 0}</td>
            <td><button onClick={()=>deleteUser(u._id || u.id)} className="bg-red-600 px-2 py-1 rounded text-xs">Delete</button></td>
          </tr>))}
        </tbody>
      </table>
    </div>
  );
}