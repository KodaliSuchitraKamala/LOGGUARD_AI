import axios from 'axios';

// --- BASE URLS ---
// MERN is now fixed and live on Vercel
const MERN_BASE = import.meta.env.VITE_API_URL || "https://logguard-mern-api.vercel.app/api";
// Java on Render (keep as fallback, but Render sleeps)
const JAVA_BASE = "https://logguard-backend.onrender.com/api";

const createInstance = (baseURL) => {
  const instance = axios.create({ baseURL, timeout: 30000 });
  instance.interceptors.request.use((req) => {
    const token = localStorage.getItem('token');
    if (token) req.headers.Authorization = `Bearer ${token}`;
    return req;
  });
  instance.interceptors.response.use(
    (res) => res,
    (err) => {
      console.error(`API Error [${err.config?.baseURL}${err.config?.url}]:`, err.response?.data || err.message);
      return Promise.reject(err);
    }
  );
  return instance;
};

export const MERN_API = createInstance(MERN_BASE);
export const JAVA_API = createInstance(JAVA_BASE);

// --- AUTH - USE MERN (fixed) ---
export const login = (data) => MERN_API.post('/auth/login', data);
export const register = (data) => MERN_API.post('/auth/register', data);
export const getCurrentUser = () => MERN_API.get('/auth/me');

// --- LOGS & ANALYTICS - USE MERN ---
export const uploadLogFile = (formData) => MERN_API.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const getAnalytics = () => MERN_API.get('/analytics');
export const getLatestLogs = () => MERN_API.get('/logs/latest');
export const getLogs = (params) => MERN_API.get('/logs', { params });
export const searchLogs = (params) => MERN_API.get('/logs/search', { params });
export const clearLogs = () => MERN_API.delete('/logs/clear');

// --- OTHER ---
export const getNotifications = () => MERN_API.get('/notifications');
export const getAlerts = () => MERN_API.get('/alerts');
export const getUsers = () => MERN_API.get('/users');
export const analyzeLogsAI = (logs) => MERN_API.post('/ai/analyze', { logs });

// --- HEALTH ---
export const checkMernHealth = () => MERN_API.get('/health');
export const checkJavaHealth = () => JAVA_API.get('/health');

// Default export for old code
const api = MERN_API;
export default api;
export { api };