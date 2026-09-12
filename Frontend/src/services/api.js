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
  return instance;
};

export const MERN_API = createInstance(MERN_BASE);
export const JAVA_API = createInstance(JAVA_BASE);

export const login = (data) => MERN_API.post('/auth/login', data);
export const register = (data) => MERN_API.post('/auth/register', data);
export const uploadLogFile = (formData) => JAVA_API.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const getAnalytics = () => JAVA_API.get('/analytics');
export const getLatestLogs = () => JAVA_API.get('/logs/latest');
export const searchLogs = (params) => JAVA_API.get('/logs/search', { params });
export const getNotifications = () => MERN_API.get('/notifications');
export const analyzeLogsAI = (logs) => MERN_API.post('/logs/analyze', { logs });