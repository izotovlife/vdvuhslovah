// src/components/LoginForm.js

// src/components/LoginForm.js

import React, { useState, useContext } from 'react';
import { TextField, Button, Box, Typography, Link } from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export default function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const tokenResponse = await axios.post(`${process.env.REACT_APP_API}/token/`, {
        username,
        password,
      });

      const { access, refresh } = tokenResponse.data;

      const userResponse = await axios.get(`${process.env.REACT_APP_API}/me/`, {
        headers: {
          Authorization: `Bearer ${access}`,
        },
      });

      const user = userResponse.data;
      login(user, access, refresh);
      navigate('/home');
    } catch (err) {
      setError('Ошибка входа: ' + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" mb={2}>Вход</Typography>
      <TextField
        label="Имя пользователя"
        fullWidth
        margin="normal"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <TextField
        label="Пароль"
        type="password"
        fullWidth
        margin="normal"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      {error && (
        <Typography color="error" variant="body2" mt={1}>
          {error}
        </Typography>
      )}

      <Box mt={1} textAlign="right">
        <Link component={RouterLink} to="/forgot-password" variant="body2">
          Забыли пароль?
        </Link>
      </Box>

      <Button type="submit" variant="contained" sx={{ mt: 2 }} fullWidth>
        Войти
      </Button>
    </Box>
  );
}
