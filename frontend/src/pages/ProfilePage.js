// frontend/src/pages/ProfilePage.js

import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import {
  Box,
  Typography,
  Container,
  TextField,
  Button,
  Avatar,
  Tabs,
  Tab,
  Paper,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

export default function ProfilePage() {
  const { axiosInstance } = useContext(AuthContext);

  const [tabIndex, setTabIndex] = useState(0);
  const [profile, setProfile] = useState({});
  const [editData, setEditData] = useState({});
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackMessage, setSnackMessage] = useState('');
  const [snackOpen, setSnackOpen] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);

  useEffect(() => {
    axiosInstance.get('/profile/')
      .then(res => {
        setProfile(res.data);
        setEditData({
          first_name: res.data.first_name || '',
          last_name: res.data.last_name || '',
          email: res.data.email || '',
          phone: res.data.phone || '',
          city: res.data.city || '',
        });
      })
      .catch(console.error);
  }, [axiosInstance]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  const handleSave = () => {
    setLoading(true);
    const formData = new FormData();
    formData.append('first_name', editData.first_name);
    formData.append('last_name', editData.last_name);
    formData.append('email', editData.email);
    formData.append('phone', editData.phone);
    formData.append('city', editData.city);
    if (file) {
      formData.append('avatar', file);
    }

    axiosInstance.put('/profile/', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then(res => {
        setProfile(res.data);
        setLoading(false);
        setSnackMessage('Профиль успешно обновлен');
        setSnackOpen(true);
        setFile(null);
      })
      .catch(() => {
        setLoading(false);
        setSnackMessage('Ошибка при обновлении профиля');
        setSnackOpen(true);
      });
  };

  const handlePasswordChange = () => {
    window.location.href = '/change-password';
  };

  const handleDelete = () => {
    axiosInstance.delete('/profile/')
      .then(() => window.location.href = '/goodbye')
      .catch(console.error);
  };

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, flexDirection: 'column' }}>
        <Avatar
          src={file ? URL.createObjectURL(file) : profile.avatar}
          sx={{ width: 100, height: 100, mb: 2 }}
        />
        <Typography variant="h5">{profile.first_name} {profile.last_name}</Typography>
      </Box>

      <Tabs
        value={tabIndex}
        onChange={handleTabChange}
        aria-label="Profile tabs"
        centered
      >
        <Tab label="Основное" />
        <Tab label="Активность" />
      </Tabs>

      <TabPanel value={tabIndex} index={0}>
        <Box component="form" noValidate sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Имя"
            name="first_name"
            value={editData.first_name}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Фамилия"
            name="last_name"
            value={editData.last_name}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Email"
            name="email"
            value={editData.email}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Телефон"
            name="phone"
            value={editData.phone}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Город"
            name="city"
            value={editData.city}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />

          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ marginTop: 16, marginBottom: 16 }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button variant="contained" onClick={handleSave} disabled={loading}>
              {loading ? 'Сохраняю...' : 'Сохранить'}
            </Button>
            <Button variant="outlined" onClick={handlePasswordChange}>
              Сменить пароль
            </Button>
            <Button color="error" onClick={() => setOpenConfirm(true)}>
              Удалить профиль
            </Button>
          </Box>
        </Box>
      </TabPanel>

      <TabPanel value={tabIndex} index={1}>
        <Typography variant="h6" sx={{ mb: 2 }}>Публикации</Typography>
        {profile.posts && profile.posts.length > 0 ? profile.posts.map(post => (
          <Paper key={post.id} sx={{ p: 2, mb: 1 }}>
            <Typography>{post.content}</Typography>
            <Typography variant="caption" color="text.secondary">
              {new Date(post.created_at).toLocaleString()}
            </Typography>
          </Paper>
        )) : <Typography>Публикаций нет</Typography>}

        <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>Репосты</Typography>
        {profile.reposts && profile.reposts.length > 0 ? profile.reposts.map(repost => (
          <Paper key={repost.id} sx={{ p: 2, mb: 1 }}>
            <Typography>
              Репост от {typeof repost.user === 'object' ? (repost.user?.username || 'неизвестный') : repost.user} - оригинал: {repost.original_post?.content.slice(0, 50)}...
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {new Date(repost.created_at).toLocaleString()}
            </Typography>
          </Paper>
        )) : <Typography>Репостов нет</Typography>}

        <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>Понравившиеся публикации</Typography>
        {profile.liked_posts && profile.liked_posts.length > 0 ? profile.liked_posts.map(post => (
          <Paper key={post.id} sx={{ p: 2, mb: 1 }}>
            <Typography>{post.content}</Typography>
            <Typography variant="caption" color="text.secondary">
              {new Date(post.created_at).toLocaleString()}
            </Typography>
          </Paper>
        )) : <Typography>Нет понравившихся публикаций</Typography>}
      </TabPanel>

      <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
        <DialogTitle>Подтвердите удаление</DialogTitle>
        <DialogContent>
          Вы уверены, что хотите удалить профиль? Это действие необратимо.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirm(false)}>Отмена</Button>
          <Button color="error" onClick={handleDelete}>Удалить</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackOpen}
        autoHideDuration={6000}
        onClose={() => setSnackOpen(false)}
        message={snackMessage}
      />
    </Container>
  );
}
