import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { getLatestLogs, getAnalytics } from './services/api';
import socket from './services/socket';
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
import { AuthProvider, useAuth } from './components/AuthContext';
import { SocketProvider } from './components/SocketContext';

function MainApp() {
  const [logs, setLogs] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const { user } = useAuth();

  // FIXED: Safe parse, inside useAuth so it updates on login
  useEffect(() => {
    console.log("STORED USER FROM CONTEXT:", user);
  }, [user]);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getLatestLogs();
      setLogs(Array.isArray(res.data)? res.data : (res.data.logs || res.data.data || []));
      setRefreshKey(k => k + 1);
    } catch (e) {
      console.log("logs error", e?.response?.status);
    } finally {
      setIsLoading(false);
      setInitialLoading(false);
    }
  }, []);

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await getAnalytics();
      setAnalyticsData(res.data);
    } catch {}
  }, []);

  const handleRefreshAll = useCallback(async () => {
    await Promise.all([fetchLogs(), fetchAnalytics()]);
  }, [fetchLogs, fetchAnalytics]);

  useEffect(() => {
    if(user) handleRefreshAll();
    else setInitialLoading(false);
  }, [user]);

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-white/60 text-sm animate-pulse">Loading LogGuard AI...</p>
      </div>
    );
  }

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
              <LogTable initialLogs={logs} onUpdate={handleRefreshAll} />
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

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  return token? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <Toaster position="top-right" />
          <AlertToast />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={<ProtectedRoute><MainApp /></ProtectedRoute>} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}