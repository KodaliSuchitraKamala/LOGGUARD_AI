import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = { INFO: '#3B82F6', WARN: '#F59E0B', ERROR: '#EF4444', CRITICAL: '#7F1D1D' };

export default function Analytics({ data }) {
    if (!data) return <p className="text-gray-400 p-6 animate-pulse">Loading analytics...</p>;
    
    // SAFE parsing - prevents NaN
    const totalLogs = data.totalLogs ?? data.total ?? 0;
    const errors = Number(data.errors ?? 0);
    const criticals = Number(data.criticals ?? data.critical ?? 0);
    const avgResponse = Number(data.avgResponseTime ?? data.avgResponse ?? 0);
    const health = Number(data.health ?? 100);
    const levelData = data.levelDistribution ?? [];
    const errorTrend = data.errorTrend ?? [];
    const responseTrend = data.responseTrend ?? [];

    return (
        <div className="animate-in fade-in">
            <h2 className="text-2xl font-bold mb-6">Analytics</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-800 p-4 rounded-lg">Total Logs: <span className="font-bold text-xl float-right">{String(totalLogs)}</span></div>
                <div className="bg-red-800 p-4 rounded-lg">Errors: <span className="font-bold text-xl float-right text-red-400">{String(errors + criticals)}</span></div>
                <div className="bg-blue-800 p-4 rounded-lg">Avg Response: <span className="font-bold text-xl float-right text-blue-400">{String(avgResponse)}ms</span></div>
                <div className="bg-green-800 p-4 rounded-lg">Health: <span className="font-bold text-xl float-right text-green-400">{String(health)}%</span></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                    <h3 className="font-bold mb-4">Error Trend - 7 Days</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={errorTrend}><CartesianGrid strokeDasharray="3 3" stroke="#374151"/><XAxis dataKey="date" stroke="#9CA3AF"/><YAxis stroke="#9CA3AF"/><Tooltip contentStyle={{background:'#1f2937', border:'none'}}/><Legend/><Line type="monotone" dataKey="count" stroke="#EF4444" strokeWidth={2} dot={{fill:'#EF4444'}}/></LineChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                    <h3 className="font-bold mb-4">Response Time Trend</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={responseTrend}><CartesianGrid strokeDasharray="3 3" stroke="#374151"/><XAxis dataKey="date" stroke="#9CA3AF"/><YAxis stroke="#9CA3AF"/><Tooltip contentStyle={{background:'#1f2937', border:'none'}}/><Legend/><Line type="monotone" dataKey="avg" stroke="#3B82F6" strokeWidth={2} /></LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <h3 className="font-bold mb-2">Log Level Distribution</h3>
                {levelData.reduce((a,b)=>a+(b.value||0),0) > 0? (
                    <ResponsiveContainer width="100%" height={300}><PieChart><Pie data={levelData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({name,value})=> `${name}: ${value}`} >{levelData.map((e,i)=><Cell key={i} fill={COLORS[e.name] || '#8884d8'}/>)}</Pie><Tooltip/><Legend/></PieChart></ResponsiveContainer>
                ) : <p className="text-gray-400 text-center py-16">No logs yet - Upload.log files to see charts</p>}
            </div>
        </div>
    );
}