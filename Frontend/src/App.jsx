import { useState, useEffect, useRef } from 'react'; // added useRef
import FileUpload from './components/FileUpload';
import LogTable from './components/LogTable';
import Dashboard from './components/Dashboard';
import Analytics from './components/Analytics';
import Alerts from './components/Alerts';
import { Toaster, toast } from 'react-hot-toast';
import { io } from 'socket.io-client'; // 1. Import socket client

const SOCKET_URL = 'http://localhost:5000';

function App() {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState('dashboard');
  const socketRef = useRef(null); // 2. Keep socket instance
  const audioRef = useRef(null); // 3. Keep audio instance

  // Load logs on start
  useEffect(() => {
    fetch('http://localhost:5000/api/logs/latest')
     .then(res => res.json())
     .then(data => setLogs(data))
  }, []);

  // Live socket alerts + Toast + Alarm sound
  useEffect(() => {
    // 1. Connect socket
    socketRef.current = io(SOCKET_URL);

    // 2. Preload alarm sound. Put alert.mp3 inside Frontend/public/
    audioRef.current = new Audio('/alert.mp3');

    socketRef.current.on('new_anomaly', (newAnomalies) => {
      newAnomalies.forEach(anomaly => {
        // Toast
        if(anomaly.severity === 'High') {
          toast.error(`CRITICAL: ${anomaly.message}`, { duration: 5000 });
        } else {
          toast(`Anomaly: ${anomaly.message}`, { duration: 4000 });
        }
        
        // Alarm Sound
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(err => console.log("Audio play failed:", err));
      });
      
      // Optional: refresh logs when new anomaly comes
      fetch('http://localhost:5000/api/logs/latest')
        .then(res => res.json())
        .then(data => setLogs(data))
    });

    // Cleanup on unmount
    return () => {
      socketRef.current.disconnect();
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <Toaster position='top-right' />
      <h1 className="text-3xl font-bold mb-6">LOGGUARD AI</h1>

      <div className="flex gap-4 mb-6 border-b border-gray-700">
        <button onClick={() => setPage('dashboard')} className={`pb-2 font-semibold ${page==='dashboard'? 'border-b-2 border-blue-500 text-blue-400' : 'text-gray-400 hover:text-white'}`}>Dashboard</button>
        <button onClick={() => setPage('analytics')} className={`pb-2 font-semibold ${page==='analytics'? 'border-b-2 border-blue-500 text-blue-400' : 'text-gray-400 hover:text-white'}`}>Analytics</button>
        <button onClick={() => setPage('alerts')} className={`pb-2 font-semibold ${page==='alerts'? 'border-b-2 border-blue-500 text-blue-400' : 'text-gray-400 hover:text-white'}`}>Alerts</button>
      </div>

      {page === 'dashboard' && (<><Dashboard logs={logs} /><FileUpload onLogsLoaded={setLogs} /><LogTable logs={logs} /></>)}
      {page === 'analytics' && (<Analytics />)}
      {page === 'alerts' && (<Alerts />)}
    </div>
  );
}
export default App;