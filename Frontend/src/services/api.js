import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || "https://logguard-mern-api.vercel.app/api";
console.log("✅ USING MERN API:", BASE);

const api = axios.create({ baseURL: BASE, timeout: 30000 });

api.interceptors.request.use(r => {
  const t = localStorage.getItem('token');
  if(t) r.headers.Authorization = `Bearer ${t}`;
  return r;
});

// Named exports used by App.jsx, FileUpload, LogTable etc
export const login = d => api.post('/auth/login', d);
export const register = d => api.post('/auth/register', d);
export const getCurrentUser = () => api.get('/auth/me');
export const uploadLogFile = fd => api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
export const getAnalytics = () => api.get('/analytics');
export const getLatestLogs = () => api.get('/logs/latest');
export const searchLogs = p => api.get('/logs/search', { params: p });
export const getAlerts = () => api.get('/alerts');
export const getUsers = () => api.get('/users');
export const analyzeLogsAI = logs => api.post('/ai/analyze', { logs });

export default api;