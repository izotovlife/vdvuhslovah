// frontend/src/components/ProfileEdit.js

import React, { useState, useEffect } from 'react';
import axios from '../api';
import { Box, TextField, Button, Avatar } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function ProfileEdit() {
  const [avatar, setAvatar] = useState(null);
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/profile/')
      .then(res => {
        setBio(res.data.bio || '');
        setPhone(res.data.phone || '');
        setAvatar(res.data.avatar || null);
      })
      .catch(() => alert('Ошибка при загрузке данных профиля'));
  }, []);

  const handleAvatarChange = (e) => {
    if (e.target.files.length > 0) {
      setAvatar(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    if (avatar instanceof File) formData.append('avatar', avatar);
    formData.append('bio', bio);
    formData.append('phone', phone);

    try {
      await axios.put('/profile/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('Профиль обновлён');
      navigate('/profile');
    } catch {
      alert('Ошибка при сохранении профиля');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Avatar
        src={avatar instanceof File ? URL.createObjectURL(avatar) : avatar}
        sx={{ width: 100, height: 100, mb: 2 }}
      />
      <Button variant="outlined" component="label" sx={{ mb: 2 }}>
        Загрузить аватар
        <input hidden type="file" accept="image/*" onChange={handleAvatarChange} />
      </Button>
      <TextField
        label="Биография"
        multiline
        minRows={3}
        fullWidth
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        sx={{ mb: 2 }}
      />
      <TextField
        label="Телефон"
        fullWidth
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        sx={{ mb: 2 }}
      />
      <Button type="submit" variant="contained">Сохранить</Button>
    </Box>
  );
}
