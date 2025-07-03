// src/components/LoginForm.js

import React, { useState, useContext } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export default function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Шаг 1: Получаем токены
      const tokenResponse = await axios.post(`${process.env.REACT_APP_API}/token/`, {
        username,
        password,
      });

      const { access, refresh } = tokenResponse.data;

      // Шаг 2: Получаем пользователя
      const userResponse = await axios.get(`${process.env.REACT_APP_API}/me/`, {
        headers: {
          Authorization: `Bearer ${access}`,
        },
      });

      const user = userResponse.data;

      // Шаг 3: Сохраняем пользователя и токены
      login(user, access, refresh);

      // Шаг 4: Переход на домашнюю страницу
      navigate('/home');
    } catch (err) {
      setError('Ошибка входа: ' + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" mb={2}>Вход</Typography>
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
      {error && (
        <Typography color="error" variant="body2" mt={1}>
          {error}
        </Typography>
      )}
      <Button type="submit" variant="contained" sx={{ mt: 2 }} fullWidth>
        Войти
      </Button>
    </Box>
  );
}
