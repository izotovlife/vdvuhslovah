// C:\Users\ASUS Vivobook\PycharmProjects\PythonProject\vdvuhslovah\frontend\src\services\authService.js

import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API || 'http://localhost:8000/api',
});

// Интерцептор для добавления токена
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

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUser(null);
    setAccessToken(null);
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/me/');
      setUser(response.data);
      setIsLoggedIn(true);
    } catch (error) {
      console.error('Ошибка получения профиля:', error.response?.data || error.message);
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setAccessToken(token);
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [fetchUser]);

  const login = async (username, password) => {
    if (!username || !password) {
      throw new Error('Имя пользователя и пароль обязательны');
    }

    try {
      const response = await axios.post(`${process.env.REACT_APP_API || 'http://localhost:8000/api'}/token/`, {
        username,
        password,
      });

      const token = response.data.access;
      if (!token) throw new Error('Не получен токен');

      localStorage.setItem('token', token);
      setAccessToken(token);
      await fetchUser();
    } catch (error) {
      console.error('Ошибка входа:', error.response?.data || error.message);
      throw error;
    }
  };

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
