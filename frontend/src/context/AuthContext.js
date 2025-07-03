// frontend/src/context/AuthContext.js

// frontend/src/context/AuthContext.js

import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

// Создаем axios instance с базовым URL из env
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API || 'http://localhost:8000/api',
});

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  const setAuthHeader = (token) => {
    if (token) {
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axiosInstance.defaults.headers.common['Authorization'];
    }
  };

  // Функция для получения данных пользователя
  const fetchUser = useCallback(async (token) => {
    try {
      setAuthHeader(token);
      const response = await axiosInstance.get('/me/');
      setUser(response.data);
      setIsLoggedIn(true);
    } catch (error) {
      console.error('Ошибка получения профиля:', error);
      logout();
    }
  }, []);

  // При монтировании проверяем токен в localStorage и загружаем пользователя
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setAccessToken(token);
      fetchUser(token);
    }
  }, [fetchUser]);

  // Функция логина — сохраняет токен, выставляет авторизацию и грузит профиль
  const login = async (token) => {
    localStorage.setItem('token', token);
    setAccessToken(token);
    setAuthHeader(token);
    await fetchUser(token);
  };

  // Функция логаута — очищает токен и состояние
  const logout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUser(null);
    setAccessToken(null);
    setAuthHeader(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, accessToken, login, logout, axiosInstance }}>
      {children}
    </AuthContext.Provider>
  );
}
