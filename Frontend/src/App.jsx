import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { getLatestLogs, getAnalytics, getCurrentUser, getAlerts } from './services/api';
import { logout } from './services/auth';
import socket from './socket';
import AlertToast from './components/AlertToast';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Analytics from './components/Analytics';
import Alerts from './components/Alerts';
import FileUpload from './components/FileUpload';
import LogTable from './components/LogTable';
import AdminUsersTable from './components/AdminUsersTable';

function App() {
  const [logs, setLogs] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [auth, setAuth] = useState(!!localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));
  const [page, setPage] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    if(!auth) return setLoading(false);
    try {
      const res = await getLatestLogs();
      setLogs(res.data); // FIXED: was res.data.logs
    } catch(err) { console.error("FETCH ERROR:", err) }
    setLoading(false);
  }

  const fetchAnalytics = async () => {
    if(!auth) return;
    try {
      const res = await getAnalytics();
      setAnalyticsData(res.data);
    } catch(err) {
      if(err.response?.status!== 403) toast.error("Failed to load analytics")
      console.error("ANALYTICS ERROR:", err.response?.data || err)
    }
  }

  const fetchUser = async () => {
    if(!auth) return;
    try {
      const res = await getCurrentUser();
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
    } catch(err) { console.error("USER ERROR:", err) }
  }

  const fetchAlerts = async () => {
    if(!auth) return;
    try { await getAlerts(); } catch(err) { console.error("ALERTS ERROR:", err) }
  }

  useEffect(() => {
    if(auth) {
      fetchUser();
      fetchLogs();
      fetchAnalytics();
      fetchAlerts();
    } else setLoading(false);
  }, [auth, refreshKey]);

  useEffect(() => {
    if (!auth) return;
    socket.on('new_log', () => {
        fetchAnalytics();
        fetchLogs();
        fetchAlerts();
    });
    socket.on('new_alert', () => fetchAlerts());
    return () => {
      socket.off('new_log');
      socket.off('new_alert');
    };
  }, [auth]);

  useEffect(() => {
    if (!auth) return;
    const interval = setInterval(() => {
      fetchLogs();
      fetchAnalytics();
      fetchAlerts();
    }, 5000);
    return () => clearInterval(interval);
  }, [auth]);

  const handleUploadSuccess = () => setRefreshKey(prev => prev + 1)

  const handleLogout = () => {
    logout();
    setAuth(false);
    setUser(null);
    setLogs([]);
    setAnalyticsData(null);
  }

  if(loading) return <div className="bg-gray-900 text-white min-h-screen flex items-center justify-center">Loading...</div>

  return (
    <BrowserRouter>
      <Toaster position='top-right' />
      <AlertToast />
      <Routes>
        <Route path='/login' element={!auth? <Login setAuth={setAuth} /> : <Navigate to='/' />} />
        <Route path='/' element={auth? (
          <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
              <h1 className="text-3xl font-bold">LOGGUARD AI</h1>
              <div className="flex gap-3 items-center">
                <span className="text-sm text-gray-400">{user?.email} - {user?.role}</span>
                <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded font-semibold">Logout</button>
              </div>
            </div>
            <div className="flex gap-4 mb-6 border-b border-gray-700">
              <button onClick={() => setPage('dashboard')} className={`pb-2 font-semibold ${page==='dashboard'? 'border-b-2 border-blue-500 text-blue-400' : 'text-gray-400'}`}>Dashboard</button>
              <button onClick={() => setPage('analytics')} className={`pb-2 font-semibold ${page==='analytics'? 'border-b-2 border-blue-500 text-blue-400' : 'text-gray-400'}`}>Analytics</button>
              <button onClick={() => setPage('alerts')} className={`pb-2 font-semibold ${page==='alerts'? 'border-b-2 border-blue-500 text-blue-400' : 'text-gray-400'}`}>Alerts</button>
              {user?.role === 'admin' && (
                <button onClick={() => setPage('admin')} className={`pb-2 font-semibold ${page==='admin'? 'border-b-2 border-blue-500 text-blue-400' : 'text-gray-400'}`}>Admin Panel</button>
              )}
            </div>

            {page === 'dashboard' && (
              <div>
                {analyticsData && <Dashboard data={analyticsData} />}
                <FileUpload onLogsLoaded={handleUploadSuccess} />
                <LogTable logs={logs} />
              </div>
            )}
            {page === 'analytics' && (analyticsData? <Analytics data={analyticsData} /> : user?.role!== 'admin'? <p className="text-yellow-400">Analytics are for Admins only</p> : <p>Loading Analytics...</p>)}
            {page === 'alerts' && (<Alerts />)}
            {page === 'admin' && user?.role === 'admin' && (<AdminUsersTable />)}
          </div>
        ) : <Navigate to='/login' />} />
      </Routes>
    </BrowserRouter>
  )
}
export default App;