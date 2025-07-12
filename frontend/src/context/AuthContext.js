// frontend/src/context/AuthContext.js

import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API || 'http://localhost:8000/api',
});

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
    console.log('[AuthContext] logout called');
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUser(null);
    setAccessToken(null);
    setLoading(false);
  }, []);

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

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('[AuthContext] useEffect token:', token);
    if (token) {
      setAccessToken(token);
      fetchUser();
    } else {
      console.log('[AuthContext] No token found, setLoading(false)');
      setLoading(false);
    }
  }, [fetchUser]);

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

      localStorage.setItem('token', token);
      setAccessToken(token);
      await fetchUser();
    } catch (error) {
      console.error('[AuthContext] Ошибка входа:', error.response?.data || error.message);
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
