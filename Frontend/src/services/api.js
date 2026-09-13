import axios from 'axios';
const BASE = "https://logguard-mern-api.vercel.app/api";
console.log("✅ USING MERN API:", BASE);
const api = axios.create({ baseURL: BASE });
api.interceptors.request.use(r => {
  const t = localStorage.getItem('token');
  if(t) r.headers.Authorization = `Bearer ${t}`;
  return r;
});
export const login = d => api.post('/auth/login', d);
export const register = d => api.post('/auth/register', d);
export default api;
export const MERN_API = api;
export const JAVA_API = api;
export const getCurrentUser = () => api.get('/auth/me');
export const checkMernHealth = () => api.get('/health');
export const getAnalytics = () => api.get('/analytics');
export const getLatestLogs = () => api.get('/logs/latest');
