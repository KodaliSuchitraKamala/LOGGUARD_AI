import React, { useState, useEffect } from 'react';

function Dashboard({ data, logs, onRefresh }) {
  const stats = data || {};
  // FIXED: Correct mapping - no fallback of errors to criticals
  const criticals = stats.criticals ?? 0;
  const errors = stats.errors ?? 0;
  const warnings = stats.warnings ?? 0;
  const totalLogs = stats.totalLogs ?? 0;
  const health = stats.health ?? 100;

  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isPolling, setIsPolling] = useState(true);

  useEffect(() => {
    if (!onRefresh || !isPolling) return;
    const interval = setInterval(() => {
      onRefresh();
      setLastUpdated(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, [onRefresh, isPolling]);

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-3 text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isPolling ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></span>
          <span>{isPolling ? 'Auto-refresh: ON (30s)' : 'Auto-refresh: OFF'}</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
          <button onClick={() => setIsPolling(!isPolling)} className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 transition">
            {isPolling ? 'Pause' : 'Resume'}
          </button>
          <button onClick={() => { onRefresh(); setLastUpdated(new Date()); }} className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700 transition">
            Refresh Now
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-red-600 p-4 rounded-lg shadow"><p className="text-sm text-white/80">Critical</p><p className="text-2xl font-bold text-white">{String(criticals)}</p><p className="text-xs text-white/70">Total: {String(totalLogs)}</p></div>
        <div className="bg-orange-600 p-4 rounded-lg shadow"><p className="text-sm text-white/80">Errors</p><p className="text-2xl font-bold text-white">{String(errors)}</p></div>
        <div className="bg-yellow-600 p-4 rounded-lg shadow"><p className="text-sm text-white/80">Warnings</p><p className="text-2xl font-bold text-white">{String(warnings)}</p></div>
        <div className={`p-4 rounded-lg shadow ${health > 80 ? 'bg-green-600' : health > 50 ? 'bg-yellow-600' : 'bg-red-600'}`}><p className="text-sm text-white/80">Health</p><p className="text-2xl font-bold text-white">{String(health)}%</p><p className="text-xs text-white/70">{health > 80 ? 'Healthy' : health > 50 ? 'Degraded' : 'Critical'}</p></div>
      </div>
    </div>
  );
}
export default Dashboard;