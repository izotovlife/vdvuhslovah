// src/api.js
import axios from 'axios';

console.log("REACT_APP_API =", process.env.REACT_APP_API);

const api = axios.create({
  baseURL: process.env.REACT_APP_API,
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
