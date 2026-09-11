import axios from 'axios';
import { toast } from 'react-hot-toast';

// --- 1. GET BOTH BACKEND URLs FROM .ENV ---
const MERN_URL_RAW = import.meta.env.VITE_API_URL_MERN || 'http://localhost:5000/api';
const JAVA_URL_RAW = import.meta.env.VITE_API_URL_JAVA || 'http://localhost:8080/api';
const ACTIVE_URL_RAW = import.meta.env.VITE_API_URL || MERN_URL_RAW;

const normalize = (url) => {
  if (!url) return '';
  if (!url.endsWith('/api')) url = url.replace(/\/$/, '') + '/api';
  return url;
};

const MERN_BASE = normalize(MERN_URL_RAW);
const JAVA_BASE = normalize(JAVA_URL_RAW);
const ACTIVE_BASE = normalize(ACTIVE_URL_RAW);

// --- 2. CREATE TWO INSTANCES ---
const createInstance = (baseURL) => {
  const instance = axios.create({ baseURL, timeout: 30000 });

  instance.interceptors.request.use((req) => {
    const token = localStorage.getItem('token');
    if (token) req.headers.Authorization = `Bearer ${token}`;
    return req;
  });

  instance.interceptors.response.use(
    (r) => r,
    (error) => {
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
      return Promise.reject(error);
    }
  );
  return instance;
};

export const MERN_API = createInstance(MERN_BASE);
export const JAVA_API = createInstance(JAVA_BASE);

// Default API for backward compatibility (uses ACTIVE)
const API = createInstance(ACTIVE_BASE);

// --- 3. ROUTE CALLS TO CORRECT BACKEND ---

// MERN = Auth, Users, Fast CRUD (Vercel)
export const getCurrentUser = () => MERN_API.get('/auth/me');
export const login = (data) => MERN_API.post('/auth/login', data);
export const register = (data) => MERN_API.post('/auth/register', data);

// Java Docker = AI, Logs, Analytics, Heavy Processing (Railway)
export const uploadLogFile = (formData) => 
  JAVA_API.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

export const getAnalytics = () => JAVA_API.get('/analytics');
export const getLatestLogs = () => JAVA_API.get('/logs/latest');
export const searchLogs = (params) => JAVA_API.get('/logs', { params });
export const getAlerts = () => JAVA_API.get('/alerts');
export const getNotifications = () => JAVA_API.get('/notifications');
export const analyzeLogsAI = (logs) => JAVA_API.post('/logs/analyze', { logs });

// Health checks for both
export const checkMernHealth = () => MERN_API.get('/health').catch(() => ({ data: { status: 'MERN Offline' }}));
export const checkJavaHealth = () => JAVA_API.get('/health');

export default API;