import React from 'react';
import { useEffect, useState, useRef } from "react";
import API from '../services/api';
import socket from '../services/socket';
import { toast } from 'react-hot-toast'; 
import { CheckCircle } from 'lucide-react';

export default function Alerts() {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const audioRef = useRef(null);

    const fetchAlerts = async () => {
        try {
            const res = await API.get('/alerts');
            setAlerts(res.data);
        } catch (err) {
            console.error("FETCH ALERTS ERROR:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAcknowledge = async (id) => {
        try {
            console.log("Acknowledging ID:", id) // DEBUG
            await API.post(`/alerts/${id}/acknowledge`);
            setAlerts(prev => prev.filter(a => a.id!== id));
            toast.success("Alert Acknowledged ✅");
        } catch (err) {
            console.log("ACK ERROR FULL:", err.response) // SEE REAL ERROR
            toast.error(err.response?.data?.error || "Failed to acknowledge");
        }
    }

    const playAlarm = () => {
        if(audioRef.current) {
            audioRef.currentTime = 0;
            audioRef.current.play().catch(() => {});
        }
    }

    useEffect(() => {
        fetchAlerts();
        
        socket.on('new_anomaly', (newAnomalies) => {
            setAlerts(prev => [...newAnomalies,...prev]);
            const criticals = newAnomalies.filter(a => a.level === 'CRITICAL');
            if(criticals.length > 0) {
                playAlarm();
                toast.error(`🚨 CRITICAL: ${criticals[0].message}`, { duration: 8000 });
            }
        });

        socket.on('alerts_updated', (updatedAlerts) => {
            setAlerts(updatedAlerts);
        });

        return () => { 
            socket.off('new_anomaly');
            socket.off('alerts_updated');
        };
    }, []);

    const getLevelColor = (level) => {
        if (level === 'CRITICAL') return 'bg-red-500 animate-pulse';
        if (level === 'ERROR') return 'bg-orange-500';
        if (level === 'WARNING') return 'bg-yellow-500';
        return 'bg-blue-500';
    };

    if (loading) return <p className="p-4">Loading Alerts...</p>;

    return (
        <div className="p-6">
            <audio ref={audioRef} src="/alarm.mp3" preload="auto" />
            <h2 className="text-2xl font-bold mb-4">🚨 Real-time Alerts</h2>

            {alerts.length === 0? (
                <div className="bg-green-900/30 border border-green-600 p-4 rounded">
                    <p className="text-green-400">No Anomalies. System Healthy ✅</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {alerts.map((alert) => (
                        <div key={alert.id} className={`border-l-4 p-4 rounded shadow-sm flex justify-between items-center ${alert.level === 'CRITICAL'? 'border-red-500 bg-red-900/30' : 'border-orange-500 bg-orange-900/30'}`}>
                            <div className="flex-1">
                                <div className="flex gap-3 items-center">
                                    <span className={`px-3 py-1 text-white text-xs font-bold rounded ${getLevelColor(alert.level)}`}>{alert.level}</span>
                                    <span className="text-xs text-gray-400">ID: {alert.id?.slice(0,8)}... {new Date(alert.timestamp).toLocaleString()}</span>
                                </div>
                                <p className="mt-2 font-mono text-sm text-gray-200">{alert.message}</p>
                            </div>
                            <button 
                                onClick={() => handleAcknowledge(alert.id)}
                                className="ml-4 bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-2 rounded flex items-center gap-1">
                                <CheckCircle size={14} /> Acknowledge
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}