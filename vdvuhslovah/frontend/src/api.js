// src/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API || 'http://localhost:8000/api',
});

// Добавляем токен в заголовки
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => Promise.reject(error));

// Обработка 401 ошибок — выход и обновление страницы
api.interceptors.response.use(response => response, error => {
  if (error.response?.status === 401) {
    localStorage.removeItem('token');
    window.location.reload();
  }
  return Promise.reject(error);
});

export default api;
