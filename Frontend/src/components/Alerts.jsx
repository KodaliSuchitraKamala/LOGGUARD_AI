import React from 'react';
import { useEffect, useState, useRef } from "react";
import axios from 'axios';
import socket from '../services/socket';
import { toast } from 'react-hot-toast'; 

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Alerts() {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const audioRef = useRef(null);

    const fetchAlerts = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/alerts`);
            setAlerts(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = async (index) => {
        await axios.post(`${API_URL}/api/alerts/resolve/${index}`);
        // UI will update via socket, but also refresh just in case
        fetchAlerts();
        toast.success("Alert Acknowledged ✅");
    }

    const playAlarm = () => {
        if(audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => {}); // browser might block
        }
    }

    useEffect(() => {
        fetchAlerts();
        
        socket.on('new_anomaly', (newAnomalies) => {
            setAlerts(prev => [...newAnomalies,...prev]);
            
            // Toast + Sound for CRITICAL
            const criticals = newAnomalies.filter(a => a.severity === 'High');
            if(criticals.length > 0) {
                playAlarm(); // 5% remaining: needs alarm.mp3 in /public
                toast.error(`🚨 CRITICAL: ${criticals[0].message}`, {
                    duration: 8000,
                    style: { background: '#dc2626', color: 'white', fontWeight: 'bold' }
                });
            } else {
                toast(`⚠️ New ${newAnomalies.length} anomaly detected`, { icon: '⚠️' });
            }
        });

        socket.on('alerts_updated', (updatedAlerts) => { // DAY 14: live remove
            setAlerts(updatedAlerts);
        });

        return () => {
            socket.off('new_anomaly');
            socket.off('alerts_updated');
        };
    }, []);

    const getSeverityColor = (severity) => {
        if (severity === 'High') return 'bg-red-500 animate-pulse';
        if (severity === 'Medium') return 'bg-orange-500';
        return 'bg-yellow-500';
    };

    if (loading) return <p className="p-4">Loading Alerts...</p>;

    return (
        <div className="p-6">
            <audio ref={audioRef} src="/alarm.mp3" preload="auto" /> {/* 5% for Day 13 */}
            <h2 className="text-2xl font-bold mb-4">🚨 Real-time Alerts</h2>

            {alerts.length === 0? (
                <div className="bg-green-50 border border-green-200 p-4 rounded">
                    <p className="text-green-700">No Anomalies. System Healthy ✅</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {alerts.map((alert, idx) => (
                        <div key={idx} className={`border-l-4 p-4 rounded shadow-sm flex justify-between items-center ${alert.severity === 'High'? 'border-red-500 bg-red-900/30' : 'border-orange-500 bg-orange-900/30'}`}>
                            <div className="flex-1">
                                <div className="flex gap-3 items-center">
                                    <span className={`px-3 py-1 text-white text-xs font-bold rounded ${getSeverityColor(alert.severity)}`}>{alert.severity}</span>
                                    <span className="text-xs text-gray-400">{new Date(alert.detectedAt).toLocaleString()}</span>
                                </div>
                                <p className="mt-2 font-mono text-sm text-gray-200">[{alert.level}] {alert.message}</p>
                            </div>
                            {/* ACKNOWLEDGE BUTTON */}
                            <button 
                                onClick={() => handleResolve(idx)}
                                className="ml-4 bg-gray-700 hover:bg-gray-600 text-white text-xs px-3 py-1 rounded">
                                Acknowledge
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}