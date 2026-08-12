import axios from 'axios';
import { toast } from 'react-hot-toast';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      toast.error('Session expired. Please login again.');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const uploadLogFile = (formData) => API.post('/upload', formData, { // FIXED
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const getAnalyticsSummary = () => API.get('/analytics/summary');
export const getAnalyticsTrends = () => API.get('/analytics/trends');
export const getLatestLogs = () => API.get('/logs/latest');
export const getAlerts = () => API.get('/alerts');

export default API;