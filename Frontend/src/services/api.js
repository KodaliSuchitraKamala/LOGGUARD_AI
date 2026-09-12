import axios from 'axios';
import { toast } from 'react-hot-toast';

const MERN_URL_RAW = import.meta.env.VITE_API_URL_MERN || 'http://localhost:5000/api';
const JAVA_URL_RAW = import.meta.env.VITE_API_URL_JAVA || 'http://localhost:8080/api';

const normalize = (url) => {
  if (!url) return '';
  url = url.trim().replace(/\/$/, '');
  if (!url.endsWith('/api')) url = url + '/api';
  return url;
};

const MERN_BASE = normalize(MERN_URL_RAW);
const JAVA_BASE = normalize(JAVA_URL_RAW);

console.log("MERN:", MERN_BASE, "JAVA:", JAVA_BASE);

const createInstance = (baseURL) => {
  const instance = axios.create({ 
    baseURL, 
    timeout: 30000,
    withCredentials: false // FIX: set false for wildcard CORS
  });
  instance.interceptors.request.use((req) => {
    const token = localStorage.getItem('token');
    if (token) req.headers.Authorization = `Bearer ${token}`;
    return req;
  });
  instance.interceptors.response.use(
    (r) => r,
    (error) => {
      const status = error.response?.status;
      const url = error.config?.url || '';
      // Don't auto-logout for health checks
      if (status === 401 && !url.includes('/health')) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        if (window.location.pathname !== '/login') window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );
  return instance;
};

export const MERN_API = createInstance(MERN_BASE);
export const JAVA_API = createInstance(JAVA_BASE);

// --- AUTH (MERN) ---
export const getCurrentUser = () => MERN_API.get('/auth/me');
export const login = (data) => MERN_API.post('/auth/login', data);
export const register = (data) => MERN_API.post('/auth/register', data);

// --- LOGS (JAVA PRIMARY) ---
export const uploadLogFile = (formData) => 
  JAVA_API.post('/upload', formData, { 
    headers: { 'Content-Type': 'multipart/form-data' } 
  });

export const getAnalytics = () => JAVA_API.get('/analytics');
export const getLatestLogs = () => JAVA_API.get('/logs/latest');
export const searchLogs = (params) => JAVA_API.get('/logs/search', { params });
export const getLogs = (params) => JAVA_API.get('/logs', { params });
export const clearLogs = () => JAVA_API.delete('/logs/clear');

// --- MERN ROUTES ---
export const getNotifications = () => MERN_API.get('/notifications');
export const getAlerts = () => MERN_API.get('/alerts');
export const getMernAnalytics = () => MERN_API.get('/analytics');

// --- AI (MERN Hybrid - calls Java inside) ---
export const analyzeLogsAI = (logs) => MERN_API.post('/logs/analyze', { logs });

// --- HEALTH ---
export const checkMernHealth = () => MERN_API.get('/health');
export const checkJavaHealth = () => JAVA_API.get('/health');

export default MERN_API;