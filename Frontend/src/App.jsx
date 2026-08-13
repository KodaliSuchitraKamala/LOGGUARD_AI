import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { getLatestLogs, getAnalytics } from './services/api'; // ADD getAnalytics
import { logout } from './services/auth';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Analytics from './components/Analytics';
import Alerts from './components/Alerts';
import FileUpload from './components/FileUpload';
import LogTable from './components/LogTable';

function App() {
  const [logs, setLogs] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null); // NEW
  const [refreshKey, setRefreshKey] = useState(0);
  const [auth, setAuth] = useState(!!localStorage.getItem('token'));
  const [page, setPage] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    if(!auth) {
      setLoading(false);
      return;
    }
    try {
      const res = await getLatestLogs();
      setLogs(res.data);
    } catch(err) {
      console.error("FETCH ERROR:", err)
    }
    setLoading(false);
  }

  const fetchAnalytics = async () => {
    if(!auth) return;
    try {
      const res = await getAnalytics();
      console.log("ANALYTICS DATA:", res.data) // ADD THIS
      setAnalyticsData(res.data);
    } catch(err) {
      console.error("ANALYTICS ERROR:", err.response?.data || err) // BETTER LOG
      toast.error("Failed to load analytics")
    }
  }

  useEffect(() => {
    if(auth) {
      fetchLogs();
      fetchAnalytics(); // NEW
    } else setLoading(false);
  }, [auth, refreshKey]);

  const handleUploadSuccess = () => {
    setRefreshKey(prev => prev + 1);
  }

  const handleLogout = () => {
    logout();
    setAuth(false);
    setLogs([]);
    setAnalyticsData(null);
  }

  if(loading) return <div className="bg-gray-900 text-white min-h-screen flex items-center justify-center">Loading...</div>

  return (
    <BrowserRouter>
      <Toaster position='top-right' />
      <Routes>
        <Route path='/login' element={!auth? <Login setAuth={setAuth} /> : <Navigate to='/' />} />
        <Route path='/' element={auth? (
          <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
              <h1 className="text-3xl font-bold">LOGGUARD AI</h1>
              <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded font-semibold">Logout</button>
            </div>
            <div className="flex gap-4 mb-6 border-b border-gray-700">
              <button onClick={() => setPage('dashboard')} className={`pb-2 font-semibold ${page==='dashboard'? 'border-b-2 border-blue-500 text-blue-400' : 'text-gray-400'}`}>Dashboard</button>
              <button onClick={() => setPage('analytics')} className={`pb-2 font-semibold ${page==='analytics'? 'border-b-2 border-blue-500 text-blue-400' : 'text-gray-400'}`}>Analytics</button>
              <button onClick={() => setPage('alerts')} className={`pb-2 font-semibold ${page==='alerts'? 'border-b-2 border-blue-500 text-blue-400' : 'text-gray-400'}`}>Alerts</button>
            </div>

            {page === 'dashboard' && (
              <div>
                <Dashboard logs={logs} />
                <FileUpload onLogsLoaded={handleUploadSuccess} />
                <LogTable logs={logs} /> 
              </div>
            )}
            {page === 'analytics' && (analyticsData ? <Analytics data={analyticsData} /> : <p>Loading Analytics...</p>)} {/* FIXED */}
            {page === 'alerts' && (<Alerts />)}
          </div>
        ) : <Navigate to='/login' />} />
      </Routes>
    </BrowserRouter>
  )
}
export default App;