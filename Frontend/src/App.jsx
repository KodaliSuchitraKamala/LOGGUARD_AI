import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { getLatestLogs, getAnalytics } from './services/api';
import socket from './socket';
import AlertToast from './components/AlertToast';
import Dashboard from './components/DashBoard';
import Login from './components/Login';
import Analytics from './components/Analytics';
import Alerts from './components/Alerts';
import FileUpload from './components/FileUpload';
import LogTable from './components/LogTable';
import AdminUsersTable from './components/AdminUsersTable';
import Notifications from './components/NotificationBell';
import Navbar from './components/Navbar';
import { AuthProvider } from './components/AuthContext';
import { SocketProvider } from './components/SocketContext';

function MainApp() {
  const [logs, setLogs] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const auth = !!localStorage.getItem('token');

  const fetchLogs = async () => { try { const res = await getLatestLogs(); setLogs(res.data); } catch(err) {} }
  const fetchAnalytics = async () => { try { const res = await getAnalytics(); setAnalyticsData(res.data); } catch(err) {} }

  useEffect(() => { if(auth) { fetchLogs(); fetchAnalytics(); } }, [auth, refreshKey]);
  useEffect(() => {
    socket.on('new_log', () => { fetchLogs(); fetchAnalytics(); });
    return () => socket.off('new_log');
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <div className="p-8">
        <Routes>
          <Route path="/" element={<><Dashboard data={analyticsData} /><FileUpload onLogsLoaded={()=>setRefreshKey(k=>k+1)} /><LogTable logs={logs} /></>} />
          <Route path="/analytics" element={<Analytics data={analyticsData} />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/admin" element={<AdminUsersTable />} />
          <Route path="/notifications" element={<Notifications />} />
        </Routes>
      </div>
    </div>
  )
}

export default function App() {
  const [auth, setAuth] = useState(!!localStorage.getItem('token'));
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <Toaster position='top-right' />
          <AlertToast />
          <Routes>
            <Route path='/login' element={!auth? <Login setAuth={setAuth} /> : <Navigate to='/' />} />
            <Route path='/*' element={auth? <MainApp /> : <Navigate to='/login' />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}