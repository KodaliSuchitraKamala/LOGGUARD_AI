import axios from 'axios';

// Use env var first, fallback to Render Java backend
const JAVA_BASE = import.meta.env.VITE_API_URL || "https://logguard-backend.onrender.com/api";
// Force MERN to same Java backend to kill CORS error forever
const MERN_BASE = import.meta.env.VITE_API_URL || "https://logguard-backend.onrender.com/api";

const createInstance = (baseURL) => {
  const instance = axios.create({ baseURL, timeout: 30000 });
  instance.interceptors.request.use((req) => {
    const token = localStorage.getItem('token');
    if (token) req.headers.Authorization = `Bearer ${token}`;
    return req;
  });
  return instance;
};

export const MERN_API = createInstance(MERN_BASE);
export const JAVA_API = createInstance(JAVA_BASE);

// Auth - FIXED: Now uses JAVA (Render) not MERN
export const login = (data) => JAVA_API.post('/auth/login', data);
export const register = (data) => JAVA_API.post('/auth/register', data);
export const getCurrentUser = () => JAVA_API.get('/auth/me');

// Java - Logs
export const uploadLogFile = (formData) => JAVA_API.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const getAnalytics = () => JAVA_API.get('/analytics');
export const getLatestLogs = () => JAVA_API.get('/logs/latest');
export const getLogs = (params) => JAVA_API.get('/logs', { params });
export const searchLogs = (params) => JAVA_API.get('/logs/search', { params });
export const clearLogs = () => JAVA_API.delete('/logs/clear');

// Other - all now on Java
export const getNotifications = () => JAVA_API.get('/notifications');
export const analyzeLogsAI = (logs) => JAVA_API.post('/logs/analyze', { logs });
export const checkMernHealth = () => JAVA_API.get('/health');
export const checkJavaHealth = () => JAVA_API.get('/health');

// Default export for old imports
const api = JAVA_API;
export default api;
export { api };
