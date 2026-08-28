import axios from 'axios';
import { toast } from 'react-hot-toast';

let baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
if (!baseURL.endsWith('/api')) baseURL = baseURL.replace(/\/$/, '') + '/api';

const API = axios.create({ baseURL });

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

API.interceptors.response.use((r) => r, (error) => {
  if (error.response?.status === 401) {
    toast.error('Session expired. Please login again.');
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
  return Promise.reject(error);
});

export const uploadLogFile = (formData) => API.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const getAnalytics = () => API.get('/analytics');
export const getLatestLogs = () => API.get('/logs/latest');
export const searchLogs = (params) => API.get('/logs', { params }); // Fixed: Java uses /logs not /logs/search
export const getAlerts = () => API.get('/alerts');
export const getCurrentUser = () => API.get('/auth/me');
export const getNotifications = () => API.get('/notifications');
export const analyzeLogsAI = (logs) => API.post('/logs/analyze', { logs });

export default API;