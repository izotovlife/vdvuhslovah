// frontend/src/pages/ChangePasswordPage.js

import React, { useState, useContext } from 'react';
import axios from 'axios';
import { Box, TextField, Button, Typography, CircularProgress } from '@mui/material';
import { AuthContext } from '../context/AuthContext';

export default function ChangePasswordPage() {
  const { accessToken: token } = useContext(AuthContext);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword1, setNewPassword1] = useState('');
  const [newPassword2, setNewPassword2] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword1 !== newPassword2) {
      alert('Новые пароли не совпадают');
      return;
    }
    if (!token) return;

    setLoading(true);
    try {
      await axios.post('/api/change-password/', {
        old_password: oldPassword,
        new_password1: newPassword1,
        new_password2: newPassword2,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Пароль успешно изменён');
      setOldPassword('');
      setNewPassword1('');
      setNewPassword2('');
    } catch {
      alert('Ошибка при смене пароля');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 4 }} />;

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        maxWidth: 400,
        mx: 'auto',
        mt: 4,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <Typography variant="h5" align="center">
        Смена пароля
      </Typography>

      <TextField
        label="Текущий пароль"
        type="password"
        value={oldPassword}
        onChange={e => setOldPassword(e.target.value)}
        required
        fullWidth
      />
      <TextField
        label="Новый пароль"
        type="password"
        value={newPassword1}
        onChange={e => setNewPassword1(e.target.value)}
        required
        fullWidth
      />
      <TextField
        label="Подтвердите новый пароль"
        type="password"
        value={newPassword2}
        onChange={e => setNewPassword2(e.target.value)}
        required
        fullWidth
      />

      <Button type="submit" variant="contained" disabled={loading}>
        Сменить пароль
      </Button>
    </Box>
  );
}
