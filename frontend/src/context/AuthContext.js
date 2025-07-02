//src/context/AuthContext.js

import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setAccessToken(token);
      setIsLoggedIn(true);
      fetchUser(token);
    }
  }, []);

  const fetchUser = async (token) => {
    try {
      const response = await axios.get('/api/me/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data);
    } catch {
      logout();
    }
  };

  const login = (token) => {
    localStorage.setItem('token', token);
    setAccessToken(token);
    setIsLoggedIn(true);
    fetchUser(token);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUser(null);
    setAccessToken(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, accessToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
