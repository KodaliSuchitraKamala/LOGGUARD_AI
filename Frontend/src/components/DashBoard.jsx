import React from 'react';

function Dashboard({ data }) { // <- changed from logs to data
  if(!data) return <div className="mb-8">Loading...</div>;

  const { criticals, errors, warnings, health } = data;

  return (
    <div className="mb-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-red-600 p-4 rounded-lg">
          <p className="text-sm">Critical</p>
          <p className="text-2xl font-bold">{criticals}</p>
        </div>
        <div className="bg-orange-600 p-4 rounded-lg">
          <p className="text-sm">Errors</p>
          <p className="text-2xl font-bold">{errors}</p>
        </div>
        <div className="bg-yellow-600 p-4 rounded-lg">
          <p className="text-sm">Warnings</p>
          <p className="text-2xl font-bold">{warnings}</p>
        </div>
        <div className={`p-4 rounded-lg ${health > 80 ? 'bg-green-600' : health > 50 ? 'bg-yellow-600' : 'bg-red-600'}`}>
          <p className="text-sm">Health</p>
          <p className="text-2xl font-bold">{health}%</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;