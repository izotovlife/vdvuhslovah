// src/components/RegisterForm.js
import React, { useState } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function RegisterForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== password2) {
      setError('Пароли не совпадают');
      return;
    }

    try {
      await axios.post(`${process.env.REACT_APP_API}/register/`, {
        username,
        password,
      });
      // После успешной регистрации перенаправляем на страницу входа
      navigate('/login');
    } catch (err) {
      setError('Ошибка регистрации: ' + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" mb={2}>Регистрация</Typography>
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
      <TextField
        label="Подтвердите пароль"
        type="password"
        fullWidth
        margin="normal"
        value={password2}
        onChange={(e) => setPassword2(e.target.value)}
        required
      />
      {error && (
        <Typography color="error" variant="body2" mt={1}>
          {error}
        </Typography>
      )}
      <Button type="submit" variant="contained" sx={{ mt: 2 }} fullWidth>
        Зарегистрироваться
      </Button>
    </Box>
  );
}
