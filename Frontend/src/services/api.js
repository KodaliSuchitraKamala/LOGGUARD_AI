import axios from 'axios';
const MERN_BASE = "https://YOUR-MERN-VERCEL-URL.vercel.app/api";
const JAVA_BASE = "https://logguard-java.up.railway.app/api";

const create = (base) => {
  const i = axios.create({ baseURL: base });
  i.interceptors.request.use(r => {
    const t = localStorage.getItem('token');
    if(t) r.headers.Authorization = `Bearer ${t}`;
    return r;
  });
  return i;
};
export const MERN_API = create(MERN_BASE);
export const JAVA_API = create(JAVA_BASE);
export const uploadLogFile = (fd) => JAVA_API.post('/upload', fd);
export const getAnalytics = () => JAVA_API.get('/analytics');
export const getLatestLogs = () => JAVA_API.get('/logs/latest');
export const getNotifications = () => MERN_API.get('/notifications');
export const login = (d) => MERN_API.post('/auth/login', d);
export const register = (d) => MERN_API.post('/auth/register', d);