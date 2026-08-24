import React from 'react';

function Dashboard({ data }) {
  const stats = data || { criticals: 0, errors: 0, warnings: 0, health: 100, totalLogs: 0 };
  const { criticals, errors, warnings, health, totalLogs } = stats;

  return (
    <div className="mb-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-red-600 p-4 rounded-lg"><p className="text-sm text-white/80">Critical</p><p className="text-2xl font-bold">{criticals?? 0}</p><p className="text-xs">Total: {totalLogs?? 0}</p></div>
        <div className="bg-orange-600 p-4 rounded-lg"><p className="text-sm text-white/80">Errors</p><p className="text-2xl font-bold">{errors?? 0}</p></div>
        <div className="bg-yellow-600 p-4 rounded-lg"><p className="text-sm text-white/80">Warnings</p><p className="text-2xl font-bold">{warnings?? 0}</p></div>
        <div className={`p-4 rounded-lg ${health > 80? 'bg-green-600' : health > 50? 'bg-yellow-600' : 'bg-red-600'}`}><p className="text-sm text-white/80">Health</p><p className="text-2xl font-bold">{health?? 98}%</p></div>
      </div>
    </div>
  );
}
export default Dashboard;