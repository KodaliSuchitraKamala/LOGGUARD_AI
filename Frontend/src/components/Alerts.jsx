import { useEffect, useState } from "react";
import { CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import socket from '../services/socket';

export default function Alerts({ logs = [] }) {
    const [alerts, setAlerts] = useState([]);

    const buildAlerts = (allLogs) => {
        const arr = Array.isArray(allLogs)? allLogs : [];
        const criticals = arr.filter(l => {
            const lvl = (l.level || l.LEVEL || "").toString().toUpperCase();
            return lvl.includes("CRITICAL") || lvl.includes("ERROR");
        }).map(l => ({
            _id: l._id || l.id || Math.random().toString(36).substr(2,9),
            level: (l.level || l.LEVEL || "CRITICAL").toUpperCase(),
            message: l.message || l.MESSAGE || "Unknown error",
            timestamp: l.timestamp || l.TIMESTAMP || l.createdAt || new Date(),
        }));
        setAlerts(criticals);
    };

    useEffect(() => { buildAlerts(logs); }, [logs]);

    useEffect(() => {
        const handleNewAlert = (a) => setAlerts(p => [a,...p]);
        const handleNewLog = (newLog) => {
            const lvl = (newLog.level || "").toUpperCase();
            if(lvl.includes("CRITICAL") || lvl.includes("ERROR")){
                setAlerts(p => [{
                    _id: newLog._id || Math.random().toString(),
                    level: lvl,
                    message: newLog.message,
                    timestamp: newLog.timestamp || new Date()
                },...p]);
            }
        };
        socket.on('new_alert', handleNewAlert);
        socket.on('new_log', handleNewLog);
        return () => { socket.off('new_alert', handleNewAlert); socket.off('new_log', handleNewLog); };
    }, []);

    if (logs.length === 0) {
        return (
            <div className="p-4 md:p-6">
                <h2 className="text-xl md:text-2xl font-bold mb-4">🚨 Real-time Alerts</h2>
                <div className="bg-yellow-900/30 border border-yellow-600 p-6 rounded text-center">
                    <p className="text-yellow-400">No logs uploaded yet.</p>
                    <p className="text-xs text-gray-400 mt-1">Upload a log file in Dashboard to see alerts here.</p>
                </div>
            </div>
        );
    }

    if (alerts.length === 0) {
        return (
            <div className="p-4 md:p-6">
                <h2 className="text-xl md:text-2xl font-bold mb-4">🚨 Real-time Alerts</h2>
                <div className="bg-green-900/30 border border-green-600 p-6 rounded text-center">
                    <p className="text-green-400 text-lg">No Anomalies. System Healthy ✅</p>
                    <p className="text-xs text-gray-400 mt-1">{logs.length} logs checked - no CRITICAL found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 w-full overflow-hidden">
            <h2 className="text-xl md:text-2xl font-bold mb-4">🚨 Alerts ({alerts.length})</h2>
            <div className="space-y-3">
                {alerts.map((alert) => (
                    <div key={alert._id} className={`border-l-4 p-3 md:p-4 rounded flex flex-col md:flex-row md:justify-between md:items-center gap-3 ${alert.level==='CRITICAL'?'border-red-500 bg-red-900/30':'border-orange-500 bg-orange-900/30'}`}>
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap gap-2 md:gap-3 items-center">
                                <span className={`px-2 md:px-3 py-1 text-white text-xs font-bold rounded ${alert.level==='CRITICAL'?'bg-red-500':'bg-orange-500'}`}>{alert.level}</span>
                                <span className="text-xs text-gray-400">{new Date(alert.timestamp).toLocaleString('en-IN')}</span>
                            </div>
                            <p className="mt-2 font-mono text-xs md:text-sm text-gray-200 break-all">{alert.message}</p>
                        </div>
                        <button onClick={() => { setAlerts(p=>p.filter(a=>a._id!==alert._id)); toast.success("Acknowledged ✅"); }} className="self-start md:self-auto bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-2 rounded flex items-center gap-1 shrink-0"><CheckCircle size={14}/>Acknowledge</button>
                    </div>
                ))}
            </div>
        </div>
    );
}