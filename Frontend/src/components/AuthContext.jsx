import { createContext, useContext, useState, useEffect } from 'react';
const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } });
  useEffect(() => {
    const syncRole = async () => {
      try {
        const token = localStorage.getItem('token'); if(!token) return;
        const API = import.meta.env.VITE_API_URL;
        const res = await fetch(`${API}/logs/me-role`, { headers: { Authorization: `Bearer ${token}` } });
        if(res.ok){ const data = await res.json(); const merged = {...user,...data}; setUser(merged); localStorage.setItem('user', JSON.stringify(merged)); }
      } catch {}
    }; syncRole();
  }, []);
  const logout = () => { localStorage.clear(); setUser(null); };
  return <AuthContext.Provider value={{ user, setUser, logout }}>{children}</AuthContext.Provider>;
};