// src/components/LoginForm.js

import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/token/', { username, password });
      const token = response.data.access;

      // Сохраняем токен
      localStorage.setItem('token', token);

      // Получаем данные пользователя
      const userResponse = await api.get('/users/me/');

      // Обновляем состояние
      login(token, userResponse.data);
      navigate('/profile');
    } catch (error) {
      console.error('Ошибка входа:', error);
      setError('Неверное имя пользователя или пароль');
      localStorage.removeItem('token');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
      <Typography variant="h5" gutterBottom>
        Вход в систему
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TextField
        label="Имя пользователя"
        fullWidth
        margin="normal"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />

      <TextField
        label="Пароль"
        type="password"
        fullWidth
        margin="normal"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <Button
        type="submit"
        variant="contained"
        fullWidth
        sx={{ mt: 2 }}
      >
        Войти
      </Button>
    </Box>
  );
};

export default LoginForm;

