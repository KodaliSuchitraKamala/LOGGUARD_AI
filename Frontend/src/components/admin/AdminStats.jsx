import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export default function AdminStats({ stats }) {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const logData = [
    { name: 'INFO', count: stats.info },
    { name: 'WARN', count: stats.warn },
    { name: 'ERROR', count: stats.error },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Logs by Level</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={logData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Users by Role</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={stats.roleData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
              {stats.roleData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}