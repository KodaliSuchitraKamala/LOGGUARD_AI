import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = { INFO: '#3B82F6', WARN: '#F59E0B', ERROR: '#EF4444', CRITICAL: '#7F1D1D' };

export default function Analytics({ data }) {
    if (!data) return <p className="text-gray-400">Loading analytics...</p>;

    // Safety: default to empty array if backend hasn't sent it yet
    const levelData = data.levelDistribution || [];

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Analytics</h2>
            
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-800 p-4 rounded-lg">Total Logs: <span className="font-bold text-xl">{data.totalLogs}</span></div>
                <div className="bg-red-900 p-4 rounded-lg">Errors: <span className="font-bold text-xl">{data.errors}</span></div>
                <div className="bg-blue-900 p-4 rounded-lg">Avg Response: <span className="font-bold text-xl">{data.avgResponseTime}ms</span></div>
                <div className="bg-green-900 p-4 rounded-lg">Health: <span className="font-bold text-xl">{data.health}%</span></div>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-800 p-4 rounded-lg">
                    <h3 className="font-bold mb-2">Error Trend - 7 Days</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={data.errorTrend || []}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151"/>
                            <XAxis dataKey="date" stroke="#9CA3AF"/>
                            <YAxis stroke="#9CA3AF"/>
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="count" stroke="#EF4444" name="Errors per Day" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-gray-800 p-4 rounded-lg">
                    <h3 className="font-bold mb-2">Response Time</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={data.responseTrend || []}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151"/>
                            <XAxis dataKey="date" stroke="#9CA3AF"/>
                            <YAxis stroke="#9CA3AF"/>
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="avg" stroke="#3B82F6" name="Avg Response Time (ms)" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* PIE CHART */}
            <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="font-bold mb-2">Log Level Distribution</h3>
                {levelData.length > 0? (
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie 
                                data={levelData} 
                                dataKey="value" 
                                nameKey="name" 
                                cx="50%" 
                                cy="50%" 
                                outerRadius={100} 
                                label
                            >
                                {levelData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#6B7280'} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <p className="text-gray-400 text-center py-10">Upload logs to see distribution</p>
                )}
            </div>
        </div>
    );
}