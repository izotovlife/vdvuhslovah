// frontend/src/pages/RegisterPage.js

import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { TextField, Button, Typography, Container, Box, Alert, Link } from '@mui/material';
import api from '../api'; // импорт вашего axios с базовым URL и настройками

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError('Введите имя пользователя');
      return false;
    }
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      setError('Введите корректный email');
      return false;
    }
    if (!formData.password || formData.password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!validateForm()) return;

    try {
      await api.post('/register/', formData);
      navigate('/login');
    } catch (err) {
      const data = err.response?.data;
      if (data) {
        if (typeof data === 'string') setError(data);
        else if (data.detail) setError(data.detail);
        else if (data.username) setError(data.username.join(' '));
        else if (data.email) setError(data.email.join(' '));
        else if (data.password) setError(data.password.join(' '));
        else setError('Ошибка при регистрации');
      } else {
        setError('Ошибка сети или сервера');
      }
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, p: 4, boxShadow: 3, borderRadius: 2, backgroundColor: 'white' }}>
        <Typography variant="h5" align="center" gutterBottom>
          Регистрация
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <form onSubmit={handleSubmit}>
          <TextField
            label="Имя пользователя"
            name="username"
            fullWidth
            required
            margin="normal"
            value={formData.username}
            onChange={handleChange}
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            fullWidth
            margin="normal"
            value={formData.email}
            onChange={handleChange}
          />
          <TextField
            label="Пароль"
            name="password"
            type="password"
            fullWidth
            required
            margin="normal"
            value={formData.password}
            onChange={handleChange}
          />
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
            Зарегистрироваться
          </Button>
        </form>
        <Typography align="center" sx={{ mt: 2 }}>
          Уже зарегистрированы?{' '}
          <Link component={RouterLink} to="/login" underline="hover">
            Войти
          </Link>
        </Typography>
      </Box>
    </Container>
  );
};

export default RegisterPage;
