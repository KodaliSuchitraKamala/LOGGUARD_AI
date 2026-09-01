import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Works for both: 
// MERN -> VITE_API_URL=http://localhost:5000/api
// JAVA -> VITE_API_URL=http://localhost:8080/api
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

function AdminUsersTable() {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch(err) {
      console.error("Fetch users failed:", err.message);
    }
  }

  useEffect(() => { fetchUsers(); }, []);

  const updateRole = async (id, role) => {
    await api.put(`/users/${id}/role`, {role});
    fetchUsers();
  }

  const deleteUser = async (id) => {
    if(!confirm("Delete user?")) return;
    await api.delete(`/users/${id}`);
    fetchUsers();
  }

  return (
    <div className="bg-gray-800 p-4 rounded-lg mt-6">
      <h2 className="text-xl font-bold mb-4">Admin Panel - User Management</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left border-b border-gray-600"><th className="p-2">Email</th><th>Role</th><th>Total Logs</th><th>Critical</th><th>Actions</th></tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id || u.id} className="border-b border-gray-700">
                <td className="p-2">{u.email}</td>
                <td>
                  <select value={u.role} onChange={(e)=>updateRole(u._id || u.id, e.target.value)} className="bg-gray-700 p-1 rounded">
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td>{u.totalLogs || 0}</td>
                <td className="text-red-400">{u.stats?.CRITICAL || u.critical || 0}</td>
                <td><button onClick={()=>deleteUser(u._id || u.id)} className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs">Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export default AdminUsersTable;