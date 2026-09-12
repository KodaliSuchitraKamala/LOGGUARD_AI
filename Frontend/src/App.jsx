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
  const [refreshKey, setRefreshKey] = useState(0); // For AI re-analyze

  const fetchLogs = useCallback(async () => {
    try {
      const res = await getLatestLogs();
      if (Array.isArray(res.data)) {
        setLogs(res.data);
        setRefreshKey(prev => prev + 1); // Trigger AI re-analysis
      }
    } catch (err) {
      console.error("fetchLogs failed", err);
    }
  }, []);

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await getAnalytics();
      setAnalyticsData(res.data);
    } catch (err) {
      console.error("fetchAnalytics failed", err);
    }
  }, []);

  const handleRefreshAll = useCallback(() => {
    fetchLogs();
    fetchAnalytics();
  }, [fetchLogs, fetchAnalytics]);

  useEffect(() => {
    fetchLogs();
    fetchAnalytics();
  }, [fetchLogs, fetchAnalytics]);

  // Day 44: Real-time Socket
  useEffect(() => {
    const onNewLog = () => {
      fetchLogs();
      fetchAnalytics();
    };
    socket.on('new_log', onNewLog);
    socket.on('new_alert', onNewLog);
    return () => {
      socket.off('new_log', onNewLog);
      socket.off('new_alert', onNewLog);
    };
  }, [fetchLogs, fetchAnalytics]);

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white">
      <Navbar />
      <div className="p-8 pt-5 max-w-[1600px] mx-auto">
        <Routes>
          <Route
            path="/"
            element={
              <>
                {/* Day 44: Dashboard with Polling */}
                <Dashboard
                  data={analyticsData}
                  logs={logs}
                  onRefresh={handleRefreshAll}
                />

                {/* Upload */}
                <FileUpload
                  onLogsLoaded={() => {
                    handleRefreshAll();
                  }}
                />

                {/* Day 44 FIX: AI Card RIGHT AFTER upload, BEFORE table */}
                {logs.length > 0 && (
                  <div className="mt-6 mb-6">
                    <AIInsightCard logs={logs} key={refreshKey} />
                  </div>
                )}

                {/* Log Table */}
                <LogTable initialLogs={logs} />
              </>
            }
          />
          <Route path="/analytics" element={<Analytics data={analyticsData} />} />
          <Route path="/alerts" element={<Alerts />} />
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