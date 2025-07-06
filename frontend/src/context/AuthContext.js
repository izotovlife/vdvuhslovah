//C:\Users\ASUS Vivobook\PycharmProjects\PythonProject1\vdvuhslovah\frontend\src\context\AuthContext.js

import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API || 'http://localhost:8000/api',
});

// Интерцептор, добавляющий токен в заголовок каждого запроса
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

  // Функция выхода
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUser(null);
    setAccessToken(null);
  }, []);

  // Получение данных пользователя
  const fetchUser = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/me/');
      setUser(response.data);
      setIsLoggedIn(true);
    } catch (error) {
      console.error('Ошибка получения профиля:', error.response?.data || error.message);
      logout();
    }
  }, [logout]);

  // Проверяем наличие токена при загрузке
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setAccessToken(token);
      fetchUser();
    }
  }, [fetchUser]);

  // Логин пользователя
  const login = async (token) => {
    localStorage.setItem('token', token);
    setAccessToken(token);
    await fetchUser();
  };

  // Обновление данных пользователя
  const updateUser = (newUserData) => {
    setUser((prevUser) => ({
      ...prevUser,
      ...newUserData,
    }));
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
