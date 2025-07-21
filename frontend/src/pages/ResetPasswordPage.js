// frontend/src/pages/ResetPasswordPage.js

import React, { useState, useEffect } from 'react';
import {
  Container, TextField, Button, Typography, Box, Snackbar, Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { resetPassword } from '../api';

export default function ResetPasswordPage() {
  const [uid, setUid] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const uidParam = params.get('uid');
    const tokenParam = params.get('token');
    if (uidParam && tokenParam) {
      setUid(uidParam);
      setToken(tokenParam);
    } else {
      setSnackbar({ open: true, message: 'Неверная ссылка для сброса', severity: 'error' });
    }
  }, []);

  // Проверка сложности пароля
  const validatePassword = (pwd) => {
    const hasLower = /[a-z]/.test(pwd);
    const hasUpper = /[A-Z]/.test(pwd);
    const hasDigit = /\d/.test(pwd);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
    return hasLower && hasUpper && hasDigit && hasSpecial;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirm) {
      setSnackbar({ open: true, message: 'Пароли не совпадают', severity: 'error' });
      return;
    }

    if (!validatePassword(password)) {
      setSnackbar({
        open: true,
        message: 'Пароль должен содержать строчные и заглавные латинские буквы, цифры и специальные символы',
        severity: 'error'
      });
      return;
    }

    try {
      setLoading(true);
      await resetPassword(uid, token, password);
      setSnackbar({ open: true, message: 'Пароль обновлён', severity: 'success' });
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      const errData = error.response?.data || {};
      const msg = errData?.new_password?.[0] || errData?.token || errData?.uid || 'Ошибка';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>Сброс пароля</Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Новый пароль"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            helperText="Пароль должен содержать строчные, заглавные буквы, цифры и спецсимволы"
          />
          <TextField
            label="Подтвердите пароль"
            type="password"
            fullWidth
            margin="normal"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            fullWidth
            sx={{ mt: 2 }}
          >
            {loading ? 'Загрузка...' : 'Сбросить пароль'}
          </Button>
        </form>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
}
