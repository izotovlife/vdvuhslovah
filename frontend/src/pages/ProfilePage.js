//C:\Users\ASUS Vivobook\PycharmProjects\PythonProject1\vdvuhslovah\frontend\src\pages\ProfilePage.js

import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import {
  TextField,
  Button,
  Avatar,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import { AuthContext } from '../context/AuthContext';

export default function ProfilePage() {
  const { accessToken: token } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    first_name: '',
    last_name: '',
    avatar: null,
  });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;

    setLoading(true);
    axios
      .get('/api/profile/', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const data = res.data;
        setFormData({
          email: data.email || '',
          phone: data.phone || '',
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          avatar: null,
        });
        setPreview(data.avatar || null);
      })
      .catch(() => {
        // Обработка ошибки
      })
      .finally(() => setLoading(false));
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({ ...prev, avatar: file }));
    if (file) {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
      setPreview(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!token) return;

    const data = new FormData();
    data.append('email', formData.email);
    data.append('phone', formData.phone);
    data.append('first_name', formData.first_name);
    data.append('last_name', formData.last_name);
    if (formData.avatar) data.append('avatar', formData.avatar);

    setLoading(true);
    axios
      .put('/api/profile/', data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((res) => {
        alert('Профиль обновлен');
        if (res.data.avatar) setPreview(res.data.avatar);
        setFormData((prev) => ({ ...prev, avatar: null }));
      })
      .catch(() => alert('Ошибка при обновлении'))
      .finally(() => setLoading(false));
  };

  if (loading) return <CircularProgress />;

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
      encType="multipart/form-data"
    >
      <Typography variant="h5" align="center">
        Редактировать профиль
      </Typography>

      <Avatar
        src={preview || ''}
        alt="Аватар"
        sx={{ width: 100, height: 100, mx: 'auto', mb: 2, objectFit: 'cover' }}
      />

      <Button variant="contained" component="label" sx={{ mb: 2 }}>
        Загрузить фото
        <input type="file" hidden accept="image/*" onChange={handleFileChange} />
      </Button>

      <TextField
        label="Имя"
        name="first_name"
        value={formData.first_name}
        onChange={handleChange}
        fullWidth
      />
      <TextField
        label="Фамилия"
        name="last_name"
        value={formData.last_name}
        onChange={handleChange}
        fullWidth
      />
      <TextField
        label="Телефон"
        name="phone"
        value={formData.phone}
        onChange={handleChange}
        fullWidth
      />
      <TextField
        label="Email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        fullWidth
      />

      <Button type="submit" variant="contained" color="primary" disabled={loading}>
        Сохранить
      </Button>
    </Box>
  );
}
