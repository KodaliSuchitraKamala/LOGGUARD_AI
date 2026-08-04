import axios from 'axios';
const API_URL = 'http://localhost:5000/api';

export const uploadLogFile = (formData) => {
  return axios.post(`${API_URL}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
}

export const getAnalyticsSummary = () => axios.get(`${API_URL}/analytics/summary`);
export const getAnalyticsTrends = () => axios.get(`${API_URL}/analytics/trends`);
export const getLatestLogs = () => axios.get(`${API_URL}/logs/latest`);