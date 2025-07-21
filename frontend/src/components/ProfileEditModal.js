// frontend/src/components/ProfileEditModal.js
// Модальное окно редактирования профиля с загрузкой аватара и баннера

import React, { useState, useEffect, useContext } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Avatar,
  CircularProgress,
  Typography,
} from '@mui/material';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const ProfileEditModal = ({ open, onClose, profile, onSave }) => {
  const { token } = useContext(AuthContext);

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [bannerPreview, setBannerPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (profile && open) {
      setDisplayName(profile.display_name || '');
      setBio(profile.bio || '');
      setAvatarPreview(profile.avatar || '');
      setBannerPreview(profile.banner || '');
      setAvatarFile(null);
      setBannerFile(null);
      setError('');
    }
  }, [profile, open]);

  const handleAvatarChange = e => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleBannerChange = e => {
    const file = e.target.files[0];
    if (file) {
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('display_name', displayName);
      formData.append('bio', bio);
      if (avatarFile) formData.append('avatar', avatarFile);
      if (bannerFile) formData.append('banner', bannerFile);

      await axios.put(`/api/profile/${profile.username}/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      onSave();
      onClose();
    } catch (e) {
      setError('Ошибка при сохранении профиля');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Редактировать профиль</DialogTitle>
      <DialogContent dividers>
        <Box display="flex" gap={2} mb={2}>
          <Box>
            <Avatar
              src={avatarPreview}
              alt="Аватар"
              sx={{ width: 80, height: 80, mb: 1 }}
              variant="rounded"
            />
            <Button variant="outlined" component="label" size="small" fullWidth>
              Загрузить аватар
              <input type="file" hidden accept="image/*" onChange={handleAvatarChange} />
            </Button>
          </Box>
          <Box flex={1}>
            <TextField
              label="Имя для отображения"
              fullWidth
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              margin="dense"
            />
            <TextField
              label="Биография"
              fullWidth
              multiline
              minRows={3}
              value={bio}
              onChange={e => setBio(e.target.value)}
              margin="dense"
            />
          </Box>
        </Box>

        <Box mb={2}>
          <Typography variant="body2" gutterBottom>
            Баннер
          </Typography>
          {bannerPreview && (
            <Box
              component="img"
              src={bannerPreview}
              alt="Баннер"
              sx={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 1, mb: 1 }}
            />
          )}
          <Button variant="outlined" component="label" size="small">
            Загрузить баннер
            <input type="file" hidden accept="image/*" onChange={handleBannerChange} />
          </Button>
        </Box>

        {error && (
          <Typography color="error" variant="body2" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Отмена</Button>
        <Button onClick={handleSubmit} disabled={loading} variant="contained">
          {loading ? <CircularProgress size={24} /> : 'Сохранить'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProfileEditModal;
