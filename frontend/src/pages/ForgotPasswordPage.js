// frontend/src/pages/ForgotPasswordPage.js

import React, { useState } from 'react';
import {
  Container, TextField, Button, Typography, Box, Snackbar, Alert,
} from '@mui/material';
import { sendPasswordResetEmail } from '../api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(email);
      setSnackbar({ open: true, message: 'Ссылка для восстановления отправлена на email', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.email?.[0] || error.response?.data?.detail || 'Ошибка отправки', severity: 'error' });
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
          />
          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>Отправить</Button>
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