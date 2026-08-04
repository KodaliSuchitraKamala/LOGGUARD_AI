import { useState, useEffect } from 'react';
import FileUpload from './components/FileUpload';
import LogTable from './components/LogTable';
import Dashboard from './components/Dashboard';
import Analytics from './components/Analytics'; // 1. Import Analytics

function App() {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState('dashboard'); // 2. Track active tab

  // Load logs on start so Analytics has data
  useEffect(() => {
    fetch('http://localhost:5000/api/logs/latest')
     .then(res => res.json())
     .then(data => setLogs(data))
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">LOGGUARD AI</h1>

      {/* 3. NAV TABS */}
      <div className="flex gap-4 mb-6 border-b border-gray-700">
        <button
          onClick={() => setPage('dashboard')}
          className={`pb-2 font-semibold ${page==='dashboard'? 'border-b-2 border-blue-500 text-blue-400' : 'text-gray-400 hover:text-white'}`}>
          Dashboard
        </button>
        <button
          onClick={() => setPage('analytics')}
          className={`pb-2 font-semibold ${page==='analytics'? 'border-b-2 border-blue-500 text-blue-400' : 'text-gray-400 hover:text-white'}`}>
          Analytics
        </button>
      </div>

      {/* 4. CONDITIONAL RENDER */}
      {page === 'dashboard' && (
        <>
          <Dashboard logs={logs} />
          <FileUpload onLogsLoaded={setLogs} />
          <LogTable logs={logs} />
        </>
      )}

      {page === 'analytics' && (
        <Analytics />
      )}

    </div>
  );
}
export default App;