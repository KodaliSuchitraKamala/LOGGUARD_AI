import { useState, useEffect, useCallback } from 'react';
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
import Navbar from './components/Navbar';
import AIInsightCard from './components/AIInsightCard';
import { AuthProvider } from './components/AuthContext';
import { SocketProvider } from './components/SocketContext';

function MainApp() {
  const [logs, setLogs] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getLatestLogs();
      if (Array.isArray(res.data)) {
        setLogs(res.data);
        setRefreshKey(prev => prev + 1);
      } else if (res.data?.logs) {
        setLogs(res.data.logs);
        setRefreshKey(prev => prev + 1);
      }
    } catch (err) { console.error("fetchLogs failed", err); }
    finally { setIsLoading(false); }
  }, []);

  const fetchAnalytics = useCallback(async () => {
    try { const res = await getAnalytics(); setAnalyticsData(res.data); }
    catch (err) { console.error("fetchAnalytics failed", err); }
  }, []);

  const handleRefreshAll = useCallback(() => { fetchLogs(); fetchAnalytics(); }, [fetchLogs, fetchAnalytics]);
  useEffect(() => { handleRefreshAll(); }, [handleRefreshAll]);
  useEffect(() => {
    const onNewLog = () => handleRefreshAll();
    socket.on('new_log', onNewLog); socket.on('new_alert', onNewLog);
    socket.on('connect', () => console.log("Socket Connected"));
    socket.on('disconnect', () => console.log("Socket Disconnected"));
    return () => { socket.off('new_log', onNewLog); socket.off('new_alert', onNewLog); };
  }, [handleRefreshAll]);

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white">
      <Navbar />
      <div className="p-8 pt-5 max-w-[1600px] mx-auto">
        <Routes>
          <Route path="/" element={
            <>
              <Dashboard data={analyticsData} logs={logs} onRefresh={handleRefreshAll} />
              <FileUpload onLogsLoaded={handleRefreshAll} />
              {isLoading && <p className="text-center text-sm text-gray-400 mt-4 animate-pulse">Syncing logs...</p>}
              {logs.length > 0 && <div className="mt-6 mb-6"><AIInsightCard logs={logs} key={refreshKey} /></div>}
              <LogTable initialLogs={logs} />
            </>
          }/>
          <Route path="/analytics" element={<Analytics data={analyticsData} />} />
          <Route path="/alerts" element={<Alerts logs={logs} />} />
          <Route path="/admin" element={<AdminUsersTable />} />
        </Routes>
      </div>
    </div>
  );
}
function ProtectedRoute({ children }) { const token = localStorage.getItem('token'); return token? children : <Navigate to="/login" />; }
export default function App() {
  return (
    <BrowserRouter><AuthProvider><SocketProvider>
      <Toaster position="top-right" /><AlertToast />
      <Routes><Route path="/login" element={<Login />} /><Route path="/*" element={<ProtectedRoute><MainApp /></ProtectedRoute>} /></Routes>
    </SocketProvider></AuthProvider></BrowserRouter>
  );
}