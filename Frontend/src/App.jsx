import { useState } from 'react';
import FileUpload from './components/FileUpload';
import LogTable from './components/LogTable';
import Dashboard from './components/Dashboard';

function App() {
  const [logs, setLogs] = useState([]);

  const handleLogsLoaded = (newLogs) => {
    console.log("LOGS RECEIVED:", newLogs);
    setLogs(Array.isArray(newLogs) ? newLogs : []);
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">LOGGUARD AI</h1>
      <Dashboard logs={logs} /> {/* 1. Pass logs here */}
      
      <FileUpload onLogsLoaded={handleLogsLoaded} />

      <div className="mt-8">
        
      <div className="mt-4 p-4 bg-gray-800 rounded">
        <h2 className='text-3xl p-4'>Live Logs</h2>
        <LogTable logs={logs} />
      </div>
      </div>
    </div>
  );
}

export default App;