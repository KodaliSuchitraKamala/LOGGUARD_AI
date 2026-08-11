import React from 'react';

function Dashboard({ logs = [] }) {
  const safeLogs = Array.isArray(logs) ? logs : []; // ADD THIS

  const errorCount = safeLogs.filter(l => l.level === 'ERROR').length;
  const criticalCount = safeLogs.filter(l => l.level === 'CRITICAL').length;
  const warningCount = safeLogs.filter(l => l.level === 'WARNING').length;

  const health = safeLogs.length > 0 ? Math.max(0, 100 - (criticalCount * 10) - (errorCount * 5)) : 98;

  return (
    <div className="mb-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-red-600 p-4 rounded">Critical: {criticalCount}</div>
        <div className="bg-orange-600 p-4 rounded">Errors: {errorCount}</div>
        <div className="bg-yellow-600 p-4 rounded">Warnings: {warningCount}</div>
        <div className={`p-4 rounded-lg ${health > 80 ? 'bg-green-600' : health > 50 ? 'bg-yellow-600' : 'bg-red-600'}`}>
          Health: {health}%
        </div>
      </div>
    </div>
  );
}

export default Dashboard;