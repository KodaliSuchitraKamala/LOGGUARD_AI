import axios from 'axios';

const MERN_BASE = "https://logguard-mern.onrender.com/api";
const JAVA_BASE = "https://logguard-java.up.railway.app/api";

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

export const login = (data) => MERN_API.post('/auth/login', data);
export const register = (data) => MERN_API.post('/auth/register', data);
export const getCurrentUser = () => MERN_API.get('/auth/me');
export const uploadLogFile = (formData) => JAVA_API.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const getAnalytics = () => JAVA_API.get('/analytics');
export const getLatestLogs = () => JAVA_API.get('/logs/latest');
export const searchLogs = (params) => JAVA_API.get('/logs/search', { params });
export const getNotifications = () => MERN_API.get('/notifications');
export const analyzeLogsAI = (logs) => MERN_API.post('/logs/analyze', { logs });
export default MERN_API;