import { useState } from 'react';
import LogList from './components/LogList';

function App() {
  const [stats, setStats] = useState({
    errors: 0,
    avgTime: 142,
    health: 98
  });

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white p-6">
      <h1 className="text-3xl font-bold text-blue-400 mb-6">LOGGUARD AI</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-[#131829] p-4 rounded-lg border border-gray-800">
          <p className="text-gray-400 text-sm">Critical Errors</p>
          <p className="text-3xl font-bold text-red-500">{stats.errors}</p>
        </div>
        <div className="bg-[#131829] p-4 rounded-lg border border-gray-800">
          <p className="text-gray-400 text-sm">Avg Response Time</p>
          <p className="text-3xl font-bold">{stats.avgTime}ms</p>
        </div>
        <div className="bg-[#131829] p-4 rounded-lg border border-gray-800">
          <p className="text-gray-400 text-sm">System Health</p>
          <p className="text-3xl font-bold text-green-400">{stats.health}%</p>
        </div>
      </div>

      {/* Upload Box */}
      <div className="bg-[#131829] p-6 rounded-lg border-2 border-dashed border-gray-700 text-center mb-6">
        <p className="text-gray-400">Drag & Drop Log File Here or Click to Upload</p>
      </div>

      {/* Live Log Table */}
      <LogList setStats={setStats} />
    </div>
  );
}

export default App;