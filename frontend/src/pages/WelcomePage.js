// frontend/src/pages/WelcomePage.js

import React, { useEffect, useState, useContext } from 'react';
import {
  Box, Typography, Button, Link, Fade, Paper, TextField, Alert
} from '@mui/material';
import { api, publicApi } from '../api';
import moscowImage from '../assets/moscow.jpg';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const WelcomePage = () => {
  const [showForm, setShowForm] = useState(false);
  const [showHeaderText, setShowHeaderText] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Получаем функцию login из контекста
  const { login } = useContext(AuthContext);

  useEffect(() => {
    const headerTimer = setTimeout(() => setShowHeaderText(true), 500);
    const formTimer = setTimeout(() => setShowForm(true), 4000);
    return () => {
      clearTimeout(headerTimer);
      clearTimeout(formTimer);
    };
  }, []);

  const handleChange = (e) =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await publicApi.post('/register/', formData); // Используем publicApi без токена
      setSuccess('Вы успешно зарегистрированы!');
      setFormData({ username: '', email: '', password: '' });
    } catch (err) {
      if (err.response?.data) {
        const messages = Object.values(err.response.data).flat().join(' ');
        setError(messages);
      } else {
        setError('Ошибка при регистрации.');
      }
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const response = await publicApi.post('/token/', { username: formData.username, password: formData.password });
      // Сохраняем токен в localStorage и обновляем контекст
      login(response.data.access);
      setSuccess('Вы успешно вошли!');
      setFormData({ username: '', email: '', password: '' });
      navigate('/home');
    } catch (err) {
      if (err.response?.data) {
        const messages = Object.values(err.response.data).flat().join(' ');
        setError(messages);
      } else {
        setError('Ошибка при входе.');
      }
    }
  };

  return (
    <Box
      sx={{
        height: '100vh',
        width: '100vw',
        maxWidth: '100vw',
        overflowX: 'hidden',
        backgroundImage: `url(${moscowImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1.2fr 1fr' },
        alignItems: 'center',
        px: { xs: 2, md: 6 },
        boxSizing: 'border-box',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          bgcolor: 'rgba(0, 0, 0, 0.6)',
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: 'relative',
          color: 'white',
          zIndex: 2,
          maxWidth: '100%',
          userSelect: 'none',
          mb: { xs: 4, md: 0 },
        }}
      >
        <Typography variant="h2" fontWeight="bold" sx={{ userSelect: 'none' }}>
          в Двух Словах
        </Typography>
        <Typography variant="subtitle1" mt={1}>
          российский сервис микроблогов
        </Typography>
        <Fade in={showHeaderText} timeout={800}>
          <Typography variant="h4" mt={4} sx={{ userSelect: 'none' }}>
            Добро пожаловать!
          </Typography>
        </Fade>
      </Box>
      <Fade in={showForm} timeout={1000}>
        <Box
          sx={{
            position: 'relative',
            zIndex: 2,
            width: '100%',
            maxWidth: 450,
            boxSizing: 'border-box',
          }}
        >
          <Paper elevation={10} sx={{ p: 4, borderRadius: 3 }}>
            <Typography variant="h5" mb={2} fontWeight="bold" textAlign="center">
              {isLogin ? 'Вход' : 'Регистрация'}
            </Typography>
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <form onSubmit={isLogin ? handleLogin : handleRegister}>
              <TextField
                label="Имя пользователя"
                name="username"
                value={formData.username}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
              />
              {!isLogin && (
                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  required
                />
              )}
              <TextField
                label="Пароль"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
              />
              <Button variant="contained" color="primary" type="submit" fullWidth sx={{ mt: 2, mb: 2 }}>
                {isLogin ? 'Войти' : 'Зарегистрироваться'}
              </Button>
            </form>
            <Typography textAlign="center">
              {isLogin ? (
                <>
                  Нет аккаунта?{' '}
                  <Link component="button" onClick={() => {
                    setIsLogin(false);
                    setSuccess('');
                    setError('');
                    setFormData({ username: '', email: '', password: '' });
                  }}>
                    Зарегистрироваться
                  </Link>
                </>
              ) : (
                <>
                  Уже зарегистрированы?{' '}
                  <Link component="button" onClick={() => {
                    setIsLogin(true);
                    setSuccess('');
                    setError('');
                    setFormData({ username: '', email: '', password: '' });
                  }}>
                    Войти
                  </Link>
                </>
              )}
            </Typography>
          </Paper>
        </Box>
      </Fade>
    </Box>
  );
};

export default WelcomePage;
