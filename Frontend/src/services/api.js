import axios from 'axios';
const BASE = "https://logguard-mern-api.vercel.app/api";
console.log("✅ USING MERN API:", BASE);
const api = axios.create({ baseURL: BASE, timeout: 30000 });
api.interceptors.request.use(r => {
  const t = localStorage.getItem('token');
  if(t) r.headers.Authorization = `Bearer ${t}`;
  return r;
});
// Auth
export const login = d => api.post('/auth/login', d);
export const register = d => api.post('/auth/register', d);
export const getCurrentUser = () => api.get('/auth/me');
// Logs
export const uploadLogFile = fd => api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
export const getAnalytics = () => api.get('/analytics');
export const getLatestLogs = () => api.get('/logs/latest');
export const getLogs = p => api.get('/logs', { params: p });
export const searchLogs = p => api.get('/logs/search', { params: p });
export const clearLogs = () => api.delete('/logs/clear');
export const getLogById = id => api.get(`/logs/${id}`);
// Other
export const getNotifications = () => api.get('/notifications');
export const getAlerts = () => api.get('/alerts');
export const getUsers = () => api.get('/users');
export const analyzeLogsAI = logs => api.post('/ai/analyze', { logs });
export const checkMernHealth = () => api.get('/health');
export const checkJavaHealth = () => api.get('/health');
export const MERN_API = api;
export const JAVA_API = api;
export default api;
export const api2 = api;
