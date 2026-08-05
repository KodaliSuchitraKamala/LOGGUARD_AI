import React, { useState, useEffect } from 'react';

function Alerts() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/alerts')
      .then(res => res.json())
      .then(data => setAlerts(data))
      .catch(err => console.error(err));
  }, []);

  if (alerts.length === 0) {
    return (
      <div className="text-center p-10">
        <h2 className="text-2xl font-bold text-green-500">No Anomalies. System Healthy ✅</h2>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Active Alerts</h2>
      <div className="space-y-4">
        {alerts.map((alert, index) => (
          <div key={index} className={`p-4 rounded-lg border-l-4 ${
            alert.severity === 'HIGH' ? 'border-red-500 bg-red-900/20' : 'border-yellow-500 bg-yellow-900/20'
          }`}>
            <div className="flex justify-between">
              <span className={`font-bold ${alert.level === 'CRITICAL' ? 'text-red-400' : 'text-yellow-400'}`}>
                {alert.level}
              </span>
              <span className="text-sm text-gray-400">{alert.timestamp}</span>
            </div>
            <p className="mt-2 text-gray-200">{alert.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Alerts;