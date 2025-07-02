// src/api.js

import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API || 'http://localhost:8000/api',
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const publicApi = axios.create({
  baseURL: process.env.REACT_APP_API || 'http://localhost:8000/api',
});

export { api, publicApi };





