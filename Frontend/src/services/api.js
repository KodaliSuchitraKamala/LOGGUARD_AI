import axios from 'axios';
import { toast } from 'react-hot-toast';

const MERN_BASE = "/api/mern";
const JAVA_BASE = "/api/java";

const createInstance = (baseURL) => {
  const instance = axios.create({ baseURL, timeout: 30000 });
  instance.interceptors.request.use((req) => {
    const token = localStorage.getItem('token');
    if (token) req.headers.Authorization = `Bearer ${token}`;
    return req;
  });
  instance.interceptors.response.use(
    (r) => r,
    (err) => {
      if (err.response?.status === 401 && !err.config?.url?.includes('health')) {
        localStorage.removeItem('token');
        if (window.location.pathname !== '/login') window.location.href = '/login';
      }
      return Promise.reject(err);
    }
  );
  return instance;
};

export const MERN_API = createInstance(MERN_BASE);
export const JAVA_API = createInstance(JAVA_BASE);

export const login = (data) => MERN_API.post('/auth/login', data);
export const register = (data) => MERN_API.post('/auth/register', data);
export const getCurrentUser = () => MERN_API.get('/auth/me');

export const uploadLogFile = (formData) => JAVA_API.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const getAnalytics = () => JAVA_API.get('/analytics');
export const getLatestLogs = () => JAVA_API.get('/logs/latest');
export const searchLogs = (params) => JAVA_API.get('/logs/search', { params });
export const getLogs = (params) => JAVA_API.get('/logs', { params });
export const clearLogs = () => JAVA_API.delete('/logs/clear');
export const getNotifications = () => MERN_API.get('/notifications');
export const analyzeLogsAI = (logs) => MERN_API.post('/logs/analyze', { logs });
export const checkMernHealth = () => MERN_API.get('/health');
export const checkJavaHealth = () => JAVA_API.get('/health');

export default MERN_API;