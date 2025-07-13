// frontend\src\pages\RegisterPage.js

import React, { useState, useMemo } from 'react'; // Убираем import useNavigate
import { TextField, Button, IconButton, InputAdornment, Typography, Box, Alert, Tooltip } from '@mui/material';
import { Visibility, VisibilityOff, Refresh } from '@mui/icons-material';
import { publicApi } from '../api';

const RegisterPage = ({ onSwitchToLogin }) => {  // Пропс для переключения на форму входа
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  const passwordRequirements = useMemo(() => ({
    minLength: formData.password.length >= 6,
    hasUpperCase: /[A-Z]/.test(formData.password),
    hasNumber: /\d/.test(formData.password),
  }), [formData.password]);

  const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let pwd = 'A1'; // гарантируем заглавную и цифру
    while (pwd.length < 10) {
      pwd += chars[Math.floor(Math.random() * chars.length)];
    }
    setFormData(prev => ({ ...prev, password: pwd }));
  };

  const handleChange = e => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.username || !formData.email || !formData.password) {
      setError('Все поля обязательны');
      return;
    }

    if (!passwordRequirements.minLength || !passwordRequirements.hasUpperCase || !passwordRequirements.hasNumber) {
      setError('Пароль не соответствует требованиям');
      return;
    }

    setLoading(true);
    try {
      await publicApi.post('/register/', formData);
      setSuccess('Регистрация прошла успешно. Проверьте вашу электронную почту.');

      // Переключение на форму входа через 5 секунд после успешной регистрации
      setTimeout(() => {
        onSwitchToLogin();  // Вызов пропса для переключения
      }, 5000);

    } catch (err) {
      const errMsg =
        err.response?.data?.username?.[0] ||
        err.response?.data?.email?.[0] ||
        err.response?.data?.password?.[0] ||
        err.response?.data?.detail ||
        'Ошибка регистрации';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 400, mx: 'auto', mt: 5 }}>
      <Typography variant="h5" align="center" gutterBottom>Регистрация</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <TextField
        name="username"
        label="Имя пользователя"
        fullWidth
        margin="normal"
        value={formData.username}
        onChange={handleChange}
      />
      <TextField
        name="email"
        label="Email"
        type="email"
        fullWidth
        margin="normal"
        value={formData.email}
        onChange={handleChange}
      />
      <TextField
        name="password"
        label="Пароль"
        type={showPassword ? 'text' : 'password'}
        fullWidth
        margin="normal"
        value={formData.password}
        onChange={handleChange}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Tooltip title="Сгенерировать пароль">
                <IconButton onClick={generatePassword} edge="end">
                  <Refresh />
                </IconButton>
              </Tooltip>
              <Tooltip title={showPassword ? 'Скрыть пароль' : 'Показать пароль'}>
                <IconButton onClick={() => setShowPassword(p => !p)} edge="end">
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </Tooltip>
            </InputAdornment>
          ),
        }}
      />

      <Box sx={{ mt: 1, mb: 2 }}>
        <Typography variant="caption" color={passwordRequirements.minLength ? 'success.main' : 'error.main'}>
          {passwordRequirements.minLength ? '✔' : '✖'} минимум 6 символов
        </Typography><br />
        <Typography variant="caption" color={passwordRequirements.hasUpperCase ? 'success.main' : 'error.main'}>
          {passwordRequirements.hasUpperCase ? '✔' : '✖'} одна заглавная буква
        </Typography><br />
        <Typography variant="caption" color={passwordRequirements.hasNumber ? 'success.main' : 'error.main'}>
          {passwordRequirements.hasNumber ? '✔' : '✖'} одна цифра
        </Typography>
      </Box>

      <Button
        type="submit"
        variant="contained"
        fullWidth
        disabled={loading}
      >
        {loading ? 'Регистрация...' : 'Зарегистрироваться'}
      </Button>
    </Box>
  );
};

export default RegisterPage;
