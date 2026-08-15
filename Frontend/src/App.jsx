import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { getLatestLogs, getAnalytics, getCurrentUser } from './services/api'; // add getCurrentUser
import { logout } from './services/auth';
import socket from './socket';
import AlertToast from './components/AlertToast';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Analytics from './components/Analytics';
import Alerts from './components/Alerts';
import FileUpload from './components/FileUpload';
import LogTable from './components/LogTable';
import AdminUsersTable from './components/AdminUsersTable'; // NEW

function App() {
  const [logs, setLogs] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [auth, setAuth] = useState(!!localStorage.getItem('token'));
  const [user, setUser] = useState(null); // NEW: store user role
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
      setAnalyticsData(res.data);
    } catch(err) {
      console.error("ANALYTICS ERROR:", err.response?.data || err)
      toast.error("Failed to load analytics")
    }
  }

  const fetchUser = async () => { // NEW
    if(!auth) return;
    try {
      const res = await getCurrentUser();
      setUser(res.data);
    } catch(err) {
      console.error("USER ERROR:", err)
    }
  }

  useEffect(() => {
    if(auth) {
      fetchUser();
      fetchLogs();
      fetchAnalytics();
    } else setLoading(false);
  }, [auth, refreshKey]);

  // SOCKET.IO LIVE UPDATE
  useEffect(() => {
    if (!auth) return;
    socket.on('new_log', () => {
        console.log("New log detected via Socket, refetching...");
        fetchAnalytics();
        fetchLogs();
    });
    return () => socket.off('new_log');
  }, [auth]);

  const handleUploadSuccess = () => {
    setRefreshKey(prev => prev + 1);
  }

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
              <div className="flex gap-3">
                <span className="text-sm text-gray-400">{user?.email} - {user?.role}</span>
                <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded font-semibold">Logout</button>
              </div>
            </div>
            <div className="flex gap-4 mb-6 border-b border-gray-700">
              <button onClick={() => setPage('dashboard')} className={`pb-2 font-semibold ${page==='dashboard'? 'border-b-2 border-blue-500 text-blue-400' : 'text-gray-400'}`}>Dashboard</button>
              <button onClick={() => setPage('analytics')} className={`pb-2 font-semibold ${page==='analytics'? 'border-b-2 border-blue-500 text-blue-400' : 'text-gray-400'}`}>Analytics</button>
              <button onClick={() => setPage('alerts')} className={`pb-2 font-semibold ${page==='alerts'? 'border-b-2 border-blue-500 text-blue-400' : 'text-gray-400'}`}>Alerts</button>
              {user?.role === 'ADMIN' && ( // ROLE BASED TAB
                <button onClick={() => setPage('admin')} className={`pb-2 font-semibold ${page==='admin'? 'border-b-2 border-blue-500 text-blue-400' : 'text-gray-400'}`}>Admin Panel</button>
              )}
            </div>

            {page === 'dashboard' && (
              <div>
                <Dashboard logs={logs} />
                <FileUpload onLogsLoaded={handleUploadSuccess} />
                <LogTable logs={logs} />
              </div>
            )}
            {page === 'analytics' && (analyticsData? <Analytics data={analyticsData} /> : <p>Loading Analytics...</p>)}
            {page === 'alerts' && (<Alerts />)}
            {page === 'admin' && user?.role === 'ADMIN' && (<AdminUsersTable />)} 
          </div>
        ) : <Navigate to='/login' />} />
      </Routes>
    </BrowserRouter>
  )
}
export default App;