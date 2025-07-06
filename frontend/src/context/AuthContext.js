//C:\Users\ASUS Vivobook\PycharmProjects\PythonProject1\vdvuhslovah\frontend\src\context\AuthContext.js

import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

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

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUser(null);
    setAccessToken(null);
    setAuthHeader(null);
  }, []);

  const fetchUser = useCallback(
    async (token) => {
      try {
        setAuthHeader(token);
        const response = await axiosInstance.get('/me/');
        setUser(response.data);
        setIsLoggedIn(true);
      } catch (error) {
        console.error('Ошибка получения профиля:', error);
        logout();
      }
    },
    [logout]
  );

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setAccessToken(token);
      fetchUser(token);
    }
  }, [fetchUser]);

  const login = async (token) => {
    localStorage.setItem('token', token);
    setAccessToken(token);
    setAuthHeader(token);
    await fetchUser(token);
  };

  const updateUser = (newUserData) => {
    setUser((prevUser) => ({
      ...prevUser,
      ...newUserData,
    }));
  };

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, user, accessToken, login, logout, axiosInstance, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}
