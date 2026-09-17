import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || "https://logguard-mern-api.vercel.app/api";
console.log("✅ USING MERN API:", BASE);

const api = axios.create({ baseURL: BASE, timeout: 30000 });

api.interceptors.request.use(r => {
  const t = localStorage.getItem('token');
  if(t) r.headers.Authorization = `Bearer ${t}`;
  return r;
});

export default api;