// frontend/src/context/AuthContext.js

import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API || 'http://localhost:8000/api',
});

// Интерцептор для добавления токена в заголовки
axiosInstance.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }
  return config;
});

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Выход из системы
  const logout = useCallback(() => {
    console.log('[AuthContext] logout called');
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUser(null);
    setAccessToken(null);
    setLoading(false);
  }, []);

  // Загрузка данных пользователя
  const fetchUser = useCallback(async () => {
    console.log('[AuthContext] fetchUser called');
    try {
      const response = await axiosInstance.get('/me/');
      console.log('[AuthContext] fetchUser success:', response.data);
      setUser(response.data);
      setIsLoggedIn(true);
    } catch (error) {
      console.error('[AuthContext] Ошибка получения профиля:', error);
      logout();
    } finally {
      console.log('[AuthContext] fetchUser finally - setLoading(false)');
      setLoading(false);
    }
  }, [logout]);

  // При изменении токена или загрузке страницы проверяем токен и данные пользователя
  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('[AuthContext] useEffect token:', token);
    if (token) {
      setAccessToken(token);
      fetchUser();  // Загружаем данные пользователя
    } else {
      console.log('[AuthContext] No token found, setLoading(false)');
      setLoading(false);  // Если нет токена, не загружаем пользователя
    }
  }, [fetchUser]);

  // Логин с получением токена
  const login = async (username, password) => {
    if (!username || !password) {
      throw new Error('Имя пользователя и пароль должны быть заполнены');
    }

    try {
      const response = await axios.post(`${process.env.REACT_APP_API || 'http://localhost:8000/api'}/token/`, {
        username,
        password,
      });
      const token = response.data.access;
      if (!token) throw new Error('Токен не получен');

      localStorage.setItem('token', token);  // Сохраняем токен
      setAccessToken(token);  // Обновляем токен в контексте
      await fetchUser();  // Загружаем данные пользователя
    } catch (error) {
      console.error('[AuthContext] Ошибка входа:', error.response?.data || error.message);
      throw error;
    }
  };

  // Обновление данных пользователя
  const updateUser = (newUserData) => {
    setUser((prevUser) => ({ ...prevUser, ...newUserData }));
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        user,
        accessToken,
        login,
        logout,
        axiosInstance,
        updateUser,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
