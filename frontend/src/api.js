// src/Api.js

import axios from 'axios';

const baseURL = process.env.REACT_APP_API || 'http://localhost:8000/api';

const api = axios.create({
  baseURL,
});

api.interceptors.request.use(config => {
  // Используем ключ 'token' для хранения токена, чтобы совпадало с AuthContext.js
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

const publicApi = axios.create({ baseURL });

// Отправка email для сброса пароля
export const sendPasswordResetEmail = async (email) => {
  return await publicApi.post('/send-reset-email/', { email });
};

// Сброс пароля по uid, token и новому паролю
export const resetPassword = async (uid, token, new_password) => {
  return await publicApi.post('/reset-password/', {
    uid,
    token,
    new_password,
  });
};

export default api;
export { publicApi };
