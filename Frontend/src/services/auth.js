import api from './api';

export const register = (email, password) => 
  api.post('/register', { email, password });

export const login = (email, password) => 
  api.post('/login', { email, password })
    .then(res => {
      localStorage.setItem("token", res.data.token);
      return res.data;
    });

export const isLoggedIn = () =>!!localStorage.getItem('token');
export const getToken = () => localStorage.getItem('token');
export const logout = () => localStorage.removeItem('token');