// frontend/src/pages/ForgotPasswordPage.js

import React, { useState } from 'react';
import {
  Container, TextField, Button, Typography, Box, Snackbar, Alert,
} from '@mui/material';
import { sendPasswordResetEmail } from '../api';

function validateEmail(email) {
  // Простая проверка email
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setSnackbar({ open: true, message: 'Введите корректный email', severity: 'error' });
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(email);
      setSnackbar({ open: true, message: 'Ссылка для восстановления отправлена на email', severity: 'success' });
      setSent(true);
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.email?.[0] || error.response?.data?.detail || 'Ошибка отправки', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>Восстановление пароля</Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={sent}
          />
          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }} disabled={loading || sent}>
            {loading ? 'Отправка...' : sent ? 'Отправлено' : 'Отправить'}
          </Button>
        </form>
      </Box>
      <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
