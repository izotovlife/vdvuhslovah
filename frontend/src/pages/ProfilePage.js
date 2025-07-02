// frontend/src/pages/ProfilePage.js

import React, { useEffect, useState, useContext } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
} from '@mui/material';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const ProfilePage = () => {
  const { user, accessToken } = useContext(AuthContext);
  const [formData, setFormData] = useState({ email: '', phone: '' });
  const [editing, setEditing] = useState(false);
  const [userPosts, setUserPosts] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!accessToken) return;

    const fetchProfile = async () => {
      try {
        const response = await axios.get('/api/me/', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setFormData({
          email: response.data.email,
          phone: response.data.phone || '',
        });
      } catch (e) {
        console.error('Ошибка загрузки профиля:', e);
        setError('Ошибка загрузки профиля');
      }
    };

    const fetchPosts = async () => {
      if (!user || !user.id) {
        // Пользователь ещё не загружен — не запрашиваем посты
        return;
      }
      try {
        const response = await axios.get(`/api/posts/?author=${user.id}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setUserPosts(response.data);
      } catch (e) {
        console.error('Ошибка загрузки постов пользователя:', e);
        setError('Ошибка загрузки публикаций');
      }
    };

    fetchProfile();
    fetchPosts();
  }, [accessToken, user]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
    setSuccess('');
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');
    try {
      const response = await axios.put('/api/me/', formData, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setFormData({
        email: response.data.email,
        phone: response.data.phone || '',
      });
      setEditing(false);
      setSuccess('Профиль успешно сохранён');
    } catch (e) {
      console.error('Ошибка сохранения профиля:', e);
      if (e.response?.data) {
        setError(JSON.stringify(e.response.data));
      } else {
        setError('Ошибка при сохранении профиля');
      }
    }
  };

  if (!user) {
    return <Typography sx={{ mt: 4, textAlign: 'center' }}>Загрузка профиля...</Typography>;
  }

  return (
    <Box maxWidth="sm" mx="auto" p={3}>
      <Typography variant="h4" mb={3}>Личный кабинет</Typography>

      <Box mb={2}>
        <Typography variant="subtitle1" fontWeight="bold">Имя пользователя:</Typography>
        <Typography>{user?.username}</Typography>
      </Box>

      <Box mb={2}>
        <Typography variant="subtitle1" fontWeight="bold">Email:</Typography>
        {editing ? (
          <TextField
            name="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
            type="email"
          />
        ) : (
          <Typography>{formData.email}</Typography>
        )}
      </Box>

      <Box mb={2}>
        <Typography variant="subtitle1" fontWeight="bold">Телефон:</Typography>
        {editing ? (
          <TextField
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            fullWidth
          />
        ) : (
          <Typography>{formData.phone || 'Не указано'}</Typography>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {editing ? (
        <Box display="flex" gap={2} mt={2}>
          <Button variant="contained" color="primary" onClick={handleSave}>
            Сохранить
          </Button>
          <Button variant="outlined" onClick={() => setEditing(false)}>
            Отмена
          </Button>
        </Box>
      ) : (
        <Button variant="contained" onClick={() => setEditing(true)}>
          Редактировать
        </Button>
      )}

      <Divider sx={{ my: 4 }} />

      <Typography variant="h5" mb={2}>Мои публикации</Typography>
      {userPosts.length === 0 ? (
        <Typography>Публикаций пока нет.</Typography>
      ) : (
        <List>
          {userPosts.map(post => (
            <ListItem key={post.id} alignItems="flex-start">
              <ListItemText
                primary={post.content}
                secondary={`Лайков: ${post.like_count} | Репостов: ${post.repost_count}`}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default ProfilePage;

