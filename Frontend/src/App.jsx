import { useState, useEffect } from 'react';
import axios from 'axios';
import FileUpload from './components/FileUpload';
import LogList from './components/LogList';

function App() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/logs')
     .then(res => setLogs(res.data.logs))
     .catch(err => console.error(err));
  }, []);

  const handleLogsLoaded = (newLogs) => {
    setLogs(prevLogs => [...prevLogs,...newLogs]); // append
  };

  const criticalErrors = logs.filter(l => l.level === 'ERROR').length;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold text-blue-400 mb-6">LOGGUARD AI</h1>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800 p-4 rounded-lg">
          <p className="text-gray-400">Critical Errors</p>
          <p className="text-2xl font-bold text-red-500">{criticalErrors}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <p className="text-gray-400">Avg Response Time</p>
          <p className="text-2xl font-bold">142ms</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <p className="text-gray-400">System Health</p>
          <p className="text-2xl font-bold text-green-500">98%</p>
        </div>
      </div>

      <FileUpload onLogsLoaded={handleLogsLoaded} />
      <LogList logs={logs} />
    </div>
  );
}
export default App;