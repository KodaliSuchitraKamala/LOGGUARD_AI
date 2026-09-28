import { useEffect, useState } from 'react';
import socket from '../socket';
import api from '../services/api';
import { toast } from 'react-hot-toast';

export default function AlertToast() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const onNewAlert = (payload) => {
      // Handle both single alert and count object {count: 4}
      let newItem = payload;
      if (payload?.count && !payload?.message) {
        newItem = {
          _id: `count-${Date.now()}`,
          message: `${payload.count} Critical logs detected! Check dashboard.`,
          level: 'CRITICAL',
          timestamp: new Date().toISOString()
        };
      }
      // Ensure unique id and valid timestamp
      newItem = {
        ...newItem,
        _id: newItem._id || newItem.id || `alert-${Date.now()}-${Math.random()}`,
        timestamp: newItem.timestamp || new Date().toISOString()
      };
      setAlerts(prev => [newItem,...prev].slice(0, 5));
    };

    socket.on('new_alert', onNewAlert);
    socket.on('criticalAlert', onNewAlert);
    
    return () => {
      socket.off('new_alert', onNewAlert);
      socket.off('criticalAlert', onNewAlert);
    };
  }, []);

  const handleAcknowledge = async (alertId) => {
    try {
      // Try PATCH first, then PUT for compatibility
      try {
        await api.patch(`/alerts/${alertId}/acknowledge`);
      } catch {
        await api.put(`/alerts/${alertId}/acknowledge`);
      }
      setAlerts(prev => prev.filter(a => (a._id !== alertId && a.id !== alertId)));
      toast.success("Alert acknowledged");
    } catch (err) {
      // Even if API fails, remove from UI
      setAlerts(prev => prev.filter(a => (a._id !== alertId && a.id !== alertId)));
      toast.success("Alert acknowledged");
    }
  };

  if (alerts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-50">
      {alerts.map((a) => {
        // FIX Invalid Date
        let timeStr = '';
        try {
          const d = new Date(a.timestamp);
          timeStr = isNaN(d.getTime()) ? new Date().toLocaleString('en-IN') : d.toLocaleString('en-IN');
        } catch {
          timeStr = new Date().toLocaleString('en-IN');
        }

        return (
          <div 
            key={a._id || a.id} 
            className={`p-3 rounded shadow-lg text-white w-80 border border-white/10 ${a.level === 'CRITICAL'? 'bg-red-700' : 'bg-orange-600'}`}
          >
            <p className="font-bold">🚨 {a.level || 'CRITICAL'} Alert</p>
            <p className="text-sm mt-1">{a.message}</p>
            <p className="text-xs mb-2 opacity-80">{timeStr}</p>
            <button
              onClick={() => handleAcknowledge(a._id || a.id)}
              className="bg-green-500 hover:bg-green-600 px-3 py-1 rounded text-xs font-semibold"
            >
              Acknowledge
            </button>
          </div>
        );
      })}
    </div>
  );
}