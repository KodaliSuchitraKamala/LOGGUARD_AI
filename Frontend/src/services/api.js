import axios from 'axios';
import { toast } from 'react-hot-toast';

let rawURL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
if (!rawURL.endsWith('/api')) rawURL = rawURL.replace(/\/$/, '') + '/api';
const isMern = rawURL.includes('5000');

const API = axios.create({ baseURL: rawURL });

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

// DUAL COMPATIBLE EXPORTS
export const uploadLogFile = (formData) => API.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

export const getAnalytics = () => API.get('/analytics');

export const getLatestLogs = () => API.get('/logs/latest');

export const searchLogs = (params) => {
  // MERN needs /logs/search, Java needs /logs
  if (isMern) return API.get('/logs/search', { params });
  return API.get('/logs', { params });
};

export const getAlerts = () => API.get('/alerts');
export const getCurrentUser = () => API.get('/auth/me');
export const getNotifications = () => API.get('/notifications');
export const analyzeLogsAI = (logs) => API.post(isMern ? '/analyze' : '/logs/analyze', { logs });

// Admin - MERN vs JAVA paths
export const getUsers = () => API.get(isMern ? '/users' : '/users');
export const updateUserRole = (id, role) => API.put(`/users/${id}/role`, { role });
export const deleteUser = (id) => API.delete(`/users/${id}`);

export default API;