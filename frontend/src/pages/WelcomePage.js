// frontend/src/pages/WelcomePage.js

import React, { useState, useEffect, useContext } from 'react';
import {
  Box, Typography, Button, Link, Fade, Paper, TextField, Alert
} from '@mui/material';
import moscowImage from '../assets/moscow.jpg';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const WelcomePage = () => {
  const [showHeaderText, setShowHeaderText] = useState(false);
  const [isLogin, setIsLogin] = useState(false); // false — показываем регистрацию, true — вход
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  useEffect(() => {
    const timer = setTimeout(() => setShowHeaderText(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e) =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await axios.post('/api/register/', formData);
      setSuccess('Регистрация успешна! Теперь войдите.');
      setFormData({ username: '', email: '', password: '' });
      setIsLogin(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка при регистрации');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const response = await axios.post('/api/token/', {
        username: formData.username,
        password: formData.password,
      });
      login(response.data.access);
      navigate('/home');
    } catch (err) {
      setError('Ошибка входа: ' + (err.response?.data?.detail || err.message));
    }
  };

  if (!showHeaderText) return null;

  return (
    <Box
      sx={{
        height: '100vh',
        width: '100vw',
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
      <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.6)', zIndex: 0 }} />
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
        <Typography variant="h4" mt={4} sx={{ userSelect: 'none' }}>
          Добро пожаловать!
        </Typography>
      </Box>

      <Fade in timeout={500}>
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
            {isLogin ? (
              <>
                <Typography variant="h5" mb={2} fontWeight="bold" textAlign="center">
                  Вход
                </Typography>
                {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <form onSubmit={handleLogin}>
                  <TextField
                    label="Имя пользователя"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    required
                  />
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
                    Войти
                  </Button>
                </form>
                <Typography textAlign="center">
                  Нет аккаунта?{' '}
                  <Link component="button" onClick={() => {
                    setIsLogin(false);
                    setError('');
                    setSuccess('');
                    setFormData({ username: '', email: '', password: '' });
                  }}>
                    Зарегистрироваться
                  </Link>
                </Typography>
              </>
            ) : (
              <>
                <Typography variant="h5" mb={2} fontWeight="bold" textAlign="center">
                  Регистрация
                </Typography>
                {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <form onSubmit={handleRegister}>
                  <TextField
                    label="Имя пользователя"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    required
                  />
                  <TextField
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                  />
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
                    Зарегистрироваться
                  </Button>
                </form>
                <Typography textAlign="center">
                  Уже зарегистрированы?{' '}
                  <Link component="button" onClick={() => {
                    setIsLogin(true);
                    setError('');
                    setSuccess('');
                    setFormData({ username: '', email: '', password: '' });
                  }}>
                    Войти
                  </Link>
                </Typography>
              </>
            )}
          </Paper>
        </Box>
      </Fade>
    </Box>
  );
};

export default WelcomePage;
