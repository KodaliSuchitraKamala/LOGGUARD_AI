import { useEffect, useState } from 'react';
import socket from '../socket';

export default function AlertToast() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    socket.on('new_alert', (alert) => {
      setAlerts(prev => [alert,...prev].slice(0, 5));
    });
    return () => socket.off('new_alert');
  }, []);

  if(alerts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 space-y-2 z-50">
      {alerts.map((a) => (
        <div key={a.id || a.timestamp} className={`p-3 rounded shadow-lg text-white ${a.level === 'CRITICAL'? 'bg-red-700' : 'bg-orange-600'}`}>
          <p className="font-bold">🚨 {a.level} Alert</p>
          <p className="text-sm">{a.message}</p>
          <p className="text-xs">{a.timestamp}</p>
        </div>
      ))}
    </div>
  );
}