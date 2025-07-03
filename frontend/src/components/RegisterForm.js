// src/components/RegisterForm.js

import React, { useState } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (formData.password !== formData.password2) {
      setErrors({ password2: 'Пароли не совпадают' });
      return;
    }

    try {
      await axios.post(`${process.env.REACT_APP_API}/register/`, formData);
      navigate('/login');
    } catch (err) {
      if (err.response?.data) {
        setErrors(err.response.data); // Ожидаем объект с ошибками по полям
      } else {
        setErrors({ non_field_errors: 'Ошибка регистрации. Попробуйте позже.' });
      }
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" mb={2}>Регистрация</Typography>

      <TextField
        label="Имя пользователя"
        name="username"
        fullWidth
        margin="normal"
        value={formData.username}
        onChange={handleChange}
        required
        error={Boolean(errors.username)}
        helperText={errors.username?.join(' ')}
      />

      <TextField
        label="Email"
        name="email"
        type="email"
        fullWidth
        margin="normal"
        value={formData.email}
        onChange={handleChange}
        required
        error={Boolean(errors.email)}
        helperText={errors.email?.join(' ')}
      />

      <TextField
        label="Пароль"
        name="password"
        type="password"
        fullWidth
        margin="normal"
        value={formData.password}
        onChange={handleChange}
        required
        error={Boolean(errors.password)}
        helperText={errors.password?.join(' ')}
      />

      <TextField
        label="Подтвердите пароль"
        name="password2"
        type="password"
        fullWidth
        margin="normal"
        value={formData.password2}
        onChange={handleChange}
        required
        error={Boolean(errors.password2)}
        helperText={errors.password2?.join(' ')}
      />

      {errors.non_field_errors && (
        <Typography color="error" variant="body2" mt={1}>
          {errors.non_field_errors}
        </Typography>
      )}

      <Button type="submit" variant="contained" sx={{ mt: 2 }} fullWidth>
        Зарегистрироваться
      </Button>
    </Box>
  );
}
