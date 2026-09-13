import axios from 'axios';

// Vercel MERN is now the ONLY backend
const BASE_URL = import.meta.env.VITE_API_URL || "https://logguard-mern-api.vercel.app/api";

console.log("Using API:", BASE_URL);

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
});

api.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export const MERN_API = api;
export const JAVA_API = api; // keep for old imports

export const login = (data) => api.post('/auth/login', data);
export const register = (data) => api.post('/auth/register', data);
export const getCurrentUser = () => api.get('/auth/me');
export const uploadLogFile = (formData) => api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const getAnalytics = () => api.get('/analytics');
export const getLatestLogs = () => api.get('/logs/latest');
export const getLogs = (params) => api.get('/logs', { params });
export const searchLogs = (params) => api.get('/logs/search', { params });
export const clearLogs = () => api.delete('/logs/clear');
export const getNotifications = () => api.get('/notifications');
export const analyzeLogsAI = (logs) => api.post('/ai/analyze', { logs });
export const checkMernHealth = () => api.get('/health');
export const checkJavaHealth = () => api.get('/health');

export default api;