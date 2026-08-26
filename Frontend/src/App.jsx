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
  const fetchLogs = useCallback(async () => { try { const res = await getLatestLogs(); if(Array.isArray(res.data)) setLogs(res.data); } catch {} }, []);
  const fetchAnalytics = useCallback(async () => { try { const res = await getAnalytics(); setAnalyticsData(res.data); } catch {} }, []);
  useEffect(() => { fetchLogs(); fetchAnalytics(); }, [fetchLogs, fetchAnalytics]);
  useEffect(() => { const onNewLog = () => { fetchLogs(); fetchAnalytics(); }; socket.on('new_log', onNewLog); socket.on('new_alert', onNewLog); return () => { socket.off('new_log', onNewLog); socket.off('new_alert', onNewLog); }; }, [fetchLogs, fetchAnalytics]);
  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white">
      <Navbar />
      <div className="p-8 pt-5">
        <Routes>
          <Route path="/" element={<><Dashboard data={analyticsData} /><FileUpload onLogsLoaded={()=>{ fetchLogs(); fetchAnalytics(); }} /><LogTable initialLogs={logs} /><AIInsightCard logs={logs} /></>} />
          <Route path="/analytics" element={<Analytics data={analyticsData} />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/admin" element={<AdminUsersTable />} />
        </Routes>
      </div>
    </div>
  )
}

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  return token? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider><SocketProvider>
        <Toaster position='top-right' />
        <AlertToast />
        <Routes>
          <Route path='/login' element={<Login />} />
          <Route path='/*' element={<ProtectedRoute><MainApp /></ProtectedRoute>} />
        </Routes>
      </SocketProvider></AuthProvider>
    </BrowserRouter>
  )
}