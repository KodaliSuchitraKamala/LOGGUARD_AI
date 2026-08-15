import { useEffect, useState } from 'react';
import socket from '../socket';
import api from '../services/api'; // make sure you have axios instance here
import { toast } from 'react-hot-toast';

export default function AlertToast() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    socket.on('new_alert', (alert) => {
      setAlerts(prev => [alert,...prev].slice(0, 5));
    });
    return () => socket.off('new_alert');
  }, []);

  const handleAcknowledge = async (alertId) => {
    try {
      await api.patch(`/alerts/${alertId}/acknowledge`);
      setAlerts(prev => prev.filter(a => a._id!== alertId && a.id!== alertId));
      toast.success("Alert acknowledged");
    } catch (err) {
      toast.error("Failed to acknowledge");
    }
  }

  if(alerts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 space-y-2 z-50">
      {alerts.map((a) => (
        <div key={a._id || a.id || a.timestamp} className={`p-3 rounded shadow-lg text-white w-80 ${a.level === 'CRITICAL'? 'bg-red-700' : 'bg-orange-600'}`}>
          <p className="font-bold">🚨 {a.level} Alert</p>
          <p className="text-sm">{a.message}</p>
          <p className="text-xs mb-2">{new Date(a.timestamp).toLocaleString()}</p>
          <button
            onClick={() => handleAcknowledge(a._id || a.id)}
            className="bg-green-500 hover:bg-green-600 px-3 py-1 rounded text-xs font-semibold"
          >
            Acknowledge
          </button>
        </div>
      ))}
    </div>
  );
}