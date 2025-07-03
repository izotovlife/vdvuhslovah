// frontend/src/components/ProfileEdit.js

import React, { useState, useContext, useEffect } from 'react';
import { TextField, Button, Avatar, Typography, Box } from '@mui/material';
import { AuthContext } from '../context/AuthContext';

export default function ProfileEdit() {
  const { user, accessToken, fetchUser, axiosInstance } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    if (user) {
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setAvatarPreview(user.avatar || null);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('email', email);
    formData.append('phone', phone);
    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }

    try {
      await axiosInstance.put('/me/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await fetchUser(accessToken);
      alert('Профиль обновлён');
    } catch (error) {
      alert('Ошибка при обновлении профиля');
      console.error(error.response || error);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    setAvatarFile(file);
    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" mb={2}>Редактировать профиль</Typography>

      <Avatar
        src={avatarPreview}
        alt="Avatar"
        sx={{ width: 100, height: 100, mb: 2 }}
      />
      <Button variant="contained" component="label" sx={{ mb: 2 }}>
        Загрузить аватар
        <input hidden accept="image/*" type="file" onChange={handleAvatarChange} />
      </Button>

      <TextField
        fullWidth
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        label="Телефон"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        sx={{ mb: 2 }}
      />

      <Button type="submit" variant="contained" fullWidth>
        Сохранить изменения
      </Button>
    </Box>
  );
}
