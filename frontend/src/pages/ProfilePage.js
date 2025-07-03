// frontend/src/pages/ProfilePage.js

import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import {
  TextField,
  Button,
  Avatar,
  Typography,
  Box,
  CircularProgress,
  Stack,
  Snackbar,
  Alert,
} from '@mui/material';
import { AuthContext } from '../context/AuthContext';

export default function ProfilePage() {
  const { accessToken: token, updateUser } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    first_name: '',
    last_name: '',
    avatar: null,
  });
  const [savedData, setSavedData] = useState({
    email: '',
    phone: '',
    first_name: '',
    last_name: '',
    avatar: null,
  });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    if (!token) return;

    setLoading(true);
    axios
      .get('/api/profile/', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const data = res.data;
        const profileData = {
          email: data.email || '',
          phone: data.phone || '',
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          avatar: data.avatar || null,
        };
        setFormData({ ...profileData, avatar: null });
        setSavedData(profileData);
        setPreview(data.avatar || null);
      })
      .catch(() => {
        showSnackbar('Ошибка при загрузке профиля', 'error');
      })
      .finally(() => setLoading(false));
  }, [token]);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({ ...prev, avatar: file }));
    if (file) {
      if (preview) URL.revokeObjectURL(preview);
      setPreview(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
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
        showSnackbar('Профиль обновлен', 'success');

        const updatedData = {
          email: res.data.email || formData.email,
          phone: res.data.phone || formData.phone,
          first_name: res.data.first_name || formData.first_name,
          last_name: res.data.last_name || formData.last_name,
          avatar: res.data.avatar || preview,
        };
        setSavedData(updatedData);
        setFormData((prev) => ({ ...prev, avatar: null }));
        setPreview(updatedData.avatar);
        setIsEditing(false);

        if (updateUser) {
          updateUser({ avatar: updatedData.avatar });
        }
      })
      .catch(() => {
        showSnackbar('Ошибка при обновлении', 'error');
      })
      .finally(() => setLoading(false));
  };

  if (loading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 4 }} />;

  if (!isEditing) {
    return (
      <Box sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}>
        <Typography variant="h5" align="center" mb={2}>
          Профиль
        </Typography>

        <Avatar
          src={savedData.avatar || ''}
          alt="Аватар"
          sx={{ width: 100, height: 100, mx: 'auto', mb: 2, objectFit: 'cover' }}
        />

        <Stack spacing={1} sx={{ mb: 2 }}>
          <Typography><strong>Имя:</strong> {savedData.first_name || '-'}</Typography>
          <Typography><strong>Фамилия:</strong> {savedData.last_name || '-'}</Typography>
          <Typography><strong>Телефон:</strong> {savedData.phone || '-'}</Typography>
          <Typography><strong>Email:</strong> {savedData.email || '-'}</Typography>
        </Stack>

        <Button variant="contained" fullWidth onClick={() => setIsEditing(true)}>
          Редактировать
        </Button>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    );
  }

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

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
