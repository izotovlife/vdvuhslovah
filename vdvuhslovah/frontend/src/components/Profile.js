//C:\Users\ASUS Vivobook\PycharmProjects\PythonProject\vdvuhslovah\frontend\src\components\Profile.js

import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Alert, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Формы
  const [emailForm, setEmailForm] = useState({
    new_email: '',
    current_password: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    old_password: '',
    new_password1: '',
    new_password2: '',
  });

  // Ошибки валидации
  const [emailErrors, setEmailErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});

  // Проверка аутентификации при загрузке
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Обработка изменения email
  const handleEmailChange = async (e) => {
    e.preventDefault();

    // Валидация
    const errors = {};
    if (!emailForm.new_email) errors.new_email = 'Введите новый email';
    if (!emailForm.current_password) errors.current_password = 'Введите текущий пароль';

    if (Object.keys(errors).length > 0) {
      setEmailErrors(errors);
      return;
    }

    try {
      setLoading(true);
      setError('');

      await api.patch('/api/users/me/update_email/', {
        email: emailForm.new_email,
        current_password: emailForm.current_password
      });

      setSuccess('Email успешно изменен!');
      setEmailForm({ new_email: '', current_password: '' });

      // Обновляем данные пользователя
      logout();
      navigate('/login');
    } catch (error) {
      console.error('Ошибка изменения email:', error);

      if (error.response?.data) {
        setError('Ошибка изменения email');
        setEmailErrors(error.response.data);
      } else {
        setError('Неизвестная ошибка при изменении email');
      }
    } finally {
      setLoading(false);
    }
  };

  // Обработка изменения пароля
  const handlePasswordChange = async (e) => {
    e.preventDefault();

    // Валидация
    const errors = {};
    if (!passwordForm.new_password1) errors.new_password1 = 'Введите новый пароль';
    if (!passwordForm.new_password2) errors.new_password2 = 'Подтвердите пароль';
    if (!passwordForm.old_password) errors.old_password = 'Введите текущий пароль';

    if (passwordForm.new_password1 !== passwordForm.new_password2) {
      errors.new_password2 = 'Пароли не совпадают';
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    try {
      setLoading(true);
      setError('');

      await api.post('/api/password/change/', {
        old_password: passwordForm.old_password,
        new_password1: passwordForm.new_password1,
        new_password2: passwordForm.new_password2
      });

      setSuccess('Пароль успешно изменен!');
      setPasswordForm({ old_password: '', new_password1: '', new_password2: '' });

      // Выход пользователя после смены пароля
      logout();
      navigate('/login');
    } catch (error) {
      console.error('Ошибка изменения пароля:', error);

      if (error.response?.data) {
        setError('Ошибка изменения пароля');
        setPasswordErrors(error.response.data);
      } else {
        setError('Неизвестная ошибка при изменении пароля');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 600, margin: '40px auto', padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Личный кабинет
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Информация о пользователе
        </Typography>
        <Typography><strong>Имя пользователя:</strong> {user.username}</Typography>
        <Typography><strong>Email:</strong> {user.email || 'Не указан'}</Typography>
        <Typography><strong>Дата регистрации:</strong> {new Date(user.date_joined).toLocaleDateString()}</Typography>
      </Box>

      {/* Форма смены email */}
      <Box component="form" onSubmit={handleEmailChange} sx={{ mb: 4, p: 3, border: '1px solid #ddd', borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>
          Изменить email
        </Typography>

        <TextField
          fullWidth
          label="Новый email"
          type="email"
          value={emailForm.new_email}
          onChange={(e) => setEmailForm({...emailForm, new_email: e.target.value})}
          margin="normal"
          error={!!emailErrors.new_email}
          helperText={emailErrors.new_email}
          autoComplete="off"
        />

        <TextField
          fullWidth
          label="Текущий пароль"
          type="password"
          value={emailForm.current_password}
          onChange={(e) => setEmailForm({...emailForm, current_password: e.target.value})}
          margin="normal"
          error={!!emailErrors.current_password}
          helperText={emailErrors.current_password}
          autoComplete="current-password"
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Сохранить email'}
        </Button>
      </Box>

      {/* Форма смены пароля */}
      <Box component="form" onSubmit={handlePasswordChange} sx={{ p: 3, border: '1px solid #ddd', borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>
          Изменить пароль
        </Typography>

        <TextField
          fullWidth
          label="Новый пароль"
          type="password"
          value={passwordForm.new_password1}
          onChange={(e) => setPasswordForm({...passwordForm, new_password1: e.target.value})}
          margin="normal"
          error={!!passwordErrors.new_password1}
          helperText={passwordErrors.new_password1}
          autoComplete="new-password"
        />

        <TextField
          fullWidth
          label="Подтвердите пароль"
          type="password"
          value={passwordForm.new_password2}
          onChange={(e) => setPasswordForm({...passwordForm, new_password2: e.target.value})}
          margin="normal"
          error={!!passwordErrors.new_password2}
          helperText={passwordErrors.new_password2}
          autoComplete="new-password"
        />

        <TextField
          fullWidth
          label="Текущий пароль"
          type="password"
          value={passwordForm.old_password}
          onChange={(e) => setPasswordForm({...passwordForm, old_password: e.target.value})}
          margin="normal"
          error={!!passwordErrors.old_password}
          helperText={passwordErrors.old_password}
          autoComplete="current-password"
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Изменить пароль'}
        </Button>
      </Box>
    </Box>
  );
};

export default Profile;