import api from './api';

export const register = (name, email, password) =>
  api.post('/auth/register', { name, email, password }); // added /auth

export const login = (email, password) =>
  api.post('/auth/login', { email, password }) // added /auth
   .then(res => {
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      return res.data;
    });

export const isLoggedIn = () =>!!localStorage.getItem('token');
export const getToken = () => localStorage.getItem('token');
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}