import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

export const getLatestLogs = () => API.get('/logs/latest');
export const uploadLogFile = (formData) => API.post('/logs/upload', formData);
export const sendAlert = (data) => API.post('/alerts', data);