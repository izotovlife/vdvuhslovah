// C:\Users\ASUS Vivobook\PycharmProjects\PythonProject\vdvuhslovah\frontend\src\services\authService.js

import axios from 'axios';

const API_URL = process.env.REACT_APP_API || 'http://localhost:8000/api';

// Создаём инстанс axios с базовым URL
const axiosInstance = axios.create({
  baseURL: API_URL,
});

// Функция логина — сохраняем токен и добавляем заголовок по умолчанию
export async function login(username, password) {
  const response = await axiosInstance.post('/token/', { username, password });
  localStorage.setItem('token', response.data.access);

  // Добавляем токен в заголовки для всех будущих запросов
  axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;

  return response.data;
}

// Функция для получения профиля с авторизацией
export async function fetchProfile() {
  return axiosInstance.get('/profile/');
}

// При загрузке приложения можно инициализировать токен из localStorage
export function initializeAuthToken() {
  const token = localStorage.getItem('token');
  if (token) {
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
}

// Функция выхода — удалить токен и очистить заголовки
export function logout() {
  localStorage.removeItem('token');
  delete axiosInstance.defaults.headers.common['Authorization'];
}

export default axiosInstance;
