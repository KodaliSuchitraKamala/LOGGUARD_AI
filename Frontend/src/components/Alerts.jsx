import { useEffect, useState } from "react";
import { CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import socket from '../socket';

export default function Alerts({ logs = [] }) {
    const [alerts, setAlerts] = useState([]);

    const buildAlerts = (allLogs) => {
        const arr = Array.isArray(allLogs)? allLogs : [];
        const criticals = arr.filter(l => {
            const lvl = (l.level || l.LEVEL || "").toString().toUpperCase();
            return lvl.includes("CRITICAL") || lvl.includes("ERROR");
        }).map(l => ({
            _id: l._id || Math.random().toString(),
            level: (l.level || l.LEVEL || "CRITICAL").toUpperCase(),
            message: l.message || l.MESSAGE || "Unknown error",
            timestamp: l.timestamp || l.TIMESTAMP || l.createdAt || new Date(),
        }));
        setAlerts(criticals);
    };

    useEffect(() => { buildAlerts(logs); }, [logs]);
    useEffect(() => {
        socket.on('new_alert', (a) => setAlerts(p=>[a,...p]));
        socket.on('new_log', () => window.location.reload()); // simple refresh
        return () => { socket.off('new_alert'); socket.off('new_log'); };
    }, []);

    if (logs.length === 0) {
        return (
            <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">🚨 Real-time Alerts</h2>
                <div className="bg-yellow-900/30 border border-yellow-600 p-6 rounded text-center">
                    <p className="text-yellow-400">No logs uploaded yet.</p>
                    <p className="text-xs text-gray-400 mt-1">Upload a log file in Dashboard to see alerts here.</p>
                </div>
            </div>
        );
    }

    if (alerts.length === 0) {
        return (
            <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">🚨 Real-time Alerts</h2>
                <div className="bg-green-900/30 border border-green-600 p-6 rounded text-center">
                    <p className="text-green-400 text-lg">No Anomalies. System Healthy ✅</p>
                    <p className="text-xs text-gray-400 mt-1">{logs.length} logs checked - no CRITICAL found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">🚨 Real-time Alerts ({alerts.length})</h2>
            <div className="space-y-3">
                {alerts.map((alert) => (
                    <div key={alert._id} className={`border-l-4 p-4 rounded flex justify-between items-center ${alert.level==='CRITICAL'?'border-red-500 bg-red-900/30':'border-orange-500 bg-orange-900/30'}`}>
                        <div className="flex-1">
                            <div className="flex gap-3 items-center">
                                <span className={`px-3 py-1 text-white text-xs font-bold rounded ${alert.level==='CRITICAL'?'bg-red-500':'bg-orange-500'}`}>{alert.level}</span>
                                <span className="text-xs text-gray-400">{new Date(alert.timestamp).toLocaleString('en-IN')}</span>
                            </div>
                            <p className="mt-2 font-mono text-sm text-gray-200">{alert.message}</p>
                        </div>
                        <button onClick={() => { setAlerts(p=>p.filter(a=>a._id!==alert._id)); toast.success("Acknowledged ✅"); }} className="ml-4 bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-2 rounded flex items-center gap-1"><CheckCircle size={14}/>Acknowledge</button>
                    </div>
                ))}
            </div>
        </div>
    );
}