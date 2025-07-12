// frontend/src/pages/RegisterPage.js

import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  TextField,
  Button,
  Typography,
  Container,
  Box,
  Alert,
  Link,
  IconButton,
  InputAdornment,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import { Visibility, VisibilityOff, Refresh } from '@mui/icons-material';
import { publicApi } from '../api';

const RegisterPage = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const passwordRequirements = useMemo(() => ({
    minLength: formData.password.length >= 6,
    hasUpperCase: /[A-Z]/.test(formData.password),
    hasNumber: /\d/.test(formData.password),
  }), [formData.password]);

  const passwordStrength = useCallback(() => {
    let strength = 0;
    Object.values(passwordRequirements).forEach(met => {
      if (met) strength += 33;
    });
    if (formData.password.length > 10) strength += 10;
    if (formData.password.length > 15) strength += 10;
    return Math.min(strength, 100);
  }, [passwordRequirements, formData.password]);

  const generatePassword = useCallback(() => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const digits = '0123456789';
    const specials = '!@#$%^&*()_+-=';
    const all = uppercase + lowercase + digits + specials;

    let password = '';
    password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
    password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
    password += digits.charAt(Math.floor(Math.random() * digits.length));
    while (password.length < 10) {
      password += all.charAt(Math.floor(Math.random() * all.length));
    }
    return password.split('').sort(() => 0.5 - Math.random()).join('');
  }, []);

  const handleChange = e => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const toggleShowPassword = () => setShowPassword(prev => !prev);

  const handleGeneratePassword = () => {
    const newPassword = generatePassword();
    setFormData(prev => ({ ...prev, password: newPassword }));
    setPasswordFocused(true);
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError('Введите имя пользователя');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Введите email');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Введите корректный email');
      return false;
    }
    if (!passwordRequirements.minLength) {
      setError('Пароль должен быть не менее 6 символов');
      return false;
    }
    if (!passwordRequirements.hasUpperCase) {
      setError('Пароль должен содержать заглавную букву');
      return false;
    }
    if (!passwordRequirements.hasNumber) {
      setError('Пароль должен содержать цифру');
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setError(null);
    try {
      await publicApi.post('/register', formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  const strength = passwordStrength();
  const strengthLabel = strength < 40 ? 'Слабый' : strength < 70 ? 'Средний' : 'Надёжный';
  const strengthColor = strength < 40 ? 'error' : strength < 70 ? 'warning' : 'success';

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, p: 4, boxShadow: 3, borderRadius: 2, bgcolor: 'background.paper' }}>
        <Typography variant="h5" align="center" gutterBottom>
          Регистрация
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <form onSubmit={handleSubmit} noValidate>
          <TextField
            label="Имя пользователя"
            name="username"
            fullWidth
            required
            margin="normal"
            value={formData.username}
            onChange={handleChange}
            disabled={loading}
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            fullWidth
            required
            margin="normal"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
          />
          <TextField
            label="Пароль"
            name="password"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            required
            margin="normal"
            value={formData.password}
            onChange={handleChange}
            onFocus={() => setPasswordFocused(true)}
            onBlur={() => setPasswordFocused(false)}
            disabled={loading}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title="Сгенерировать пароль">
                    <IconButton
                      onClick={handleGeneratePassword}
                      edge="end"
                      color="primary"
                      type="button"
                      disabled={loading}
                    >
                      <Refresh />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={showPassword ? "Скрыть пароль" : "Показать пароль"}>
                    <IconButton
                      onClick={toggleShowPassword}
                      edge="end"
                      color="primary"
                      type="button"
                      disabled={loading}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              )
            }}
          />

          {formData.password && (
            <Box sx={{ mt: 1, mb: 1 }}>
              <LinearProgress
                variant="determinate"
                value={strength}
                color={strengthColor}
                sx={{ height: 8, borderRadius: 4 }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                <Typography variant="caption" color={`${strengthColor}.main`}>
                  Сложность: {strengthLabel}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {strength}%
                </Typography>
              </Box>
            </Box>
          )}

          {(passwordFocused || formData.password) && (
            <Box sx={{ mt: 1, mb: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Пароль должен содержать:
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1 }}>
                <Typography variant="caption" color={passwordRequirements.minLength ? 'success.main' : 'error.main'}>
                  {passwordRequirements.minLength ? '✔' : '✖'} Не менее 6 символов
                </Typography>
                <Typography variant="caption" color={passwordRequirements.hasUpperCase ? 'success.main' : 'error.main'}>
                  {passwordRequirements.hasUpperCase ? '✔' : '✖'} Заглавная буква
                </Typography>
                <Typography variant="caption" color={passwordRequirements.hasNumber ? 'success.main' : 'error.main'}>
                  {passwordRequirements.hasNumber ? '✔' : '✖'} Цифра
                </Typography>
              </Box>
            </Box>
          )}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
            disabled={loading}
          >
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </Button>
        </form>

        <Typography align="center" sx={{ mt: 2 }}>
          Уже зарегистрированы?{' '}
          <Link component={RouterLink} to="/login" underline="hover" sx={{ cursor: 'pointer' }}>
            Войти
          </Link>
        </Typography>
      </Box>
    </Container>
  );
};

export default RegisterPage;
