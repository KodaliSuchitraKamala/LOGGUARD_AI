import { useEffect, useState } from 'react';
import API from '../services/api'; 
import { toast } from 'react-hot-toast';

export default function AdminUsersTable() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await API.get('/users'); 
      setUsers(res.data);
    } catch (err) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await API.put(`/users/${userId}/role`, { role: newRole });
      toast.success("Role updated");
      fetchUsers(); 
    } catch (err) {
      toast.error("Failed to update role");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) return <p className="text-gray-400">Loading users...</p>

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">All Users</h2>
      <table className="w-full">
        <thead>
          <tr className="text-left border-b border-gray-600">
            <th className="pb-2">Email</th>
            <th className="pb-2">Role</th>
            <th className="pb-2">Last Login</th>
            <th className="pb-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id} className="border-b border-gray-700">
              <td className="py-2">{user.email}</td>
              <td className="py-2">
                <span className={`px-2 py-1 rounded text-xs ${user.role === 'admin' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}`}>
                  {user.role}
                </span>
              </td>
              <td className="py-2">
                {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
              </td>
              <td className="py-2">
                <select 
                  value={user.role}
                  onChange={(e) => handleRoleChange(user._id, e.target.value)}
                  className="bg-gray-700 text-white rounded px-2 py-1 text-sm"
                >
                  <option value="user">user</option> {/* <- lowercase */}
                  <option value="admin">admin</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}